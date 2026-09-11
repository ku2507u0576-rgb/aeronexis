from __future__ import annotations
from datetime import date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.models import AirfareIndex

def calculate_weekly_index(session: Session, week_end_date: date) -> float:
    week_start = week_end_date - timedelta(days=6)
    
    res = session.query(
        func.avg(AirfareIndex.index_value).label('avg_idx'),
        func.sum(AirfareIndex.no_of_quotes).label('total_quotes')
    ).filter(
        AirfareIndex.index_type == 'daily',
        AirfareIndex.index_date >= week_start,
        AirfareIndex.index_date <= week_end_date
    ).first()
    
    if res and res.avg_idx:
        index_record = AirfareIndex(
            index_date=week_end_date,
            index_type='weekly',
            index_value=res.avg_idx,
            index_value_total_fare=res.avg_idx,
            no_of_quotes=res.total_quotes or 0
        )
        session.add(index_record)
        session.commit()
        return res.avg_idx
        
    return 0.0
