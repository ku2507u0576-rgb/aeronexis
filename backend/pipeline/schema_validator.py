from __future__ import annotations
def validate_schema(quote: dict) -> tuple[bool, str | None]:
    required_fields = ['origin', 'destination', 'departure_date', 'airline_code', 'base_fare', 'taxes', 'total_fare']
    
    for f in required_fields:
        if f not in quote:
            return False, f"Missing required field: {f}"
            
    if len(quote['origin']) != 3 or len(quote['destination']) != 3:
        return False, "IATA code must be 3 characters"
        
    try:
        bf = float(quote['base_fare'])
        if not (500 <= bf <= 50000):
            return False, "Base fare out of range"
    except (ValueError, TypeError):
        return False, "Invalid base_fare type"
        
    valid_airlines = ['6E', 'AI', 'IX', 'SG', 'QP']
    if quote['airline_code'] not in valid_airlines:
        return False, "Unknown airline code"
        
    return True, None
