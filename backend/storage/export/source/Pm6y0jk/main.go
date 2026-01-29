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

		var actionMessage string
		var btn_1 widget.Clickable

		th := material.NewTheme()

		for {
			e := w.Event()
			switch ev := e.(type) {
			case app.FrameEvent:
				gtx := app.NewContext(&ops, ev)
				layout.Flex{Axis: layout.Vertical}.Layout(gtx,
				layout.Rigid(func(gtx layout.Context) layout.Dimensions {
					return material.Label(th, unit.Sp(16), "ibrahim").Layout(gtx)
				}),
				layout.Rigid(func(gtx layout.Context) layout.Dimensions {
					if btn_1.Clicked(gtx) {
						actionMessage = "fuck you"
					}
					return material.Button(th, &btn_1, "Click Me").Layout(gtx)
				}),
				layout.Rigid(func(gtx layout.Context) layout.Dimensions {
					if actionMessage != "" {
						return material.Body1(th, actionMessage).Layout(gtx)
					}
					return layout.Dimensions{}
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
