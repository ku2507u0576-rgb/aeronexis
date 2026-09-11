from __future__ import annotations

def calculate_weights(routes: list, airlines: list) -> dict:
    """Calculate combined route+airline weights for index computation."""
    def _get(obj, key):
        return obj[key] if isinstance(obj, dict) else getattr(obj, key)

    total_passengers = sum(_get(r, 'annual_passengers') for r in routes)
    total_share = sum(_get(a, 'market_share_pct') for a in airlines)

    weights = {}
    for r in routes:
        route_w = _get(r, 'annual_passengers') / total_passengers if total_passengers else 0
        for a in airlines:
            airline_w = _get(a, 'market_share_pct') / total_share if total_share else 0
            key = f"{_get(r, 'origin')}-{_get(r, 'destination')}-{_get(a, 'code')}"
            weights[key] = (route_w * 0.7) + (airline_w * 0.3)

    total_weight = sum(weights.values())
    if total_weight > 0:
        for k in weights:
            weights[k] /= total_weight

    return weights
