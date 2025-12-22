import msgpack
import os
from typing import Any, Callable


class MsgSerializer:
    """Utility to manage structured data in a MessagePack file."""

    def __init__(self, path: str):
        self.path = path
        os.makedirs(os.path.dirname(path), exist_ok=True)

    def _load(self) -> dict:
        """Load data from file, return empty dict if not exists."""
        if not os.path.exists(self.path):
            return {}
        try:
            with open(self.path, "rb") as f:
                return msgpack.unpackb(f.read(), raw=False)
        except Exception:
            return {}

    def _save(self, data: dict) -> None:
        """Save dict data to file."""
        with open(self.path, "wb") as f:
            f.write(msgpack.packb(data, use_bin_type=True))

    def get(self, key: str, default: Any = None) -> Any:
        """Get a value by key."""
        data = self._load()
        return data.get(key, default)

    def set(self, key: str, value: Any) -> None:
        """Add or update a key."""
        data = self._load()
        data[key] = value
        self._save(data)

    def delete(self, key: str) -> None:
        """Remove a key if exists."""
        data = self._load()
        if key in data:
            del data[key]
            self._save(data)

    def update(self, key: str, updater: Callable[[Any], Any], default: Any = None) -> None:
        """
        Update a value by key using a callback function.
        updater: function that receives current value and returns new value
        """
        data = self._load()
        data[key] = updater(data.get(key, default))
        self._save(data)

    def all(self) -> dict:
        """Return all data."""
        return self._load()

