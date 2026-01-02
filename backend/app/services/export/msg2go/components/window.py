from pathlib import Path
from typing import Optional, Dict, List


class Window:
    """
    Window specification for generating Gio (gioui) Go code.
    Emits ONLY window-related Go code. No package, no imports.
    """

    def __init__(
        self,
        *,
        title: Optional[str] = None,
        width: Optional[int] = None,
        height: Optional[int] = None,
        max_size: Optional[int] = None,
        min_size: Optional[int] = None,
        fullscreen: Optional[bool] = None,
        icon: Optional[Path] = None,
    ):
        self.title = title
        self.width = width
        self.height = height
        self.max_size = max_size
        self.min_size = min_size
        self.fullscreen = fullscreen
        self.icon = icon

    # -------------------------
    # Attribute inspection
    # -------------------------

    def _used_attributes(self) -> Dict[str, object]:
        return {
            k: v for k, v in self.__dict__.items()
            if v is not None
        }

    # -------------------------
    # Import resolution
    # -------------------------

    def get_imports(self) -> Dict[str, List[str]]:
        used = self._used_attributes()
        imports: Dict[str, List[str]] = {}

        def add(pkg: str, symbol: str):
            imports.setdefault(pkg, [])
            if symbol not in imports[pkg]:
                imports[pkg].append(symbol)

        # app is always required for a window
        add("gioui.org/app", "Window")

        if "title" in used:
            add("gioui.org/app", "Title")

        if "width" in used or "height" in used:
            add("gioui.org/app", "Size")
            add("gioui.org/unit", "Dp")

        if "fullscreen" in used:
            add("gioui.org/app", "Fullscreen")

        return imports
