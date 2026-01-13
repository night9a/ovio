import os
import subprocess
from pathlib import Path

TARGETS = [
    ("windows", "amd64", "exe"),
]

def build(pdir: str) -> bool:
    pdir = Path(pdir).resolve()
    print("BUILD DIR (source):", pdir)

    # pdir = storage/projects/<pid>/export   (your current input)
    pid = pdir.parent.name  # <pid>

    # storage/projects/export/build/<pid>
    build_root = pdir.parents[2] / "export" / "build" / pid
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

    for goos, goarch, ext in TARGETS:
        name = f"{app_name}-{goos}-{goarch}"
        if ext:
            name += f".{ext}"

        env = os.environ.copy()
        env.update({
            "GOOS": goos,
            "GOARCH": goarch,
            "CGO_ENABLED": "0",
        })

        cmd = [
            "go", "build",
            "-trimpath",
            "-ldflags", "-s -w",
            "-o", str(build_root / name),
            ".",
        ]

        print(f"Running build: {' '.join(cmd)}")
        subprocess.run(
            cmd,
            cwd=pdir,
            env=env,
            check=True
        )

        print(f"Built {name}")

    return True

