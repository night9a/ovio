import os
import subprocess
import platform
from pathlib import Path

TARGETS = [
    ("linux", "amd64", ""),
    #("freebsd", "amd64", ""),
    #("windows", "amd64", "exe"),
]

def build(pdir: str) -> str:
    pdir = Path(pdir).resolve()
    print("BUILD DIR (source):", pdir)

    # pdir = backend/storage/export/source/<pid>
    pid = pdir.name

    # backend/storage/export/build/<pid>
    build_root = pdir.parent.parent / "build" / pid
    build_root.mkdir(parents=True, exist_ok=True)

    print("BUILD OUTPUT DIR:", build_root)

    go_mod = pdir / "go.mod"
    if not go_mod.exists():
        go_mod.write_text(GO_MOD_TEMPLATE)
        print(f"go.mod created at {go_mod}")

    # fetch deps
    subprocess.run(
        ["go", "mod", "tidy"],
        cwd=pdir,
        check=True
    )
    print("go.sum generated/updated")

    app_name = pid
    host_goos = platform.system().strip().lower()  # linux, freebsd, windows, darwin, ...
    built_any = False
    failures: list[tuple[str, str]] = []

    for goos, goarch, ext in TARGETS:
        name = f"{app_name}-{goos}-{goarch}"
        if ext:
            name += f".{ext}"

        env = os.environ.copy()
        # Gio desktop backends require CGO on unix (X11/Wayland/OpenGL).
        # Cross-compiling with CGO often needs a cross C toolchain, so we only
        # enable CGO for native builds (target OS == host OS).
        cgo_enabled = "1" if goos == host_goos else "0"
        env.update({
            "GOOS": goos,
            "GOARCH": goarch,
            "CGO_ENABLED": cgo_enabled,
        })

        cmd = [
            "go", "build",
            "-tags", "novulkan",
            "-trimpath",
            "-ldflags", "-s -w",
            "-o", str(build_root / name),
            ".",
        ]

        print(f"Running build: {' '.join(cmd)}")
        try:
            subprocess.run(
                cmd,
                cwd=pdir,
                env=env,
                check=True
            )
        except subprocess.CalledProcessError as e:
            msg = f"{goos}/{goarch} (CGO_ENABLED={cgo_enabled}) failed"
            print(msg)
            failures.append((name, msg))
            continue

        print(f"Built {name}")
        built_any = True

    if not built_any and failures:
        # Preserve previous behavior: raise if nothing was built.
        raise RuntimeError(f"Desktop build failed for all targets: {failures}")

    return str(build_root)

