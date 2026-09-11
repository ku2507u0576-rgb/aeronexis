# APIx REST API Documentation 🔌

## Base URL

```
http://localhost:8000/v1
```

Production: `https://api.airfare-index.in/v1`

---

## Authentication

All API endpoints require an API key passed via the `X-API-Key` header.

```bash
curl -H "X-API-Key: apix-demo-key-2026" http://localhost:8000/v1/airfare-index
```

**Demo Key**: `apix-demo-key-2026`

### Rate Limits
| Limit | Value |
|-------|-------|
| Per Day | 1,000 requests |
| Per Minute | 10 requests |

---

## Response Format

All responses follow this structure:

```json
{
  "status": "success",
  "data": { ... },
  "message": null
}
```

### Error Response
```json
{
  "status": "error",
  "data": null,
  "message": "Description of the error"
}
```

---

## Endpoints

### 1. GET /airfare-index

Get the current Airfare Price Index value.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| frequency | string | daily | `daily`, `weekly`, or `monthly` |
| route | string | null | Route code, e.g., `DEL-BOM` |
| airline | string | null | Airline code, e.g., `6E` |
| date | string | today | Date in `YYYY-MM-DD` format |

**Example Request:**
```bash
curl -H "X-API-Key: apix-demo-key-2026" \
  "http://localhost:8000/v1/airfare-index?frequency=daily&route=DEL-BOM"
```

**Example Response:**
```json
{
  "status": "success",
  "data": {
    "index_date": "2026-09-10",
    "index_type": "daily",
    "index_value": 108.4,
    "base_year": 2023,
    "base_value": 100.0,
    "change_yoy_pct": 8.4,
    "change_mom_pct": 3.2,
    "change_wow_pct": 1.8,
    "routes_included": 10,
    "airlines_included": 5,
    "total_quotes": 12540,
    "volatility_pct": 4.2,
    "last_updated": "2026-09-10T06:30:00Z"
  }
}
```

---

### 2. GET /routes

Get all monitored routes with current indices.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | int | 50 | Max results |
| offset | int | 0 | Pagination offset |
| tier | string | null | `Tier-1` or `Tier-2` |

**Example Response:**
```json
{
  "status": "success",
  "data": [
    {
      "route_code": "DEL-BOM",
      "origin": "DEL",
      "destination": "BOM",
      "origin_name": "Delhi",
      "destination_name": "Mumbai",
      "distance_km": 1400,
      "current_avg_fare": 5200,
      "current_index": 113.2,
      "change_pct": 12.4,
      "demand_tier": "Tier-1",
      "annual_passengers": 45000000,
      "airlines_tracked": 5,
      "last_updated": "2026-09-10T06:30:00Z"
    }
  ],
  "total": 10
}
```

---

### 3. GET /fares

Get fare data with filters and pagination.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| route | string | **required** | Route code, e.g., `DEL-BOM` |
| airline | string | null | Airline code |
| advance | int | null | `1`, `7`, `15`, `30`, or `45` |
| date_from | string | null | Start date `YYYY-MM-DD` |
| date_to | string | null | End date `YYYY-MM-DD` |
| limit | int | 50 | Max results |
| offset | int | 0 | Pagination offset |

**Example Response:**
```json
{
  "status": "success",
  "data": [
    {
      "fare_id": 1234,
      "origin": "DEL",
      "destination": "BOM",
      "airline_code": "6E",
      "airline_name": "IndiGo",
      "departure_date": "2026-09-17",
      "advance_days": 7,
      "base_fare": 4200.00,
      "taxes": 800.00,
      "total_fare": 5000.00,
      "fare_class": "Economy",
      "source": "IndiGo Website",
      "collection_date": "2026-09-10"
    }
  ],
  "aggregates": {
    "avg_fare": 5200.00,
    "min_fare": 4800.00,
    "max_fare": 6500.00,
    "median_fare": 5150.00
  },
  "total": 250
}
```

