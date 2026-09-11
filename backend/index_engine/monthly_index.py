from __future__ import annotations
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.models import AirfareIndex

def calculate_monthly_index(session: Session, month_end_date: date) -> float:
    # Get first day of the month
    month_start = month_end_date.replace(day=1)
    
    res = session.query(
        func.avg(AirfareIndex.index_value).label('avg_idx'),
        func.sum(AirfareIndex.no_of_quotes).label('total_quotes')
    ).filter(
        AirfareIndex.index_type == 'daily',
        AirfareIndex.index_date >= month_start,
        AirfareIndex.index_date <= month_end_date
    ).first()
    
    if res and res.avg_idx:
        index_record = AirfareIndex(
            index_date=month_end_date,
            index_type='monthly',
            index_value=res.avg_idx,
            index_value_total_fare=res.avg_idx,
            no_of_quotes=res.total_quotes or 0
        )
        session.add(index_record)
        session.commit()
        return res.avg_idx
        
    return 0.0
