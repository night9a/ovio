import os
import subprocess
from pathlib import Path

# Web target (Go → WebAssembly)
TARGETS = [
    ("js", "wasm", "wasm"),
]

def build(pdir: str) -> bool:
    pdir = Path(pdir).resolve()
    print("BUILD DIR (source):", pdir)

    # pdir = storage/projects/<pid>/export
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
        name = f"{app_name}.{ext}"
        output_path = build_root / name

        env = os.environ.copy()
        env.update({
            "GOOS": goos,
            "GOARCH": goarch,
        })

        cmd = [
            "go", "build",
            "-o", str(output_path),
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

    # Optional: copy wasm_exec.js to build folder (required to run WASM)
    wasm_exec = Path(os.environ.get("GOROOT", "")) / "misc" / "wasm" / "wasm_exec.js"
    if wasm_exec.exists():
        subprocess.run(
            ["cp", str(wasm_exec), str(build_root / "wasm_exec.js")],
            check=True
        )
        print("Copied wasm_exec.js to build folder")
    else:
        print("Warning: wasm_exec.js not found, ensure Go installation includes misc/wasm")

    return True

