class Button:
    def __init__(
        self,
        width=2,
        height=2,
        color=None,      # default system color
        text="Button",
        font="Arial",
        font_size=12,
        enabled=True,
        visible=True,
        border_radius=0,
        icon=None
    ):
        self.width = width
        self.height = height
        self.color = color or "SystemButtonFace"  # fallback default color
        self.text = text
        self.font = font
        self.font_size = font_size
        self.enabled = enabled
        self.visible = visible
        self.border_radius = border_radius
        self.icon = icon

    def set_attributes(
        self,
        width=None,
        height=None,
        color=None,
        text=None,
        font=None,
        font_size=None,
        enabled=None,
        visible=None,
        border_radius=None,
        icon=None
    ):
        if width is not None:
            self.width = width
        if height is not None:
            self.height = height
        if color is not None:
            self.color = color
        if text is not None:
            self.text = text
        if font is not None:
            self.font = font
        if font_size is not None:
            self.font_size = font_size
        if enabled is not None:
            self.enabled = enabled
        if visible is not None:
            self.visible = visible
        if border_radius is not None:
            self.border_radius = border_radius
        if icon is not None:
            self.icon = icon

    def get_attributes(self):
        return {
            "width": self.width,
            "height": self.height,
            "color": self.color,
            "text": self.text,
            "font": self.font,
            "font_size": self.font_size,
            "enabled": self.enabled,
            "visible": self.visible,
            "border_radius": self.border_radius,
            "icon": self.icon
        }

