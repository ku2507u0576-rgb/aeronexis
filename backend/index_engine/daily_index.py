from __future__ import annotations
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.models import CleanedFare, Route, Airline, AirfareIndex
from .weights import calculate_weights

def calculate_daily_index(session: Session, collection_date: date, base_date: str = '2023-01-01') -> float:
    routes = session.query(Route).all()
    airlines = session.query(Airline).all()
    weights = calculate_weights(routes, airlines)
    
    # Get average fares for today
    fares = session.query(
        CleanedFare.origin,
        CleanedFare.destination,
        CleanedFare.airline_code,
        func.avg(CleanedFare.total_fare).label('avg_total'),
        func.avg(CleanedFare.base_fare).label('avg_base'),
        func.count(CleanedFare.id).label('quote_count')
    ).filter(
        CleanedFare.collection_date == collection_date
    ).group_by(
        CleanedFare.origin, CleanedFare.destination, CleanedFare.airline_code
    ).all()
    
    if not fares:
        return 0.0
        
    total_index = 0.0
    base_index = 0.0
    total_quotes = 0
    
    # Simulate base fares
    route_bases = {
        ("DEL", "BOM"): 4500, ("BOM", "DEL"): 4500,
        ("DEL", "BLR"): 5500, ("BLR", "DEL"): 5500,
        ("BOM", "BLR"): 3600, ("DEL", "HYD"): 4900,
        ("BLR", "HYD"): 3200, ("MAA", "DEL"): 5800,
        ("DEL", "CCU"): 4700, ("MAA", "BOM"): 4200
    }
    
    for f in fares:
        w_key = f"{f.origin}-{f.destination}-{f.airline_code}"
        w = weights.get(w_key, 0)
        
        sim_base = route_bases.get((f.origin, f.destination), 4000) * 0.85
        sim_total = sim_base * 1.15
        
        if f.avg_total and sim_total > 0:
            total_index += (f.avg_total / sim_total) * w * 100
        if f.avg_base and sim_base > 0:
            base_index += (f.avg_base / sim_base) * w * 100
            
        total_quotes += f.quote_count
        
    index_record = AirfareIndex(
        index_date=collection_date,
        index_type='daily',
        index_value=total_index,
        index_value_base_fare=base_index,
        index_value_total_fare=total_index,
        no_of_quotes=total_quotes
    )
    session.add(index_record)
    session.commit()
    
    return total_index
