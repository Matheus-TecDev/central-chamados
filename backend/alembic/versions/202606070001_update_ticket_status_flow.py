"""update ticket status flow

Revision ID: 202606070001
Revises: 202606050001
Create Date: 2026-06-07 00:00:00.000000
"""

from collections.abc import Sequence

from alembic import op

revision: str = "202606070001"
down_revision: str | None = "202606050001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("ALTER TYPE ticket_status RENAME TO ticket_status_old")
    op.execute(
        "CREATE TYPE ticket_status AS ENUM "
        "('ABERTO', 'EM_ANDAMENTO', 'AGUARDANDO_SOLICITANTE', 'AGUARDANDO_TERCEIROS', 'CONCLUIDO', 'CANCELADO')"
    )
    op.execute(
        """
        ALTER TABLE tickets
        ALTER COLUMN status DROP DEFAULT,
        ALTER COLUMN status TYPE ticket_status
        USING (
            CASE
                WHEN status::text IN ('RESOLVIDO', 'FECHADO') THEN 'CONCLUIDO'
                ELSE status::text
            END
        )::ticket_status,
        ALTER COLUMN status SET DEFAULT 'ABERTO'
        """
    )
    op.execute("DROP TYPE ticket_status_old")


def downgrade() -> None:
    op.execute("ALTER TYPE ticket_status RENAME TO ticket_status_new")
    op.execute(
        "CREATE TYPE ticket_status AS ENUM "
        "('ABERTO', 'EM_ANDAMENTO', 'AGUARDANDO_SOLICITANTE', 'RESOLVIDO', 'FECHADO', 'CANCELADO')"
    )
    op.execute(
        """
        ALTER TABLE tickets
        ALTER COLUMN status DROP DEFAULT,
        ALTER COLUMN status TYPE ticket_status
        USING (
            CASE
                WHEN status::text IN ('CONCLUIDO', 'AGUARDANDO_TERCEIROS') THEN 'RESOLVIDO'
                ELSE status::text
            END
        )::ticket_status,
        ALTER COLUMN status SET DEFAULT 'ABERTO'
        """
    )
    op.execute("DROP TYPE ticket_status_new")
