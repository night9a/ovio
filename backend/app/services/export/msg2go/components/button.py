class Button:
    def __attribute__(
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
    def __wrap__():
        
