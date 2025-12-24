from ..extensions import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import JSONB


class Component(db.Model):
    __tablename__ = "component_definitions"

    id = db.Column(db.Integer, primary_key=True)

    # Identity
    key = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)

    # Classification
    kind = db.Column(
        db.Enum(
            "ui",
            "layout",
            "media",
            "form",
            "data",
            name="component_kind"
        ),
        nullable=False
    )

    # Description for component browser
    description = db.Column(db.Text, nullable=True)
    icon = db.Column(db.String(100), nullable=True)

    # Schema describing supported attributes / props
    props_schema = db.Column(JSONB, nullable=False)

    # Default props when dropped into canvas
    default_props = db.Column(JSONB, nullable=False, default=dict)

    # Constraints / behavior flags
    is_container = db.Column(db.Boolean, default=False)
    allow_children = db.Column(db.Boolean, default=False)
    experimental = db.Column(db.Boolean, default=False)

    # Rendering / export info
    renderer = db.Column(db.String(50), nullable=False)
    export_tags = db.Column(JSONB, nullable=True)

    # Versioning
    version = db.Column(db.String(20), default="1.0.0")
    deprecated = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    def __repr__(self):
        return f"<Component {self.key}>"

