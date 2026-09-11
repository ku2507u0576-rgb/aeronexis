from __future__ import annotations
import json
from datetime import datetime
from sqlalchemy.orm import Session
from .schema_validator import validate_schema
from .duplicate_detector import detect_duplicates
from .outlier_detector import remove_outliers
from .missing_value_handler import impute_missing
from .fare_validator import validate_fare_components
from .normalizer import normalize_quote
from .quality_scorer import calculate_quality_score
from backend.models import CleanedFare, DataQualityLog

def run_full_pipeline(db: Session, raw_quotes: list[dict]):
    total = len(raw_quotes)
    if total == 0:
        return
    
    # 1. Schema Validation
    valid_schema_quotes = []
    incomplete_count = 0
    for q in raw_quotes:
        is_valid, _ = validate_schema(q)
        if is_valid:
            valid_schema_quotes.append(q)
        else:
            incomplete_count += 1
            
    # 2. Normalization
    normalized_quotes = [normalize_quote(q) for q in valid_schema_quotes]
    
    # 3. Missing Value Imputation
    imputed_quotes = impute_missing(normalized_quotes)
    missing_count = sum(1 for q in normalized_quotes if q.get('taxes') is None) # approx count
    
    # 4. Fare Validation
    fare_validated = [validate_fare_components(q) for q in imputed_quotes]
    
    # 5. Duplicate Detection
    unique_quotes, duplicate_count = detect_duplicates(fare_validated)
    
    # 6. Outlier Detection
    clean_quotes, outlier_quotes = remove_outliers(unique_quotes)
    outlier_count = len(outlier_quotes)
    
    valid_count = len(clean_quotes)
    
    # Score
    score = calculate_quality_score(total, valid_count, duplicate_count, outlier_count, missing_count)
    
    log = DataQualityLog(
        log_date=datetime.now().date(),
        total_quotes_collected=total,
        valid_quotes=valid_count,
        duplicate_quotes=duplicate_count,
        outlier_quotes=outlier_count,
        missing_values_count=missing_count,
        incomplete_fares_count=incomplete_count,
        cancelled_flights_count=0,
        data_quality_score_pct=score,
        issues_flagged=json.dumps({"pipeline_run": True})
    )
    db.add(log)
    
    # Insert Cleaned Fares
    for q in clean_quotes:
        cf = CleanedFare(
            origin=q['origin'],
            destination=q['destination'],
            departure_date=datetime.strptime(q['departure_date'], "%Y-%m-%d").date() if isinstance(q['departure_date'], str) else q['departure_date'],
            advance_days=q['advance_days'],
            airline_code=q['airline_code'],
            base_fare=q['base_fare'],
            taxes=q['taxes'],
            total_fare=q['total_fare'],
            fare_class=q.get('fare_class', 'Economy'),
            collection_date=datetime.now().date(),
        )
        db.add(cf)
    
    db.commit()

__all__ = ["run_full_pipeline"]
