from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date
import csv
import io

from app.database import get_db
from app.models import Expense
from app.services.auth import auth_service

router = APIRouter()

@router.get("/expenses.csv")
async def export_expenses_csv(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    category: Optional[str] = Query(None, alias="cat"),
    db: Session = Depends(get_db)
):
    """Export expenses as CSV"""
    
    user_id = auth_service.get_current_user_id()
    
    # Build query (same as expenses endpoint)
    query = db.query(Expense).filter(Expense.user_id == user_id)
    
    if from_date:
        query = query.filter(Expense.date >= from_date)
    
    if to_date:
        query = query.filter(Expense.date <= to_date)
    
    if category:
        query = query.filter(Expense.category == category)
    
    expenses = query.order_by(Expense.date.desc()).all()
    
    # Create CSV
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write headers
    writer.writerow([
        'Date', 'Vendor', 'Description', 'Category', 'Amount', 'Currency'
    ])
    
    # Write data
    for expense in expenses:
        writer.writerow([
            expense.date.isoformat(),
            expense.vendor or '',
            expense.description or '',
            expense.category,
            str(expense.amount),
            expense.currency
        ])
    
    # Return CSV response
    csv_content = output.getvalue()
    output.close()
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=expenses.csv"}
    )