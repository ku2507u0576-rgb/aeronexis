from __future__ import annotations
def validate_fare_components(quote: dict) -> dict:
    calc_total = quote['base_fare'] + quote['taxes'] + quote.get('user_dev_fee', 0) + quote.get('convenience_charge', 0)
    
    if abs(calc_total - quote['total_fare']) > 50:
        quote['data_quality_flag'] = 'fare_mismatch'
        
    return quote
