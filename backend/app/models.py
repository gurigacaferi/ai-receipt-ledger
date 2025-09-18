from sqlalchemy import Column, String, Date, Numeric, Text, ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid

from app.database import Base

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    file_url = Column(Text, nullable=False)
    vendor = Column(Text)
    invoice_no = Column(Text)
    invoice_date = Column(Date)
    currency = Column(Text)
    subtotal = Column(Numeric(12, 2))
    tax = Column(Numeric(12, 2))
    total = Column(Numeric(12, 2))
    raw_json = Column(JSONB)
    created_at = Column(TIMESTAMP, server_default=func.now())

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    invoice_id = Column(UUID(as_uuid=True), ForeignKey("invoices.id", ondelete="SET NULL"))
    date = Column(Date, nullable=False)
    category = Column(Text, nullable=False)
    description = Column(Text)
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(Text, nullable=False)
    vendor = Column(Text)