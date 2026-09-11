"""
Seed Database Script
Populates the database with reference data and 30+ days of synthetic airfare data.
Run with: python3 -m backend.seed.seed_database
"""
from __future__ import annotations

import os
import sys
from datetime import datetime, date, timedelta

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from backend.database import init_db, SessionLocal
from backend.models.airport import Airport
from backend.models.airline import Airline
from backend.models.route import Route
from backend.models.raw_fare import RawFare
from backend.models.cleaned_fare import CleanedFare
from backend.models.airfare_index import AirfareIndex
from backend.models.data_quality_log import DataQualityLog
from backend.seed.synthetic_data import generate_synthetic_data


def seed_reference_data(db):
    """Seed airports, airlines, and routes."""
    print("  Seeding 6 airports...")
    airports = [
        Airport(iata_code="DEL", name="Indira Gandhi International Airport", city="New Delhi", state="Delhi", latitude=28.5562, longitude=77.1000, is_metro=True),
        Airport(iata_code="BOM", name="Chhatrapati Shivaji Maharaj International Airport", city="Mumbai", state="Maharashtra", latitude=19.0896, longitude=72.8656, is_metro=True),
        Airport(iata_code="BLR", name="Kempegowda International Airport", city="Bengaluru", state="Karnataka", latitude=13.1986, longitude=77.7066, is_metro=True),
        Airport(iata_code="HYD", name="Rajiv Gandhi International Airport", city="Hyderabad", state="Telangana", latitude=17.2403, longitude=78.4294, is_metro=True),
        Airport(iata_code="MAA", name="Chennai International Airport", city="Chennai", state="Tamil Nadu", latitude=12.9941, longitude=80.1709, is_metro=True),
        Airport(iata_code="CCU", name="Netaji Subhas Chandra Bose International Airport", city="Kolkata", state="West Bengal", latitude=22.6520, longitude=88.4463, is_metro=True),
    ]
    for a in airports:
        db.merge(a)

    print("  Seeding 5 airlines...")
    airlines = [
        Airline(code="6E", name="IndiGo", iata_code="6E", icao_code="IGO", market_share_pct=57.0, carrier_type="LCC", is_active=True),
        Airline(code="AI", name="Air India", iata_code="AI", icao_code="AIC", market_share_pct=20.0, carrier_type="FSC", is_active=True),
        Airline(code="SG", name="SpiceJet", iata_code="SG", icao_code="SEJ", market_share_pct=12.0, carrier_type="LCC", is_active=True),
        Airline(code="IX", name="Air India Express", iata_code="IX", icao_code="AXB", market_share_pct=8.0, carrier_type="LCC", is_active=True),
        Airline(code="QP", name="Akasa Air", iata_code="QP", icao_code="AKJ", market_share_pct=3.0, carrier_type="LCC", is_active=True),
    ]
    for a in airlines:
        db.merge(a)

    print("  Seeding 10 Tier-1 routes...")
    routes = [
        Route(origin="DEL", destination="BOM", distance_km=1148, typical_flight_time_minutes=130, annual_passengers=7000000, demand_tier="Tier-1", is_monitored=True),
        Route(origin="DEL", destination="BLR", distance_km=1740, typical_flight_time_minutes=165, annual_passengers=4000000, demand_tier="Tier-1", is_monitored=True),
        Route(origin="BOM", destination="BLR", distance_km=842, typical_flight_time_minutes=105, annual_passengers=3500000, demand_tier="Tier-1", is_monitored=True),
        Route(origin="DEL", destination="HYD", distance_km=1253, typical_flight_time_minutes=130, annual_passengers=3000000, demand_tier="Tier-1", is_monitored=True),
        Route(origin="BLR", destination="HYD", distance_km=448, typical_flight_time_minutes=70, annual_passengers=1500000, demand_tier="Tier-1", is_monitored=True),
        Route(origin="MAA", destination="DEL", distance_km=1760, typical_flight_time_minutes=170, annual_passengers=2500000, demand_tier="Tier-1", is_monitored=True),
        Route(origin="DEL", destination="CCU", distance_km=1305, typical_flight_time_minutes=135, annual_passengers=2000000, demand_tier="Tier-1", is_monitored=True),
        Route(origin="BOM", destination="DEL", distance_km=1148, typical_flight_time_minutes=130, annual_passengers=7000000, demand_tier="Tier-1", is_monitored=True),
        Route(origin="MAA", destination="BOM", distance_km=1028, typical_flight_time_minutes=115, annual_passengers=1800000, demand_tier="Tier-1", is_monitored=True),
        Route(origin="BLR", destination="DEL", distance_km=1740, typical_flight_time_minutes=165, annual_passengers=4000000, demand_tier="Tier-1", is_monitored=True),
    ]
    for r in routes:
        db.merge(r)

    db.commit()
    print("  ✅ Reference data seeded")


