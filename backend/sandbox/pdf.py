from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import black, HexColor
from reportlab.lib.units import cm
from datetime import date


OVIO_BLACK = HexColor("#000000")
OVIO_GRAY = HexColor("#6B7280")
OVIO_YELLOW = HexColor("#FACC15")


def build_ovio_report(
    output_path: str,
    developer_name: str,
    project_name: str,
    today_tasks: list[str],
    fixes: list[str],
    tomorrow_tasks: list[str],
):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )

    styles = getSampleStyleSheet()

    styles.add(ParagraphStyle(
        name="OVIO_Title",
        fontSize=26,
        textColor=OVIO_BLACK,
        spaceAfter=14,
        leading=30,
    ))

    styles.add(ParagraphStyle(
        name="OVIO_Subtitle",
        fontSize=11,
        textColor=OVIO_GRAY,
        spaceAfter=20,
    ))

    styles.add(ParagraphStyle(
        name="OVIO_Section",
        fontSize=14,
        textColor=OVIO_BLACK,
        spaceBefore=20,
        spaceAfter=10,
        leading=18,
    ))

    styles.add(ParagraphStyle(
        name="OVIO_Bullet",
        fontSize=11,
        leading=16,
        leftIndent=12,
    ))

    content = []

    # Header
    content.append(Paragraph("OVIO — Developer Daily Report", styles["OVIO_Title"]))
    content.append(
        Paragraph(
            f"{developer_name} · {project_name} · {date.today().isoformat()}",
            styles["OVIO_Subtitle"],
        )
    )

    # Divider
    content.append(Spacer(1, 12))
    content.append(Table(
        [[""]],
        colWidths=[16 * cm],
        style=[("BACKGROUND", (0, 0), (-1, -1), OVIO_BLACK)]
    ))
    content.append(Spacer(1, 20))

    # Section helper
    def section(title, items):
        content.append(Paragraph(title, styles["OVIO_Section"]))
        if not items:
            content.append(Paragraph("— No entries", styles["OVIO_Bullet"]))
        for item in items:
            content.append(Paragraph(f"• {item}", styles["OVIO_Bullet"]))

    # Sections
    section("What I Worked On Today", today_tasks)
    section("Bugs / Fixes", fixes)
    section("Plan for Tomorrow", tomorrow_tasks)

    doc.build(content)


if __name__ == "__main__":
    build_ovio_report(
        output_path="ovio_daily_report.pdf",
        developer_name="Ibrahim",
        project_name="OVIO Core Platform",
        today_tasks=[
            "Refactored project service layer",
            "Fixed MsgSerializer persistence bug",
            "Improved Flask hot-reload stability",
        ],
        fixes=[
            "Resolved attribute error in MsgSerializer",
            "Fixed duplicate project name validation",
        ],
        tomorrow_tasks=[
            "Implement Redis-based collaboration layer",
            "Add PDF export from editor",
        ],
    )

