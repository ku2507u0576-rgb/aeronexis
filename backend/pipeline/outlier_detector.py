from __future__ import annotations
from collections import defaultdict

def remove_outliers(quotes: list[dict]) -> tuple[list[dict], list[dict]]:
    groups = defaultdict(list)
    for q in quotes:
        groups[f"{q['origin']}-{q['destination']}"].append(q)
        
    clean = []
    outliers = []
    
    for route, group in groups.items():
        fares = sorted([q['total_fare'] for q in group])
        n = len(fares)
        if n < 4:
            clean.extend(group)
            continue
            
        q1 = fares[n//4]
        q3 = fares[3*n//4]
        iqr = q3 - q1
        lower = q1 - 1.5 * iqr
        upper = q3 + 1.5 * iqr
        
        for q in group:
            if lower <= q['total_fare'] <= upper:
                clean.append(q)
            else:
                q['data_quality_flag'] = 'outlier'
                outliers.append(q)
                
    return clean, outliers