def seed_fare_data(db):
    """Generate and insert synthetic fare data."""
    print("\n📊 Generating 32 days of synthetic fare data (Aug 10 - Sep 10, 2026)...")
    raw_quotes = generate_synthetic_data("2026-08-10", days=32)
    print(f"  Generated {len(raw_quotes)} raw fare quotes")

    # Insert raw fares
    print("  Inserting raw fares into database...")
    raw_fields = {'origin', 'destination', 'departure_date', 'return_date', 'advance_days',
                  'airline_code', 'airline_name', 'base_fare', 'taxes', 'user_dev_fee',
                  'convenience_charge', 'total_fare', 'fare_class', 'flight_number',
                  'aircraft_type', 'source', 'is_valid'}
    
    inserted = 0
    for q in raw_quotes:
        try:
            fare_data = {}
            for k, v in q.items():
                if k in raw_fields:
                    fare_data[k] = v
            # Convert departure_date string to date object
            if isinstance(fare_data.get('departure_date'), str):
                fare_data['departure_date'] = datetime.strptime(fare_data['departure_date'], '%Y-%m-%d').date()
            fare_data['is_valid'] = True
            fare_data['collection_timestamp'] = datetime.now()
            db.add(RawFare(**fare_data))
            inserted += 1
        except Exception as e:
            if inserted < 3:
                print(f"    Warning: {e}")
            continue
    
    db.commit()
    print(f"  ✅ Inserted {inserted} raw fares")

    # Run cleaning pipeline
    print("\n🧹 Running data cleaning pipeline...")
    from backend.pipeline.schema_validator import validate_schema
    from backend.pipeline.duplicate_detector import detect_duplicates
    from backend.pipeline.outlier_detector import remove_outliers
    from backend.pipeline.missing_value_handler import impute_missing
    from backend.pipeline.fare_validator import validate_fare_components
    from backend.pipeline.normalizer import normalize_quote
    from backend.pipeline.quality_scorer import calculate_quality_score

    total = len(raw_quotes)

    # Step 1: Schema validation
    valid_quotes = []
    invalid_count = 0
    for q in raw_quotes:
        is_valid, reason = validate_schema(q)
        if is_valid:
            valid_quotes.append(q)
        else:
            invalid_count += 1
    print(f"  Step 1 - Schema validation: {len(valid_quotes)} valid, {invalid_count} invalid")

    # Step 2: Normalize
    normalized = [normalize_quote(q) for q in valid_quotes]
    print(f"  Step 2 - Normalized: {len(normalized)} quotes")

    # Step 3: Impute missing
    imputed = impute_missing(normalized)
    print(f"  Step 3 - Missing values imputed")

    # Step 4: Validate fares
    fare_validated = [validate_fare_components(q) for q in imputed]
    mismatch_count = sum(1 for q in fare_validated if q.get('data_quality_flag') == 'fare_mismatch')
    print(f"  Step 4 - Fare validation: {mismatch_count} mismatches flagged")

    # Step 5: Remove duplicates
    unique_quotes, dup_count = detect_duplicates(fare_validated)
    print(f"  Step 5 - Duplicates removed: {dup_count}")

    # Step 6: Remove outliers
    clean_quotes, outlier_list = remove_outliers(unique_quotes)
    outlier_count = len(outlier_list)
    print(f"  Step 6 - Outliers removed: {outlier_count}")

    valid_count = len(clean_quotes)
    score = calculate_quality_score(total, valid_count, dup_count, outlier_count, invalid_count)
    print(f"  ✅ Pipeline complete: {valid_count} clean fares, Quality Score: {score:.1f}%")

    # Insert cleaned fares
    print("\n💾 Saving cleaned fares to database...")
    for q in clean_quotes:
        try:
            dep_date = q['departure_date']
            if isinstance(dep_date, str):
                dep_date = datetime.strptime(dep_date, '%Y-%m-%d').date()
            
            cf = CleanedFare(
                origin=q['origin'],
                destination=q['destination'],
                departure_date=dep_date,
                advance_days=q['advance_days'],
                airline_code=q['airline_code'],
                base_fare=q['base_fare'],
                taxes=q.get('taxes', 0),
                total_fare=q['total_fare'],
                fare_class=q.get('fare_class', 'Economy'),
                collection_date=datetime.now().date(),
                is_aggregate=False,
                quote_count=1,
            )
            db.add(cf)
        except Exception:
            continue
    db.commit()
    print(f"  ✅ Saved {valid_count} cleaned fares")

    # Save quality log
    quality_log = DataQualityLog(
        log_date=datetime.now().date(),
        total_quotes_collected=total,
        valid_quotes=valid_count,
        duplicate_quotes=dup_count,
        outlier_quotes=outlier_count,
        missing_values_count=invalid_count,
        incomplete_fares_count=mismatch_count,
        cancelled_flights_count=0,
        data_quality_score_pct=score,
        issues_flagged='{"pipeline": "complete", "status": "success"}'
    )
    db.add(quality_log)
    db.commit()
    print("  ✅ Quality log saved")


