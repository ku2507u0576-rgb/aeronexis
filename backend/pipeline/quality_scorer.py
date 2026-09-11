from __future__ import annotations
def calculate_quality_score(total: int, valid: int, duplicates: int, outliers: int, missing: int) -> float:
    if total == 0:
        return 0.0
        
    score = (valid / total) * 100.0
    
    dup_pct = (duplicates / total) * 100
    if dup_pct > 5:
        score -= 5
        
    miss_pct = (missing / total) * 100
    if miss_pct > 10:
        score -= 10
        
    out_pct = (outliers / total) * 100
    if out_pct > 15:
        score -= 5
        
    return max(0.0, min(100.0, score))
