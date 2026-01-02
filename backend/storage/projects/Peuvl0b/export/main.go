package main

import (
	"gioui.org/app"
	"gioui.org/layout"
	"gioui.org/op"
	"gioui.org/unit"
	"gioui.org/widget"
	"gioui.org/widget/material"
	"os"
)

func main() {
	go func() {
		w := new(app.Window)
		w.Option(app.Title("ibrahim app"))
		w.Option(app.Size(unit.Dp(400), unit.Dp(600)))

		var ops op.Ops

		var btn widget.Clickable

		th := material.NewTheme()

		for {
			e := w.Event()
			switch ev := e.(type) {
			case app.FrameEvent:
				gtx := app.NewContext(&ops, ev)
				layout.Flex{Axis: layout.Vertical}.Layout(gtx,
				layout.Rigid(func(gtx layout.Context) layout.Dimensions {
					return material.Label(th, unit.Sp(16), "Hello World").Layout(gtx)
				}),
				layout.Rigid(func(gtx layout.Context) layout.Dimensions {
					return material.Button(th, &btn, "Click Me").Layout(gtx)
				}),
				)
				ev.Frame(gtx.Ops)
			case app.DestroyEvent:
				os.Exit(0)
			}
		}
	}()
	app.Main()
}
