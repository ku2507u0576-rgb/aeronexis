# Data Quality Standards 📋

## 1. Validation Pipeline

The data cleaning pipeline performs 6 sequential validation steps on every raw fare quote:

### Step 1: Schema Validation ✅
- **Purpose**: Ensure all required fields are present and correctly typed
- **Required Fields**: origin, destination, departure_date, airline_code, base_fare, taxes, total_fare
- **Validations**:
  - IATA codes: exactly 3 uppercase characters
  - Airline codes: exactly 2 characters, must be known (6E, AI, IX, SG, QP)
  - Base fare: ₹500 – ₹50,000 range
  - Total fare: ₹800 – ₹60,000 range
  - Dates: valid ISO 8601 format
- **Failure Action**: Quote rejected, logged with reason

### Step 2: Duplicate Detection 🔍
- **Purpose**: Remove exact duplicates within the same collection batch
- **Duplicate Key**: (origin, destination, departure_date, advance_days, airline_code, total_fare)
- **Method**: Hash-based set membership check
- **Threshold**: >5% duplicates triggers quality score deduction

### Step 3: Outlier Detection 📊
- **Purpose**: Remove statistically anomalous fares
- **Method**: Inter-Quartile Range (IQR) per route
  - Q1 = 25th percentile
  - Q3 = 75th percentile
  - IQR = Q3 - Q1
  - Valid range: [Q1 - 1.5×IQR, Q3 + 1.5×IQR]
- **Examples of outliers**:
  - DEL→BOM economy fare of ₹25,000 (typical: ₹3,500-6,500)
  - BLR→HYD fare of ₹200 (below minimum realistic fare)
- **Threshold**: >15% outliers triggers quality score deduction

### Step 4: Missing Value Imputation 🔧
- **Purpose**: Fill gaps in non-critical fields
- **Rules**:
  - Missing `taxes`: Impute as 5% of base_fare + ₹400 (airport charges)
  - Missing `user_dev_fee`: Set to ₹0
  - Missing `convenience_charge`: Set to ₹0
  - Missing `flight_number`: Leave as NULL (non-critical)
  - Missing `aircraft_type`: Leave as NULL (non-critical)
- **Threshold**: >10% missing values triggers quality score deduction

### Step 5: Fare Component Validation 💰
- **Purpose**: Verify mathematical consistency of fare breakdown
- **Rule**: `total_fare ≈ base_fare + taxes + user_dev_fee + convenience_charge`
- **Tolerance**: ±₹50
- **Mismatch Action**: Flag with `data_quality_flag = 'fare_mismatch'`, do not reject

### Step 6: Normalization 📐
- **Purpose**: Standardize all data formats
- **Actions**:
  - Dates → ISO 8601 (YYYY-MM-DD)
  - Currency → All values in ₹ (INR), rounded to 2 decimal places
  - Airline codes → Uppercase
  - IATA codes → Uppercase, 3 characters

---

## 2. Quality Score Formula

```
Quality Score = (valid_quotes / total_quotes) × 100 - deductions
```

### Deductions:
| Condition | Deduction |
|-----------|-----------|
| Duplicates > 5% of total | -5 points |
| Missing values > 10% of total | -10 points |
| Outliers > 15% of total | -5 points |

### Score Ranges:
| Score | Rating | Action |
|-------|--------|--------|
| ≥ 95% | 🟢 Excellent | No action needed |
| 90-94% | 🟢 Good | Monitor trends |
| 85-89% | 🟡 Acceptable | Review sources with lowest quality |
| 80-84% | 🟡 Warning | Investigate and fix data issues |
| < 80% | 🔴 Critical | Immediate investigation required |

---

## 3. Quality Metrics by Source

### Airlines (Direct Scraping)
| Metric | Target | Typical |
|--------|--------|---------|
| Valid quotes | > 95% | 93-96% |
| Duplicates | < 3% | 2-4% |
| Completeness | > 98% | 97-99% |
| Timeliness | < 6 hours old | 1-4 hours |

### OTAs (Aggregator Scraping)
| Metric | Target | Typical |
|--------|--------|---------|
| Valid quotes | > 90% | 88-93% |
| Duplicates | < 8% | 5-10% |
| Completeness | > 95% | 93-97% |
| Timeliness | < 6 hours old | 2-5 hours |

---

## 4. Daily Quality Report

Generated automatically after each collection cycle:

```
DATA QUALITY REPORT — 15 Sep 2026
─────────────────────────────────────────
Total Quotes Collected:     15,420
Valid Quotes:               14,280 (92.6%)
Duplicates Removed:            620 (4.0%)
Outliers Detected:             310 (2.0%)
Incomplete Fares:              210 (1.4%)
────────────────────────────────────────
Data Quality Score:         92.0% ✓ Good
────────────────────────────────────────
```

---

## 5. Alerting Thresholds

| Alert | Condition | Severity |
|-------|-----------|----------|
| Low collection | < 50% expected quotes | 🔴 Critical |
| High duplicates | > 10% duplicates | 🟡 Warning |
| High outliers | > 20% outliers | 🟡 Warning |
| Scraper failure | Any source down > 1 hour | 🔴 Critical |
| CAPTCHA detected | > 3 CAPTCHAs per day | 🟡 Warning |
| Quality drop | Score < 85% | 🔴 Critical |

---

## 6. Data Retention Policy

| Data Type | Retention | Storage |
|-----------|-----------|---------|
| Raw fares | 90 days | Primary database |
| Cleaned fares | 3 years | Primary database |
| Index values | Permanent | Primary database |
| Quality logs | 1 year | Primary database |
| Archived raw data | 1 year | Archive storage |

---

*Data quality standards aligned with UN Statistical Quality Assurance Framework (UN-SQAF) and Indian Statistical Standards.*
