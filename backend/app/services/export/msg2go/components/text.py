from typing import Dict, List


class Text:
    """
    Gio text label component.
    """

    def __init__(self, value: str):
        self.value = value

    @classmethod
    def from_spec(cls, spec: dict):
        return cls(value=spec["value"])

    def get_imports(self) -> Dict[str, List[str]]:
        return {
            "gioui.org/widget/material": ["Label"],
        }

    def to_go(self) -> str:
        return f'''
_ = material.Label(th, unit.Sp(16), "{self.value}")
'''.strip()

