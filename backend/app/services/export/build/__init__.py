from . import desktop, mobile, web

_PLATFORMS = {
    "desktop": desktop.build,
    "mobile": mobile.build,
    "web": web.build,
}

def build(plat: str, pdir: str):
    key = plat.strip().lower()
    try:
        handler = _PLATFORMS[key]
    except KeyError:
        raise ValueError(f"Unknown platform: {key}")

    return handler(pdir)

