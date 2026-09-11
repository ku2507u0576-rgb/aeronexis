from __future__ import annotations
def detect_duplicates(quotes: list[dict]) -> tuple[list[dict], int]:
    seen = set()
    unique = []
    removed = 0
    
    for q in quotes:
        key = (q['origin'], q['destination'], q['departure_date'], q['advance_days'], q['airline_code'], q['total_fare'])
        if key in seen:
            removed += 1
        else:
            seen.add(key)
            unique.append(q)
            
    return unique, removed
