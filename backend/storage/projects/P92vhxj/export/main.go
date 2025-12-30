package main

import (
	"gioui.org/app"
	"gioui.org/layout"
	"gioui.org/unit"
	"gioui.org/widget"
	"gioui.org/widget/material"
)

func main() {
go func() {
	w := new(app.Window)
	w.Option(app.Title("Main Window"))

	for {
		w.Event()
	}
}()

	th := material.NewTheme()

	for e := range w.Events() {
		gtx := layout.NewContext(&e.Queue, e)
		layout.Flex{Axis: layout.Vertical}.Layout(gtx,
			layout.Rigid(func(gtx layout.Context) layout.Dimensions {
_ = material.Label(th, unit.Sp(16), "Hello World")
			}),
			layout.Rigid(func(gtx layout.Context) layout.Dimensions {
var btn = new(widget.Clickable)
_ = material.Button(th, btn, "Click Me")
btn.SetEnabled(true)
			}),

		)
	}
}