---

### 4. GET /airlines

Get airline comparison data.

**Example Response:**
```json
{
  "status": "success",
  "data": [
    {
      "airline_code": "6E",
      "airline_name": "IndiGo",
      "market_share_pct": 57.0,
      "avg_fare": 5200.00,
      "current_index": 102.4,
      "change_yoy": 2.1,
      "routes_tracked": 10,
      "quotes_collected": 3240,
      "cheapest_route": "BLR-HYD",
      "cheapest_price": 2950.00,
      "most_expensive_route": "DEL-BLR",
      "most_expensive_price": 5980.00
    }
  ]
}
```

---

### 5. GET /trends

Get historical price trends.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| period | string | 30d | `7d`, `30d`, `90d`, `6m`, `1y` |
| route | string | null | Route code |
| airline | string | null | Airline code |
| frequency | string | daily | `daily`, `weekly`, `monthly` |

**Example Response:**
```json
{
  "status": "success",
  "data": {
    "period": "30d",
    "frequency": "daily",
    "start_date": "2026-08-11",
    "end_date": "2026-09-10",
    "trend_points": [
      {"date": "2026-08-11", "index": 102.1, "avg_fare": 4950},
      {"date": "2026-08-12", "index": 102.5, "avg_fare": 4970},
      ...
    ],
    "statistics": {
      "start_value": 102.1,
      "end_value": 108.4,
      "min": 101.8,
      "max": 109.2,
      "avg": 105.6,
      "volatility": 2.1
    }
  }
}
```

---

### 6. GET /advance-booking

Get advance booking price analysis for a route.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| route | string | **required** | Route code, e.g., `DEL-BOM` |

**Example Response:**
```json
{
  "status": "success",
  "data": {
    "route": "DEL-BOM",
    "analysis": [
      {"advance_days": 1, "avg_fare": 6200, "median_fare": 6100, "std_dev": 300},
      {"advance_days": 7, "avg_fare": 5400, "median_fare": 5350, "std_dev": 250},
      {"advance_days": 15, "avg_fare": 4900, "median_fare": 4850, "std_dev": 200},
      {"advance_days": 30, "avg_fare": 4700, "median_fare": 4650, "std_dev": 180},
      {"advance_days": 45, "avg_fare": 4600, "median_fare": 4550, "std_dev": 150}
    ],
    "elasticity": {
      "t1_to_t45_savings_pct": 25.8,
      "t1_to_t30_savings_pct": 24.2,
      "optimal_booking_window": "T+30"
    }
  }
}
```

---

### 7. GET /export

Export fare data in CSV, Excel, or JSON format.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| format | string | json | `csv`, `excel`, or `json` |
| route | string | null | Route code |
| date_from | string | **required** | Start date `YYYY-MM-DD` |
| date_to | string | **required** | End date `YYYY-MM-DD` |

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | ✅ Success |
| 400 | ❌ Bad Request (invalid parameters) |
| 401 | 🔒 Unauthorized (invalid API key) |
| 404 | 🔍 Not Found |
| 429 | ⏳ Rate Limit Exceeded |
| 500 | 💥 Internal Server Error |

---

## SDKs & Libraries

```python
# Python
import requests
headers = {"X-API-Key": "apix-demo-key-2026"}
response = requests.get(
    "http://localhost:8000/v1/airfare-index",
    headers=headers,
    params={"frequency": "daily", "route": "DEL-BOM"}
)
data = response.json()
print(f"Current Index: {data['data']['index_value']}")
```

```javascript
// JavaScript
const response = await fetch(
  'http://localhost:8000/v1/airfare-index?frequency=daily',
  { headers: { 'X-API-Key': 'apix-demo-key-2026' } }
);
const data = await response.json();
console.log(`Current Index: ${data.data.index_value}`);
```

---

*All monetary values are in ₹ (Indian Rupees). All dates are in ISO 8601 format.*
