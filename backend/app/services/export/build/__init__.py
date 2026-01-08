from . import dekstop,mobile,web

_PLATFORMS = {
    "dekstop": desktop.build,
    "mobile": mobile.build,
    "web": web.build,
}

def build(plat: name):
    key = plat.strip().lower()

    try:
        handler = _PLATFORMS[key]
    except KeyError:
        raise ValueError(f"Unknown platform: {key}")

    handler()
