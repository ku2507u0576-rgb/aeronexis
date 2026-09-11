# APIx Calculation Methodology 📐

## 1. Index Formula

The Airfare Price Index (APIx) uses a **Paasche-type Spatial Dynamic Index** formula:

```
APIx(t) = Σ [p(t) / p(base) × w(i,j,k)] × 100
```

Where:
- **p(t)** = Average fare for route *i*, airline *j*, advance window *k* on day *t*
- **p(base)** = Average fare on base date (January 1, 2023)
- **w(i,j,k)** = Weight for route × airline × advance window combination
- **Base value** = 100 (set for January 2023)

---

## 2. Weighting Strategy

### 2.1 Route Weights (70% of total weight)

Based on **annual passenger traffic** from DGCA data:

| Route | Annual Passengers | Route Weight |
|-------|------------------|-------------|
| DEL ↔ BOM | 45,000,000 | 17.5% |
| DEL ↔ BLR | 35,000,000 | 13.6% |
| BOM ↔ BLR | 28,000,000 | 10.9% |
| DEL ↔ HYD | 18,000,000 | 7.0% |
| MAA ↔ DEL | 15,000,000 | 5.8% |
| BLR ↔ HYD | 12,000,000 | 4.7% |
| DEL ↔ CCU | 10,000,000 | 3.9% |
| MAA ↔ BOM | 8,000,000 | 3.1% |

**Formula**: `w_route(i) = passengers(i) / Σ passengers`

### 2.2 Airline Weights (30% of total weight)

Based on **domestic market share** (DGCA monthly reports):

| Airline | Market Share | Airline Weight |
|---------|-------------|---------------|
| IndiGo (6E) | 57.0% | 57.0% |
| Air India (AI) | 20.0% | 20.0% |
| SpiceJet (SG) | 12.0% | 12.0% |
| Air India Express (IX) | 8.0% | 8.0% |
| Akasa Air (QP) | 3.0% | 3.0% |

**Formula**: `w_airline(j) = market_share(j) / Σ market_share`

### 2.3 Combined Weight

```
w(i,j) = w_route(i) × 0.70 + w_airline(j) × 0.30
```

---

## 3. Advance-Purchase Windows

Five mandatory booking windows capture price elasticity:

| Window | Days Before Travel | Traveler Profile |
|--------|-------------------|------------------|
| T+1 | 1 day | Last-minute travelers |
| T+7 | 7 days | Business travelers |
| T+15 | 15 days | Planned leisure travel |
| T+30 | 30 days | Standard advance booking |
| T+45 | 45 days | Early bird discounts |

Each window contributes equally (20%) within a route-airline pair.

---

## 4. Index Calculation Process

### 4.1 Daily Index

1. Collect all cleaned fare quotes for date *t*
2. Group by route × airline × advance window
3. Calculate average fare for each group
4. Compare each group's average to base period average
5. Apply weights and sum
6. Result = Daily APIx

### 4.2 Weekly Index

```
Weekly APIx = Σ Daily APIx(d) / 7
```
Where *d* spans Monday to Sunday of the week.

### 4.3 Monthly Index

```
Monthly APIx = Σ Daily APIx(d) / N
```
Where *N* = number of days in the calendar month.

---

## 5. Change Calculations

### Year-over-Year (YoY)
```
YoY% = ((APIx(t) - APIx(t-365)) / APIx(t-365)) × 100
```

### Month-over-Month (MoM)
```
MoM% = ((APIx(t) - APIx(t-30)) / APIx(t-30)) × 100
```

### Week-over-Week (WoW)
```
WoW% = ((APIx(t) - APIx(t-7)) / APIx(t-7)) × 100
```

### Volatility
```
Volatility = StdDev(Daily APIx values over 30-day window) / Mean × 100
```

---

## 6. Data Requirements

| Metric | Minimum Threshold |
|--------|------------------|
| Daily quotes | ≥ 500 per day |
| Route coverage | ≥ 8 of 10 routes |
| Airline coverage | ≥ 4 of 5 airlines |
| Data quality score | ≥ 85% |
| Advance windows | All 5 represented |

---

## 7. Base Period & Revisions

- **Base Period**: January 1, 2023 = 100
- **Revision Schedule**: Quarterly review against DGCA published data
- **Weight Update**: Annual revision based on updated DGCA traffic data
- **Rebasing**: Every 5 years (next: January 2028)

---

## 8. Validation Against DGCA Data

The APIx is validated monthly against DGCA's published average fares:

- **Correlation Target**: Pearson r > 0.80 with DGCA monthly averages
- **Deviation Tolerance**: ±10% from DGCA-derived index
- **Trend Alignment**: Directional agreement > 90% of months

---

## 9. Taxation in Index

### Economy Class
- **GST**: 5% of base fare (2.5% CGST + 2.5% SGST)
- **Airport charges**: ₹300-600 per sector
- **User Development Fee**: ₹0-150

### Business Class
- **GST**: 18% of base fare (9% CGST + 9% SGST)
- **Airport charges**: ₹300-600 per sector

The index tracks **total fare** (inclusive of all taxes and charges) as the primary metric, with a separate **base fare index** for comparison.

---

## 10. Limitations

1. **Sample Size**: 10 routes cover ~70% of domestic traffic; Tier-2/3 routes excluded
2. **Airline Coverage**: 5 airlines cover ~100% of scheduled domestic operations
3. **OTA Markup**: OTA fares may include platform-specific markups not visible in airline quotes
4. **Dynamic Pricing**: Fares change in real-time; daily snapshots capture point-in-time data
5. **Seasonal Events**: Extreme events (strikes, weather, festivals) may cause temporary index distortion

---

*This methodology is aligned with international best practices from BLS (USA), ONS (UK), and ABS (Australia) for transport price indices.*
