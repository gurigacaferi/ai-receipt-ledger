"""Initial schema

Revision ID: 0001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create invoices table
    op.create_table('invoices',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('file_url', sa.Text(), nullable=False),
        sa.Column('vendor', sa.Text(), nullable=True),
        sa.Column('invoice_no', sa.Text(), nullable=True),
        sa.Column('invoice_date', sa.Date(), nullable=True),
        sa.Column('currency', sa.Text(), nullable=True),
        sa.Column('subtotal', sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column('tax', sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column('total', sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column('raw_json', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.TIMESTAMP(), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # Create expenses table
    op.create_table('expenses',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('invoice_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('category', sa.Text(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('amount', sa.Numeric(precision=12, scale=2), nullable=False),
        sa.Column('currency', sa.Text(), nullable=False),
        sa.Column('vendor', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['invoice_id'], ['invoices.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes
    op.create_index('ix_expenses_user_id', 'expenses', ['user_id'])
    op.create_index('ix_expenses_date', 'expenses', ['date'])
    op.create_index('ix_expenses_category', 'expenses', ['category'])
    op.create_index('ix_invoices_user_id', 'invoices', ['user_id'])


def downgrade() -> None:
    op.drop_index('ix_invoices_user_id')
    op.drop_index('ix_expenses_category')
    op.drop_index('ix_expenses_date')
    op.drop_index('ix_expenses_user_id')
    op.drop_table('expenses')
    op.drop_table('invoices')