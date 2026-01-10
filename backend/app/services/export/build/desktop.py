import os
import subprocess
from pathlib import Path

TARGETS = [
    ("windows", "amd64", "exe"),
    # ("freebsd", "amd64", ""),  # skipped: requires FreeBSD host
]

GO_MOD_TEMPLATE = """module gio.test

go 1.24.9

require gioui.org v0.9.0

require (
    gioui.org/shader v1.0.8 // indirect
    github.com/ajstarks/giocanvas v0.0.0-20250916212156-784777e05a11 // indirect
    github.com/go-text/typesetting v0.3.0 // indirect
    golang.org/x/exp/shiny v0.0.0-20250408133849-7e4ce0ab07d0 // indirect
    golang.org/x/image v0.26.0 // indirect
    golang.org/x/sys v0.33.0 // indirect
    golang.org/x/text v0.24.0 // indirect
)
"""

def build(pdir: str) -> bool:
    pdir = Path(pdir).resolve()
    print("BUILD DIR:", pdir)

    go_mod = pdir / "go.mod"

    if not go_mod.exists():
        go_mod.write_text(GO_MOD_TEMPLATE)
        print(f"go.mod created at {go_mod}")

    subprocess.run(
        ["go", "mod", "tidy"],
        cwd=pdir,
        check=True
    )
    print("go.sum generated/updated")

    out_dir = pdir.parent
    app_name = pdir.name

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

        build_tags = ""  # only Windows here

        cmd = [
            "go", "build",
            "-trimpath",
            "-ldflags", "-s -w",
            "-tags", build_tags,
            "-o", str(out_dir / name),
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

