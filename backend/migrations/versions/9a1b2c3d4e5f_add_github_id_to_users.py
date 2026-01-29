"""add github_id to users

Revision ID: 9a1b2c3d4e5f
Revises: 8c8397444096
Create Date: 2025-01-29

"""
from alembic import op
import sqlalchemy as sa


revision = "9a1b2c3d4e5f"
down_revision = "8c8397444096"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.add_column(sa.Column("github_id", sa.String(length=255), nullable=True))
        batch_op.create_unique_constraint("uq_users_github_id", ["github_id"])


def downgrade():
    with op.batch_alter_table("users", schema=None) as batch_op:
        batch_op.drop_constraint("uq_users_github_id", type_="unique")
        batch_op.drop_column("github_id")
