from typing import Optional, Dict, List, Any


class Button:
    """
    Gio Button component.
    Emits only layout-related Go code; state is declared separately.
    When action_id and action_handlers are set, emits click handler from Roller.
    """

    def __init__(
        self,
        *,
        text: str,
        width: Optional[int] = None,
        enabled: bool = True,
        icon: Optional[str] = None,  # placeholder for future support
        var_name: str = "btn",        # unique Go variable name
        action_id: Optional[str] = None,
    ):
        self.text = text
        self.width = width
        self.enabled = enabled
        self.icon = icon
        self.var_name = var_name
        self.action_id = action_id

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
            action_id=spec.get("action_id"),
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

    def to_go(self, action_handlers: Optional[Dict[str, str]] = None, **kwargs: Any) -> str:
        """
        Returns Go code for placement inside layout.Rigid.
        Uses 'th' theme and 'gtx' context.
        If action_id is set and action_handlers contains it, wraps in click check.
        """
        layout_line = f'return material.Button(th, &{self.var_name}, "{self.text}").Layout(gtx)'
        if self.action_id and action_handlers and self.action_id in action_handlers:
            body = action_handlers[self.action_id]
            indented = "\n".join("\t\t" + line for line in body.splitlines())
            return f"if {self.var_name}.Clicked(gtx) {{\n{indented}\n}}\n{layout_line}"
        return layout_line
