from sqlalchemy import Column, Integer, Float, Date, DateTime, Integer, Text
from sqlalchemy.sql import func
from backend.database import Base

class DataQualityLog(Base):
    __tablename__ = "data_quality_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    log_date = Column(Date, nullable=False)
    total_quotes_collected = Column(Integer, nullable=False)
    valid_quotes = Column(Integer, nullable=False)
    duplicate_quotes = Column(Integer, nullable=False)
    outlier_quotes = Column(Integer, nullable=False)
    missing_values_count = Column(Integer, nullable=False)
    incomplete_fares_count = Column(Integer, nullable=False)
    cancelled_flights_count = Column(Integer, nullable=False)
    data_quality_score_pct = Column(Float, nullable=False)
    issues_flagged = Column(Text, nullable=True) # JSON
    logged_at = Column(DateTime(timezone=True), server_default=func.now())
