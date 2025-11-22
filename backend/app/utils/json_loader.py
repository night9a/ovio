"""Utility to load JSON templates safely."""
import json


def load_json(path):
    with open(path, "r", encoding="utf-8") as fh:
        return json.load(fh)
