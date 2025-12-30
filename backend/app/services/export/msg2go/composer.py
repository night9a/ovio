"""
Composer: builds a fully working Gio Go file from msgpack UI description
"""

from typing import Dict, List
from .components import COMPONENT_REGISTRY


class Composer:
    def __init__(self, ui: dict):
        self.ui = ui
        self.components = []
        self.imports: Dict[str, List[str]] = {}

    # -------------------------
    # Reader
    # -------------------------

    def read(self):
        # Window
        window_cfg = self.ui.get("window")
        if window_cfg:
            window_cls = COMPONENT_REGISTRY.get("window")
            if not window_cls:
                raise RuntimeError("Window component not registered")
            self.components.append(window_cls(**window_cfg))

        # Elements
        for elem in self.ui.get("elements", []):
            ctype = elem.get("type")
            if not ctype:
                raise ValueError("element missing 'type'")
            component_cls = COMPONENT_REGISTRY.get(ctype)
            if not component_cls:
                raise ValueError(f"unknown component type: {ctype}")
            self.components.append(component_cls.from_spec(elem))

    # -------------------------
    # Import aggregation
    # -------------------------

    def collect_imports(self):
        for comp in self.components:
            comp_imports = comp.get_imports()
            for pkg, symbols in comp_imports.items():
                self.imports.setdefault(pkg, [])
                for sym in symbols:
                    if sym not in self.imports[pkg]:
                        self.imports[pkg].append(sym)
        # Ensure layout and unit imports
        self.imports.setdefault("gioui.org/layout", [])
        self.imports.setdefault("gioui.org/unit", [])

    # -------------------------
    # Go code assembly
    # -------------------------

    def build(self) -> str:
        self.read()
        self.collect_imports()

        import_block = "\n".join('\t"{}"'.format(pkg) for pkg in sorted(self.imports.keys()))

        # Separate window from other components
        window_code = ""
        other_code = []

        for comp in self.components:
            if comp.__class__.__name__.lower() == "window":
                window_code = comp.to_go()  # Should produce goroutine + w declaration
            else:
                other_code.append(comp)

        # Prepare stateful declarations for components (e.g., buttons)
        state_decls = []
        layout_calls = []

        for comp in other_code:
            if hasattr(comp, "state_decl") and comp.state_decl():
                state_decls.append(comp.state_decl())
            layout_calls.append(comp.to_go())

        # Build layout block
        layout_block_lines = []
        for lc in layout_calls:
            layout_block_lines.append(
                "\t\t\tlayout.Rigid(func(gtx layout.Context) layout.Dimensions {\n" +
                lc + "\n\t\t\t}),"
            )
        layout_block = "\n".join(layout_block_lines)

        # Build final code using string concatenation to avoid f-string backslash issues
        final_code = (
            "package main\n\n"
            "import (\n"
            f"{import_block}\n"
            ")\n\n"
            "func main() {\n"
            f"{window_code}\n\n"
            "\tth := material.NewTheme()\n\n"
        )

        for decl in state_decls:
            final_code += "\t" + decl + "\n"

        final_code += (
            "\n\tfor e := range w.Events() {\n"
            "\t\tgtx := layout.NewContext(&e.Queue, e)\n"
            "\t\tlayout.Flex{Axis: layout.Vertical}.Layout(gtx,\n"
            f"{layout_block}\n"
            "\t\t)\n"
            "\t}\n"
            "}\n"
        )

        return final_code

