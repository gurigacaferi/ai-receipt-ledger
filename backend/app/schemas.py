from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date
from decimal import Decimal
import uuid

class ReceiptItem(BaseModel):
    description: str
    qty: int = 1
    unit_price: float
    line_total: float
    category: str = "auto"

class ParsedReceipt(BaseModel):
    vendor: str
    invoice_no: Optional[str] = None
    invoice_date: str = Field(..., pattern=r'^\d{4}-\d{2}-\d{2}$')
    currency: str = Field(..., min_length=3, max_length=3)
    items: List[ReceiptItem] = []
    subtotal: float
    tax: float
    total: float
    guessed_categories: bool = True

class InvoiceCreate(BaseModel):
    user_id: uuid.UUID

class InvoiceResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    file_url: str
    vendor: Optional[str] = None
    invoice_no: Optional[str] = None
    invoice_date: Optional[date] = None
    currency: Optional[str] = None
    subtotal: Optional[Decimal] = None
    tax: Optional[Decimal] = None
    total: Optional[Decimal] = None
    raw_json: Optional[dict] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True

class ExpenseResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    invoice_id: Optional[uuid.UUID] = None
    date: date
    category: str
    description: Optional[str] = None
    amount: Decimal
    currency: str
    vendor: Optional[str] = None

    class Config:
        from_attributes = True

class MonthlyReport(BaseModel):
    month: str
    categories: dict[str, float]
    total: float

class UploadResponse(BaseModel):
    id: uuid.UUID