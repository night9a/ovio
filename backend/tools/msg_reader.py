import gi
gi.require_version("Gtk", "3.0")
from gi.repository import Gtk, Gdk
import msgpack
import json

class MsgPackViewer(Gtk.Window):
    def __init__(self):
        super().__init__(title="MsgPack Viewer")
        self.set_default_size(800, 600)

        # Vertical Box
        vbox = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=6)
        self.add(vbox)

        # File chooser button
        self.file_button = Gtk.Button(label="Open MsgPack File")
        self.file_button.connect("clicked", self.on_file_clicked)
        vbox.pack_start(self.file_button, False, False, 0)

        # Scrolled text view for content
        self.scrolled = Gtk.ScrolledWindow()
        self.textview = Gtk.TextView()
        self.textview.set_editable(False)
        self.textbuffer = self.textview.get_buffer()
        self.scrolled.add(self.textview)
        vbox.pack_start(self.scrolled, True, True, 0)

    def on_file_clicked(self, widget):
        dialog = Gtk.FileChooserDialog(
            title="Select MsgPack File",
            parent=self,
            action=Gtk.FileChooserAction.OPEN,
        )
        dialog.add_buttons(
            Gtk.STOCK_CANCEL, Gtk.ResponseType.CANCEL,
            Gtk.STOCK_OPEN, Gtk.ResponseType.OK
        )

        filter_msgpack = Gtk.FileFilter()
        filter_msgpack.set_name("MsgPack files")
        filter_msgpack.add_pattern("*.msgpack")
        dialog.add_filter(filter_msgpack)

        response = dialog.run()
        if response == Gtk.ResponseType.OK:
            filename = dialog.get_filename()
            self.load_msgpack(filename)
        dialog.destroy()

    def load_msgpack(self, path):
        try:
            with open(path, "rb") as f:
                data = msgpack.unpackb(f.read(), raw=False)
            pretty = json.dumps(data, indent=4)
            self.textbuffer.set_text(pretty)
        except Exception as e:
            self.textbuffer.set_text(f"Error loading file:\n{e}")


if __name__ == "__main__":
    win = MsgPackViewer()
    win.connect("destroy", Gtk.main_quit)
    win.show_all()
    Gtk.main()

