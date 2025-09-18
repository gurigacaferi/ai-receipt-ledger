from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from app.database import get_db
from app.models import Invoice, Expense
from app.schemas import UploadResponse, ParsedReceipt, InvoiceResponse
from app.services.auth import auth_service
from app.services.storage import storage_service
from app.services.ai_parser import ai_parser_service
from app.services.categorization import categorization_service

router = APIRouter()

@router.post("/", response_model=UploadResponse)
async def upload_invoice(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload receipt image"""
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith(('image/', 'application/pdf')):
        raise HTTPException(status_code=400, detail="Only image and PDF files are allowed")
    
    try:
        # Get current user
        user_id = auth_service.get_current_user_id()
        
        # Save file
        file_url = await storage_service.save_file(file.file, file.filename)
        
        # Create invoice record
        invoice = Invoice(
            user_id=user_id,
            file_url=file_url
        )
        
        db.add(invoice)
        db.commit()
        db.refresh(invoice)
        
        return UploadResponse(id=invoice.id)
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.post("/{invoice_id}/parse", response_model=ParsedReceipt)
async def parse_invoice(
    invoice_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """Parse uploaded receipt with AI"""
    
    # Get invoice
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Verify ownership
    user_id = auth_service.get_current_user_id()
    if invoice.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        # Parse with AI
        parsed_data = await ai_parser_service.parse_receipt(invoice.file_url)
        
        # Update invoice with parsed data
        invoice.vendor = parsed_data.vendor
        invoice.invoice_no = parsed_data.invoice_no
        invoice.invoice_date = datetime.strptime(parsed_data.invoice_date, "%Y-%m-%d").date()
        invoice.currency = parsed_data.currency
        invoice.subtotal = parsed_data.subtotal
        invoice.tax = parsed_data.tax
        invoice.total = parsed_data.total
        invoice.raw_json = parsed_data.dict()
        
        # Create expense entries
        if parsed_data.items:
            # Create individual expenses for each item
            for item in parsed_data.items:
                expense = Expense(
                    user_id=user_id,
                    invoice_id=invoice.id,
                    date=invoice.invoice_date,
                    category=item.category,
                    description=item.description,
                    amount=item.line_total,
                    currency=parsed_data.currency,
                    vendor=parsed_data.vendor
                )
                db.add(expense)
        else:
            # Create single expense from total
            category = categorization_service.categorize_expense(
                vendor=parsed_data.vendor,
                description=f"Purchase from {parsed_data.vendor}"
            )
            expense = Expense(
                user_id=user_id,
                invoice_id=invoice.id,
                date=invoice.invoice_date,
                category=category,
                description=f"Purchase from {parsed_data.vendor}",
                amount=parsed_data.total,
                currency=parsed_data.currency,
                vendor=parsed_data.vendor
            )
            db.add(expense)
        
        db.commit()
        return parsed_data
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Parsing failed: {str(e)}")

@router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(
    invoice_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """Get invoice details"""
    
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    # Verify ownership
    user_id = auth_service.get_current_user_id()
    if invoice.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return invoice