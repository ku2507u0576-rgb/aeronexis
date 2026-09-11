from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import date, datetime

class APIResponse(BaseModel):
    status: str
    data: Any
    message: str = ""

class IndexResponse(BaseModel):
    index_date: date
    index_type: str
    index_value: float
    base_year: int
    base_value: float
    change_yoy_pct: float
    change_mom_pct: float
    change_wow_pct: float
    routes_included: int
    airlines_included: int
    total_quotes: int
    volatility_pct: float
    last_updated: datetime
    model_config = ConfigDict(from_attributes=True)

class RouteResponse(BaseModel):
    route_code: str
    origin: str
    destination: str
    origin_name: str
    destination_name: str
    distance_km: float
    current_avg_fare: float
    current_index: float
    change_pct: float
    demand_tier: str
    annual_passengers: int
    airlines_tracked: int
    last_updated: datetime
    model_config = ConfigDict(from_attributes=True)

class FareResponse(BaseModel):
    fare_id: int
    origin: str
    destination: str
    airline_code: str
    airline_name: str
    departure_date: datetime
    advance_days: int
    base_fare: float
    taxes: float
    user_dev_fee: float
    convenience_charge: float
    total_fare: float
    fare_class: str
    source: str
    collection_date: datetime
    data_quality_flag: str
    model_config = ConfigDict(from_attributes=True)

class FareAggregates(BaseModel):
    avg_fare: float
    min_fare: float
    max_fare: float
    median_fare: float
    model_config = ConfigDict(from_attributes=True)

class FaresListResponse(BaseModel):
    fares: List[FareResponse]
    aggregates: FareAggregates
    model_config = ConfigDict(from_attributes=True)

class AirlineResponse(BaseModel):
    airline_code: str
    airline_name: str
    iata_code: str
    icao_code: str
    market_share_pct: float
    avg_fare: float
    current_index: float
    change_yoy: float
    routes_tracked: int
    quotes_collected: int
    data_quality: float
    cheapest_route: str
    cheapest_price: float
    most_expensive_route: str
    most_expensive_price: float
    model_config = ConfigDict(from_attributes=True)

class TrendPoint(BaseModel):
    date: date
    index: float
    avg_fare: float
    model_config = ConfigDict(from_attributes=True)

class TrendResponse(BaseModel):
    period: str
    frequency: str
    start_date: date
    end_date: date
    trend_points: List[TrendPoint]
    statistics: Dict[str, float]
    model_config = ConfigDict(from_attributes=True)

class AdvanceBookingWindow(BaseModel):
    advance_days: int
    avg_fare: float
    median_fare: float
    std_dev: float
    model_config = ConfigDict(from_attributes=True)

class AdvanceBookingResponse(BaseModel):
    route: str
    analysis: List[AdvanceBookingWindow]
    elasticity: Dict[str, float]
    model_config = ConfigDict(from_attributes=True)

class DataQualityResponse(BaseModel):
    log_date: date
    total_quotes: int
    valid_quotes: int
    duplicate_quotes: int
    outlier_quotes: int
    missing_values: int
    data_quality_score: float
    issues: List[str]
    model_config = ConfigDict(from_attributes=True)

class CollectionStatusResponse(BaseModel):
    source: str
    status: str
    last_run: datetime
    quotes_count: int
    model_config = ConfigDict(from_attributes=True)

class ExportResponse(BaseModel):
    format: str
    download_url: str
    record_count: int
    model_config = ConfigDict(from_attributes=True)
