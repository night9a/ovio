"""
Composer: builds a fully working Gio Go file from msgpack UI description
"""

from typing import Dict, List, Optional
from .components import COMPONENT_REGISTRY


class Composer:
    def __init__(self, ui: dict, action_handlers: Optional[Dict[str, str]] = None):
        self.ui = ui
        self.action_handlers = action_handlers or {}
        self.components = []
        self.imports: Dict[str, List[str]] = {}
        self.window = None
        self.window_options = []

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
            self.window = window_cls(**window_cfg)
            # Extract window options for later use
            self._extract_window_options()

        # Elements
        for i, elem in enumerate(self.ui.get("elements", [])):
            ctype = elem.get("type")
            if not ctype:
                raise ValueError("element missing 'type'")
            if ctype == "button" and "var_name" not in elem:
                elem = {**elem, "var_name": elem.get("var_name") or f"btn_{i}"}
            component_cls = COMPONENT_REGISTRY.get(ctype)
            if not component_cls:
                raise ValueError(f"unknown component type: {ctype}")
            self.components.append(component_cls.from_spec(elem))

    def _extract_window_options(self):
        """Extract window options from the window object"""
        if not self.window:
            return
            
        # Always add title
        if self.window.title:
            self.window_options.append(f'app.Title("{self.window.title}")')
        else:
            self.window_options.append('app.Title("App")')
        
        # Always add size (use provided or default)
        if self.window.width and self.window.height:
            self.window_options.append(
                f'app.Size(unit.Dp({self.window.width}), unit.Dp({self.window.height}))'
            )
        else:
            # Default size
            self.window_options.append('app.Size(unit.Dp(400), unit.Dp(600))')
        
        if self.window.fullscreen:
            self.window_options.append('app.Fullscreen(true)')
    # -------------------------
    # Import aggregation
    # -------------------------

    def collect_imports(self):
        # Add imports from window
        if self.window:
            comp_imports = self.window.get_imports()
            for pkg, symbols in comp_imports.items():
                self.imports.setdefault(pkg, [])
                for sym in symbols:
                    if sym not in self.imports[pkg]:
                        self.imports[pkg].append(sym)
        
        # Add imports from components
        for comp in self.components:
            comp_imports = comp.get_imports()
            for pkg, symbols in comp_imports.items():
                self.imports.setdefault(pkg, [])
                for sym in symbols:
                    if sym not in self.imports[pkg]:
                        self.imports[pkg].append(sym)
        
        # Ensure essential imports
        essential_imports = {
            "os": [],
            "gioui.org/app": [],
            "gioui.org/op": [],
            "gioui.org/unit": [],
            "gioui.org/widget": [],
            "gioui.org/widget/material": [],
            "gioui.org/layout": [],
        }
        
        for pkg, symbols in essential_imports.items():
            self.imports.setdefault(pkg, [])
            # Add essential symbols if not already present
            for sym in symbols:
                if sym not in self.imports[pkg]:
                    self.imports[pkg].append(sym)

        if self.action_handlers:
            self.imports.setdefault("gioui.org/widget/material", [])
            if "Body1" not in self.imports["gioui.org/widget/material"]:
                self.imports["gioui.org/widget/material"].append("Body1")

    # -------------------------
    # Go code assembly
    # -------------------------

    def build(self) -> str:
        self.read()
        self.collect_imports()

        # Build import block
        import_lines = []
        for pkg in sorted(self.imports.keys()):
            import_lines.append(f'\t"{pkg}"')
        import_block = "\n".join(import_lines)

        # Prepare stateful declarations and layout calls
        state_decls = []
        layout_calls = []

        # Optional state for action responses (show_text / pop_msg)
        if self.action_handlers:
            state_decls.append("var actionMessage string")

        for comp in self.components:
            if hasattr(comp, "state_decl") and comp.state_decl():
                state_decls.append(comp.state_decl())
            layout_calls.append(comp.to_go(action_handlers=self.action_handlers))

        # Build layout block
        layout_block_lines = []
        for lc in layout_calls:
            # Ensure proper indentation and returns
            lc_lines = lc.strip().split('\n')
            indented_lines = []
            for line in lc_lines:
                if line.strip() == "":
                    continue
                if not line.startswith('\t'):
                    line = '\t\t\t\t\t' + line
                else:
                    line = '\t\t\t\t' + line
                indented_lines.append(line)
            
            block_content = "\n".join(indented_lines)
            
            # Ensure the block returns something
            if "return" not in block_content:
                block_content = block_content.rstrip() + "\n\t\t\t\t\treturn layout.Dimensions{}"
            
            layout_block_lines.append(
                "\t\t\t\tlayout.Rigid(func(gtx layout.Context) layout.Dimensions {\n" +
                block_content + "\n" +
                "\t\t\t\t}),"
            )

        # When we have action handlers, show actionMessage below the main content
        if self.action_handlers:
            action_msg_block = (
                "\t\t\t\t\tif actionMessage != \"\" {\n"
                "\t\t\t\t\t\treturn material.Body1(th, actionMessage).Layout(gtx)\n"
                "\t\t\t\t\t}\n"
                "\t\t\t\t\treturn layout.Dimensions{}"
            )
            layout_block_lines.append(
                "\t\t\t\tlayout.Rigid(func(gtx layout.Context) layout.Dimensions {\n"
                + action_msg_block + "\n"
                + "\t\t\t\t}),"
            )

        layout_block = "\n".join(layout_block_lines)

        # Build window creation code
        window_creation = ['\t\tw := new(app.Window)']
        
        if self.window_options:
            for opt in self.window_options:
                window_creation.append(f"\t\tw.Option({opt})")
        else:
            # Default options
            window_creation.append('\t\tw.Option(app.Title("App"))')
            window_creation.append('\t\tw.Option(app.Size(unit.Dp(400), unit.Dp(600)))')
        
        window_code = "\n".join(window_creation)

        # Build the final code - FIXED: removed duplicate w := app.NewWindow()
        final_code = (
            "package main\n\n"
            "import (\n"
            f"{import_block}\n"
            ")\n\n"
            "func main() {\n"
            "\tgo func() {\n"
            f"{window_code}\n\n"  # This includes w := new(app.Window)
            "\t\tvar ops op.Ops\n\n"
        )
        
        # Add state declarations
        if state_decls:
            for decl in state_decls:
                final_code += f"\t\t{decl}\n"
            final_code += "\n"
        
        final_code += (
            "\t\tth := material.NewTheme()\n\n"
            "\t\tfor {\n"
            "\t\t\te := w.Event()\n"
            "\t\t\tswitch ev := e.(type) {\n"
            "\t\t\tcase app.FrameEvent:\n"
            "\t\t\t\tgtx := app.NewContext(&ops, ev)\n"
        )
        
        # Add layout calls - FIXED indentation
        # In the build() method, change this:
        if layout_block:
            final_code += (
                "\t\t\t\tlayout.Flex{Axis: layout.Vertical}.Layout(gtx,\n"
                f"{layout_block}\n"  # Remove the extra \t\t\t\t here
                "\t\t\t\t)\n"
            )
        else:
            final_code += "\t\t\t\t// No UI components defined\n"
        
        final_code += (
            "\t\t\t\tev.Frame(gtx.Ops)\n"
            "\t\t\tcase app.DestroyEvent:\n"
            "\t\t\t\tos.Exit(0)\n"
            "\t\t\t}\n"
            "\t\t}\n"
            "\t}()\n"
            "\tapp.Main()\n"
            "}\n"
        )

        return final_code
