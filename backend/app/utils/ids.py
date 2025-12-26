import secrets
import string

_ALPHABET = string.ascii_lowercase + string.digits  # a–z0–9

def short_id() -> str:
    return "P" + "".join(secrets.choice(_ALPHABET) for _ in range(6))



