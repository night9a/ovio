import os
import subprocess
import sys
from pathlib import Path

# Mobile targets (conceptual, gomobile handles arch internally)
TARGETS = [
    ("android", None, "apk"),
    ("ios", None, "app"),
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

    for goos, _, ext in TARGETS:
        name = f"{app_name}.{ext}"
        output_path = build_root / name

        # iOS hard requirement
        if goos == "ios" and sys.platform != "darwin":
            print("Skipping iOS build (requires macOS)")
            continue

        cmd = [
            "gomobile", "build",
            f"-target={goos}",
            "-o", str(output_path),
            ".",
        ]

        print(f"Running build: {' '.join(cmd)}")
        subprocess.run(
            cmd,
            cwd=pdir,
            check=True
        )

        print(f"Built {name}")

    return str(build_root)

