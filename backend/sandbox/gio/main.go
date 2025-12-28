package main

import (
	"os"

	"gioui.org/app"
	"gioui.org/font/gofont"
	"gioui.org/layout"
	"gioui.org/op"
	"gioui.org/op/clip"
	"gioui.org/op/paint"
	"gioui.org/unit"
	"gioui.org/widget"
	"gioui.org/widget/material"
	"image/color"
)

type (
	C = layout.Context
	D = layout.Dimensions
)

func main() {
	go func() {
		w := new(app.Window)
		w.Option(
			app.Title("Hello Gio"),
			app.Size(unit.Dp(400), unit.Dp(250)),
		)

		if err := loop(w); err != nil {
			panic(err)
		}
		os.Exit(0)
	}()
	app.Main()
}

func loop(w *app.Window) error {
	var ops op.Ops

	btn := new(widget.Clickable)
	showPopup := false

	th := material.NewTheme(gofont.Collection())

	for {
		e := w.Event()

		switch e := e.(type) {

		case app.DestroyEvent:
			return e.Err

		case app.FrameEvent:
			gtx := layout.Context{
				Ops:         &ops,
				Constraints: e.Constraints,
				Metric:      e.Metric,
				Now:         e.Now,
				Queue:       e.Queue,
			}

			if btn.Clicked() {
				showPopup = true
			}

			layout.Center.Layout(gtx, func(gtx C) D {
				return layout.Flex{
					Axis: layout.Vertical,
				}.Layout(gtx,
					layout.Rigid(material.H3(th, "Hello World").Layout),
					layout.Rigid(layout.Spacer{Height: unit.Dp(20)}.Layout),
					layout.Rigid(material.Button(th, btn, "Click me").Layout),
				)
			})

			if showPopup {
				drawPopup(gtx, th)
			}

			e.Frame(gtx.Ops)
		}
	}
}

func drawPopup(gtx C, th *material.Theme) {
	layout.Center.Layout(gtx, func(gtx C) D {
		size := gtx.Constraints.Min
		rect := clip.Rect{Max: size}.Push(gtx.Ops)
		paint.Fill(gtx.Ops, color.NRGBA{A: 180})
		rect.Pop()

		return layout.Center.Layout(gtx, func(gtx C) D {
			return layout.UniformInset(unit.Dp(16)).Layout(gtx,
				material.Body1(th, "Button clicked").Layout,
			)
		})
	})
}
