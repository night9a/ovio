class Window:
    def __attribute__(
        self,
        title="ovio app"
        width=2,
        height=2,
        max_size=,
        min_size=
        full_screen=,
        icon=None
    ):
        self.title = width
        self.height = heiht
        self.color = color or "SystemButtonFace"  # fallback default color
        self.text = text
        self.font = font
        self.font_size = font_size
        self.enabled = enabled
        self.visible = visible
        self.border_radius = border_radius
        self.icon = icon
    def get_import(attr):
        """import list of lib to add an attribute or component"""
        get only used attr list = ["gioui.org/app","gioui.org/unit"]
        return 
    def __wrap__():
        a = f"go func() {
            // create new window
                w := new(app.Window)
                w.Option(app.Title("Egg timer"))
                w.Option(app.Size(unit.Dp(400), unit.Dp(600)))
        
            // listen for events in the window
            for {
                w.Event()
            }
        }()
        app.Main()"
