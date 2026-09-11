from __future__ import annotations
from datetime import datetime

def normalize_quote(quote: dict) -> dict:
    # Standardize dates
    if isinstance(quote.get('departure_date'), str):
        try:
            # try parsing iso
            dt = datetime.fromisoformat(quote['departure_date'].replace('Z', '+00:00'))
            quote['departure_date'] = dt.strftime("%Y-%m-%d")
        except ValueError:
            pass
            
    # Round fares
    for field in ['base_fare', 'taxes', 'total_fare', 'user_dev_fee', 'convenience_charge']:
        if quote.get(field) is not None:
            quote[field] = round(float(quote[field]), 2)
            
    # Uppercase airline codes
    if quote.get('airline_code'):
        quote['airline_code'] = quote['airline_code'].upper()
        
    return quote
