from typing import Optional, Dict, List


class Button:
    """
    Gio Button component.
    Emits only layout-related Go code; state is declared separately.
    """

    def __init__(
        self,
        *,
        text: str,
        width: Optional[int] = None,
        enabled: bool = True,
        icon: Optional[str] = None,  # placeholder for future support
        var_name: str = "btn",        # unique Go variable name
    ):
        self.text = text
        self.width = width
        self.enabled = enabled
        self.icon = icon
        self.var_name = var_name

    # -------------------------
    # Factory
    # -------------------------

    @classmethod
    def from_spec(cls, spec: dict):
        return cls(
            text=spec["value"],
            width=spec.get("width"),
            enabled=spec.get("enabled", True),
            icon=spec.get("icon"),
            var_name=spec.get("var_name", "btn"),
        )

    # -------------------------
    # Imports
    # -------------------------

    def get_imports(self) -> Dict[str, List[str]]:
        imports: Dict[str, List[str]] = {}
    
        def add(pkg: str, symbol: str):
            imports.setdefault(pkg, [])
            if symbol not in imports[pkg]:
                imports[pkg].append(symbol)
    
        add("gioui.org/widget", "Clickable")
        add("gioui.org/widget/material", "Button")
    
        return imports

    # -------------------------
    # Stateful Go declarations
    # -------------------------

    def state_decl(self) -> str:
        """
        Returns Go code declaring stateful widgets, e.g., Clickable.
        """
        return f"var {self.var_name} widget.Clickable"

    # -------------------------
    # Layout / Go code
    # -------------------------

    def to_go(self) -> str:
        """
        Returns Go code for placement inside layout.Rigid.
        Uses 'th' theme and 'gtx' context.
        """
        return f'return material.Button(th, &{self.var_name}, "{self.text}").Layout(gtx)'
