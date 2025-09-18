from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List

from app.database import get_db
from app.models import Expense
from app.schemas import MonthlyReport
from app.services.auth import auth_service

router = APIRouter()

@router.get("/monthly", response_model=List[MonthlyReport])
async def get_monthly_reports(db: Session = Depends(get_db)):
    """Get monthly spending reports"""
    
    user_id = auth_service.get_current_user_id()
    
    # Query monthly aggregations
    monthly_data = db.query(
        func.to_char(Expense.date, 'YYYY-MM').label('month'),
        Expense.category,
        func.sum(Expense.amount).label('total')
    ).filter(
        Expense.user_id == user_id
    ).group_by(
        func.to_char(Expense.date, 'YYYY-MM'),
        Expense.category
    ).order_by('month').all()
    
    # Group by month
    reports = {}
    for row in monthly_data:
        month = row.month
        category = row.category
        amount = float(row.total)
        
        if month not in reports:
            reports[month] = {
                'month': month,
                'categories': {},
                'total': 0.0
            }
        
        reports[month]['categories'][category] = amount
        reports[month]['total'] += amount
    
    return [MonthlyReport(**report) for report in reports.values()]