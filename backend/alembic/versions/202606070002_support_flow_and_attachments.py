"""support flow and attachments

Revision ID: 202606070002
Revises: 202606070001
Create Date: 2026-06-07 00:10:00.000000
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "202606070002"
down_revision: str | None = "202606070001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "sectors",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index(op.f("ix_sectors_id"), "sectors", ["id"], unique=False)
    op.create_index(op.f("ix_sectors_name"), "sectors", ["name"], unique=False)

    op.create_table(
        "support_areas",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index(op.f("ix_support_areas_id"), "support_areas", ["id"], unique=False)
    op.create_index(op.f("ix_support_areas_name"), "support_areas", ["name"], unique=False)

    op.create_table(
        "support_types",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("support_area_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["support_area_id"], ["support_areas.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("support_area_id", "name", name="uq_support_types_area_name"),
    )
    op.create_index(op.f("ix_support_types_id"), "support_types", ["id"], unique=False)
    op.create_index(op.f("ix_support_types_name"), "support_types", ["name"], unique=False)
    op.create_index(op.f("ix_support_types_support_area_id"), "support_types", ["support_area_id"], unique=False)

    op.add_column("tickets", sa.Column("sector_id", sa.Integer(), nullable=True))
    op.add_column("tickets", sa.Column("support_area_id", sa.Integer(), nullable=True))
    op.add_column("tickets", sa.Column("support_type_id", sa.Integer(), nullable=True))

    op.execute(
        """
        INSERT INTO sectors (name, description, is_active)
        VALUES ('OUTROS', 'Setor padrao para chamados existentes.', true)
        ON CONFLICT (name) DO NOTHING
        """
    )
    op.execute(
        """
        INSERT INTO support_areas (name, description, is_active)
        VALUES ('OUTROS', 'Area padrao para chamados existentes.', true)
        ON CONFLICT (name) DO NOTHING
        """
    )
    op.execute(
        """
        INSERT INTO support_types (support_area_id, name, description, is_active)
        SELECT id, 'OUTROS', 'Tipo padrao para chamados existentes.', true
        FROM support_areas
        WHERE name = 'OUTROS'
        ON CONFLICT ON CONSTRAINT uq_support_types_area_name DO NOTHING
        """
    )
    op.execute(
        """
        UPDATE tickets
        SET
            sector_id = (SELECT id FROM sectors WHERE name = 'OUTROS'),
            support_area_id = (SELECT id FROM support_areas WHERE name = 'OUTROS'),
            support_type_id = (
                SELECT support_types.id
                FROM support_types
                JOIN support_areas ON support_areas.id = support_types.support_area_id
                WHERE support_areas.name = 'OUTROS' AND support_types.name = 'OUTROS'
            )
        WHERE sector_id IS NULL OR support_area_id IS NULL OR support_type_id IS NULL
        """
    )

    op.alter_column("tickets", "sector_id", nullable=False)
    op.alter_column("tickets", "support_area_id", nullable=False)
    op.alter_column("tickets", "support_type_id", nullable=False)
    op.create_index(op.f("ix_tickets_sector_id"), "tickets", ["sector_id"], unique=False)
    op.create_index(op.f("ix_tickets_support_area_id"), "tickets", ["support_area_id"], unique=False)
    op.create_index(op.f("ix_tickets_support_type_id"), "tickets", ["support_type_id"], unique=False)
    op.create_foreign_key("fk_tickets_sector_id_sectors", "tickets", "sectors", ["sector_id"], ["id"])
    op.create_foreign_key(
        "fk_tickets_support_area_id_support_areas",
        "tickets",
        "support_areas",
        ["support_area_id"],
        ["id"],
    )
    op.create_foreign_key(
        "fk_tickets_support_type_id_support_types",
        "tickets",
        "support_types",
        ["support_type_id"],
        ["id"],
    )

    op.create_table(
        "ticket_attachments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("ticket_id", sa.Integer(), nullable=False),
        sa.Column("uploaded_by_id", sa.Integer(), nullable=False),
        sa.Column("original_filename", sa.String(length=255), nullable=False),
        sa.Column("stored_filename", sa.String(length=255), nullable=False),
        sa.Column("content_type", sa.String(length=120), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["ticket_id"], ["tickets.id"]),
        sa.ForeignKeyConstraint(["uploaded_by_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("stored_filename"),
    )
    op.create_index(op.f("ix_ticket_attachments_id"), "ticket_attachments", ["id"], unique=False)
    op.create_index(op.f("ix_ticket_attachments_ticket_id"), "ticket_attachments", ["ticket_id"], unique=False)
    op.create_index(op.f("ix_ticket_attachments_uploaded_by_id"), "ticket_attachments", ["uploaded_by_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_ticket_attachments_uploaded_by_id"), table_name="ticket_attachments")
    op.drop_index(op.f("ix_ticket_attachments_ticket_id"), table_name="ticket_attachments")
    op.drop_index(op.f("ix_ticket_attachments_id"), table_name="ticket_attachments")
    op.drop_table("ticket_attachments")

    op.drop_constraint("fk_tickets_support_type_id_support_types", "tickets", type_="foreignkey")
    op.drop_constraint("fk_tickets_support_area_id_support_areas", "tickets", type_="foreignkey")
    op.drop_constraint("fk_tickets_sector_id_sectors", "tickets", type_="foreignkey")
    op.drop_index(op.f("ix_tickets_support_type_id"), table_name="tickets")
    op.drop_index(op.f("ix_tickets_support_area_id"), table_name="tickets")
    op.drop_index(op.f("ix_tickets_sector_id"), table_name="tickets")
    op.drop_column("tickets", "support_type_id")
    op.drop_column("tickets", "support_area_id")
    op.drop_column("tickets", "sector_id")

    op.drop_index(op.f("ix_support_types_support_area_id"), table_name="support_types")
    op.drop_index(op.f("ix_support_types_name"), table_name="support_types")
    op.drop_index(op.f("ix_support_types_id"), table_name="support_types")
    op.drop_table("support_types")

    op.drop_index(op.f("ix_support_areas_name"), table_name="support_areas")
    op.drop_index(op.f("ix_support_areas_id"), table_name="support_areas")
    op.drop_table("support_areas")

    op.drop_index(op.f("ix_sectors_name"), table_name="sectors")
    op.drop_index(op.f("ix_sectors_id"), table_name="sectors")
    op.drop_table("sectors")
