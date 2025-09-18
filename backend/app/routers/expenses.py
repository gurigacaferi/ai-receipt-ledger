from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Optional, List
from datetime import date

from app.database import get_db
from app.models import Expense
from app.schemas import ExpenseResponse
from app.services.auth import auth_service

router = APIRouter()

@router.get("/", response_model=List[ExpenseResponse])
async def get_expenses(
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    category: Optional[str] = Query(None, alias="cat"),
    db: Session = Depends(get_db)
):
    """Get expenses with optional filters"""
    
    user_id = auth_service.get_current_user_id()
    
    # Build query
    query = db.query(Expense).filter(Expense.user_id == user_id)
    
    # Apply filters
    if from_date:
        query = query.filter(Expense.date >= from_date)
    
    if to_date:
        query = query.filter(Expense.date <= to_date)
    
    if category:
        query = query.filter(Expense.category == category)
    
    # Order by date descending
    expenses = query.order_by(Expense.date.desc()).all()
    
    return expenses