def seed_indices(db):
    """Calculate and store daily, weekly, and monthly indices."""
    print("\n📈 Calculating Airfare Price Indices...")
    
    from backend.index_engine.weights import calculate_weights
    
    # Get routes and airlines for weights
    routes = db.query(Route).all()
    airlines = db.query(Airline).all()
    
    weights = calculate_weights(
        [{"origin": r.origin, "destination": r.destination, "annual_passengers": r.annual_passengers} for r in routes],
        [{"code": a.code, "market_share_pct": a.market_share_pct} for a in airlines]
    )
    
    # Calculate daily indices for 30 days
    start_date = date(2026, 8, 10)
    end_date = date(2026, 9, 10)
    current = start_date
    day_count = 0
    
    while current <= end_date:
        # Get cleaned fares for this date
        day_fares = db.query(CleanedFare).filter(
            CleanedFare.departure_date == current
        ).all()
        
        if day_fares:
            # Calculate average fare
            total_fares = [f.total_fare for f in day_fares if f.total_fare]
            if total_fares:
                avg_fare = sum(total_fares) / len(total_fares)
                # Base fare (simulated Jan 2023) — roughly 15% lower
                base_avg = avg_fare * 0.85
                
                # Simple index calculation
                index_value = (avg_fare / base_avg) * 100 if base_avg > 0 else 100.0
                
                # Add some realistic variation
                import random
                index_value = round(index_value + random.uniform(-3, 5), 2)
                
                # Ensure index trends upward slightly over the month
                days_from_start = (current - start_date).days
                trend_factor = days_from_start * 0.15
                index_value = round(index_value + trend_factor, 2)
                
                # Clamp to realistic range
                index_value = max(98.0, min(125.0, index_value))
                
                daily_idx = AirfareIndex(
                    index_date=current,
                    index_type='daily',
                    base_year=2023,
                    base_value=100.0,
                    index_value=index_value,
                    no_of_quotes=len(total_fares),
                    calculation_timestamp=datetime.now(),
                )
                db.add(daily_idx)
                day_count += 1
        
        current += timedelta(days=1)
    
    db.commit()
    print(f"  ✅ Calculated {day_count} daily indices")
    
    # Weekly indices (average of daily)
    daily_indices = db.query(AirfareIndex).filter(
        AirfareIndex.index_type == 'daily'
    ).order_by(AirfareIndex.index_date).all()
    
    week_count = 0
    for i in range(0, len(daily_indices), 7):
        week_batch = daily_indices[i:i+7]
        if week_batch:
            avg_idx = sum(d.index_value for d in week_batch) / len(week_batch)
            weekly = AirfareIndex(
                index_date=week_batch[-1].index_date,
                index_type='weekly',
                base_year=2023,
                base_value=100.0,
                index_value=round(avg_idx, 2),
                no_of_quotes=sum(d.no_of_quotes for d in week_batch),
                calculation_timestamp=datetime.now(),
            )
            db.add(weekly)
            week_count += 1
    
    db.commit()
    print(f"  ✅ Calculated {week_count} weekly indices")
    
    # Monthly index
    if daily_indices:
        monthly_avg = sum(d.index_value for d in daily_indices) / len(daily_indices)
        monthly = AirfareIndex(
            index_date=daily_indices[-1].index_date,
            index_type='monthly',
            base_year=2023,
            base_value=100.0,
            index_value=round(monthly_avg, 2),
            no_of_quotes=sum(d.no_of_quotes for d in daily_indices),
            calculation_timestamp=datetime.now(),
        )
        db.add(monthly)
        db.commit()
        print(f"  ✅ Calculated monthly index: {monthly_avg:.2f}")


def seed_db():
    """Main seeding function."""
    print("=" * 60)
    print("🇮🇳 Real-Time Airfare Price Index (APIx) — Database Seeder")
    print("=" * 60)

    # Remove old database
    db_path = "./airfare_index.db"
    if os.path.exists(db_path):
        os.remove(db_path)
        print("🗑️  Removed old database")

    print("\n🔧 Initializing database schema...")
    init_db()
    print("  ✅ All tables created")

    db = SessionLocal()

    try:
        print("\n📦 Seeding reference data...")
        seed_reference_data(db)

        seed_fare_data(db)

        seed_indices(db)

        # Final summary
        print("\n" + "=" * 60)
        print("✅ DATABASE SEEDING COMPLETE!")
        print("=" * 60)
        print(f"  Airports:      {db.query(Airport).count()}")
        print(f"  Airlines:      {db.query(Airline).count()}")
        print(f"  Routes:        {db.query(Route).count()}")
        print(f"  Raw Fares:     {db.query(RawFare).count()}")
        print(f"  Cleaned Fares: {db.query(CleanedFare).count()}")
        print(f"  Index Entries: {db.query(AirfareIndex).count()}")
        print(f"  Quality Logs:  {db.query(DataQualityLog).count()}")
        print("=" * 60)
        print("\n🚀 Start the API server: python3 -m uvicorn backend.main:app --reload --port 8000")
        print("📊 Then open dashboard: cd frontend && npm install && npm start")
        print()

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    seed_db()
