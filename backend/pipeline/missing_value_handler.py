from __future__ import annotations
def impute_missing(quotes: list[dict]) -> list[dict]:
    for q in quotes:
        if q.get('taxes') is None:
            q['taxes'] = round((q.get('base_fare', 0) * 0.05) + 400, 2)
            
        if q.get('user_dev_fee') is None:
            q['user_dev_fee'] = 0.0
            
        if q.get('convenience_charge') is None:
            q['convenience_charge'] = 0.0
            
    return quotes
