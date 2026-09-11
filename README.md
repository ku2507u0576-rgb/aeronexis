# Real-Time Airfare Price Index (APIx) 🇮🇳

> **Government-Grade Airfare Price Monitoring Platform for India**
> Built for MoSPI analysts, RBI researchers, policy makers, and inflation-tracking teams.

[![License: GOI](https://img.shields.io/badge/License-Government%20of%20India-orange.svg)]()
[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-blue.svg)]()
[![React 18](https://img.shields.io/badge/React-18-61DAFB.svg)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688.svg)]()

---

## 🎯 Overview

The **Airfare Price Index (APIx)** is an end-to-end automated platform that:

- 🕸️ **Web-scrapes real-time fares** from 5 major Indian airlines + 6 OTAs
- 🧹 **Cleans, normalizes, and de-duplicates** raw quote data
- 📊 **Computes daily, weekly, and monthly** Airfare Price Index
- 📈 **Provides 11-page interactive dashboard** with government-grade analytics
- 🔌 **Exposes REST API** for NSO/RBI consumption
- ✅ **Demonstrates 30+ days** of backtested results against DGCA data

---

## ✈️ Data Sources

### Airlines (5 Major Carriers)
| Airline | Code | Market Share | Type |
|---------|------|-------------|------|
| IndiGo | 6E | 57% | LCC |
| Air India | AI | 20% | FSC |
| SpiceJet | SG | 12% | LCC |
| Air India Express | IX | 8% | LCC |
| Akasa Air | QP | 3% | LCC |

### OTAs (6 Aggregators)
MakeMyTrip, Yatra, EaseMyTrip, Cleartrip, Ixigo, Goibibo

### Routes (10 Tier-1 City Pairs)
| Route | Distance | Annual Pax |
|-------|----------|-----------|
| DEL ↔ BOM | 1,400 km | ~45M |
| DEL ↔ BLR | 2,100 km | ~35M |
| BOM ↔ BLR | 670 km | ~28M |
| DEL ↔ HYD | 1,700 km | ~18M |
| MAA ↔ DEL | 2,200 km | ~15M |
| BLR ↔ HYD | 570 km | ~12M |
| DEL ↔ CCU | 1,450 km | ~10M |
| MAA ↔ BOM | 1,300 km | ~8M |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/mospi/airfare-index.git
cd airfare-index

# Backend setup
pip install -r requirements.txt
cp .env.example .env

# Seed database with 30+ days of demo data
python -m backend.seed.seed_database

# Start API server
uvicorn backend.main:app --reload --port 8000

# Frontend setup (in a new terminal)
cd frontend
npm install
npm start
```

### Access Points
| Service | URL |
|---------|-----|
| Dashboard | http://localhost:3000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| API Docs (ReDoc) | http://localhost:8000/redoc |
| API Base URL | http://localhost:8000/v1 |

---

## 📊 Dashboard Pages (11)

| # | Page | Description |
|---|------|-------------|
| 1 | **Dashboard** | Landing with KPI cards, 7-day trend, alerts |
| 2 | **Airfare Index** | Core index with frequency filters and comparisons |
| 3 | **Flight Fares** | Raw data table with sorting, filtering, export |
| 4 | **Advance Booking** | Lead-time price elasticity analysis |
| 5 | **Route Analysis** | Interactive India network map |
| 6 | **Price Trends** | Historical analysis with statistics |
| 7 | **Airline Analysis** | Competitive comparison and drill-down |
| 8 | **Data Quality** | Quality metrics and source breakdown |
| 9 | **Collection Status** | Scraper health and monitoring |
| 10 | **Sector Heatmap** | Color-coded route performance map |
| 11 | **API & Export** | API documentation and data export |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/airfare-index` | Current index value with filters |
| GET | `/v1/routes` | All monitored routes with indices |
| GET | `/v1/fares` | Fare data with filters + pagination |
| GET | `/v1/airlines` | Airline comparison data |
| GET | `/v1/trends` | Historical price trends |
| GET | `/v1/advance-booking` | Lead-time elasticity analysis |
| GET | `/v1/export` | CSV/Excel/JSON data export |
| GET | `/v1/data-quality` | Data quality metrics |
| GET | `/v1/collection-status` | Scraper status |
| GET | `/v1/dashboard-summary` | Dashboard landing page data |

**Authentication**: API key via `X-API-Key` header  
**Rate Limit**: 1,000 requests/day, 10 requests/minute  
**Demo Key**: `apix-demo-key-2026`

---

## 🏗️ Architecture

```
SOURCES (Airlines + OTAs)
        ↓
WEB SCRAPING ENGINE (Python/Scrapy/Playwright)
        ↓
RAW DATA STORAGE (SQLite/PostgreSQL)
        ↓
DATA CLEANING PIPELINE (6-step validation)
        ↓
CLEANED DATA STORAGE
        ↓
INDEX CALCULATION ENGINE (Paasche-type weighted)
        ↓
DASHBOARD (React.js) + API (FastAPI)
        ↓
VISUALIZATION & EXPORT (REST API)
```

### Technology Stack

| Layer | Technology |
|-------|-----------|
| Scraping | Python (Scrapy, Playwright, BeautifulSoup4) |
| Backend | FastAPI + Uvicorn |
| Database | SQLite (demo) / PostgreSQL (production) |
| Data Processing | Pandas, NumPy, SciPy |
| Frontend | React.js 18 + Ant Design |
| Charts | Chart.js + D3.js |
| Testing | Pytest + Jest |

---

## 📈 Index Methodology

**Formula**: `APIx(t) = Σ [p(t) / p(base) × w(i,j)] × 100`

- **Base Period**: January 2023 = 100
- **Weighting**: Route traffic (70%) + Airline market share (30%)
- **Frequencies**: Daily, Weekly, Monthly
- **Comparisons**: YoY, MoM, WoW

See [METHODOLOGY.md](METHODOLOGY.md) for full details.

---

## ✅ Data Quality

- **Target Quality Score**: >92%
- **Validation Steps**: Schema → Duplicates → Outliers → Missing Values → Fare Components → Normalization
- **Current Score**: 92.0% (Excellent)

See [DATA-QUALITY.md](DATA-QUALITY.md) for full details.

---

## 🧪 Testing

```bash
# Run all backend tests
cd backend && python -m pytest tests/ -v

# Run specific test suites
python -m pytest tests/test_api.py -v
python -m pytest tests/test_pipeline.py -v
python -m pytest tests/test_index.py -v
```

---

## 💰 Cost Estimates (Production)

| Component | Monthly Cost (₹) |
|-----------|------------------|
| Cloud Hosting (AWS EC2 + RDS) | ₹7,500-15,000 |
| Proxy Service (Bright Data) | ₹22,500-37,500 |
| CDN (Cloudflare Free) | ₹0 |
| Monitoring (Sentry Free) | ₹0 |
| Domain | ₹100/month |
| **Total** | **₹30,000-52,500/month** |

---

## 📄 License

Government of India, Ministry of Statistics & Programme Implementation (MoSPI)

---

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

*Built with ❤️ for Indian aviation data transparency*
