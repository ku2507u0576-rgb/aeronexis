from __future__ import annotations
import math
from datetime import date, timedelta
from sqlalchemy.orm import Session
from backend.models import AirfareIndex

def get_index_value(session: Session, target_date: date, index_type: str = 'daily') -> float | None:
    res = session.query(AirfareIndex).filter(
        AirfareIndex.index_type == index_type,
        AirfareIndex.index_date == target_date
    ).first()
    return res.index_value if res else None

def calculate_yoy_change(session: Session, current_date: date) -> float | None:
    try:
        last_year = current_date.replace(year=current_date.year - 1)
    except ValueError:
        # Leap year handling
        last_year = current_date.replace(year=current_date.year - 1, day=28)
        
    current_val = get_index_value(session, current_date)
    last_year_val = get_index_value(session, last_year)
    
    if current_val and last_year_val:
        return ((current_val - last_year_val) / last_year_val) * 100
    return None

def calculate_mom_change(session: Session, current_date: date) -> float | None:
    # Approximate month ago
    last_month = current_date - timedelta(days=30)
    current_val = get_index_value(session, current_date)
    last_month_val = get_index_value(session, last_month)
    
    if current_val and last_month_val:
        return ((current_val - last_month_val) / last_month_val) * 100
    return None

def calculate_wow_change(session: Session, current_date: date) -> float | None:
    last_week = current_date - timedelta(days=7)
    current_val = get_index_value(session, current_date)
    last_week_val = get_index_value(session, last_week)
    
    if current_val and last_week_val:
        return ((current_val - last_week_val) / last_week_val) * 100
    return None

def calculate_volatility(session: Session, current_date: date, window_days: int = 30) -> float | None:
    start_date = current_date - timedelta(days=window_days)
    records = session.query(AirfareIndex.index_value).filter(
        AirfareIndex.index_type == 'daily',
        AirfareIndex.index_date > start_date,
        AirfareIndex.index_date <= current_date
    ).all()
    
    values = [r[0] for r in records if r[0] is not None]
    if len(values) < 2:
        return None
        
    mean = sum(values) / len(values)
    variance = sum((x - mean) ** 2 for x in values) / (len(values) - 1)
    std_dev = math.sqrt(variance)
    
    return (std_dev / mean) * 100 if mean > 0 else 0
