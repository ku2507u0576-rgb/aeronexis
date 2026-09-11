from sqlalchemy import Column, String, Integer, Float, Date, DateTime, Integer
from sqlalchemy.sql import func
from backend.database import Base

class AirfareIndex(Base):
    __tablename__ = "airfare_indices"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    index_date = Column(Date, nullable=False)
    index_type = Column(String, nullable=False) # daily/weekly/monthly
    origin = Column(String(3), nullable=True)
    destination = Column(String(3), nullable=True)
    airline_code = Column(String(2), nullable=True)
    base_year = Column(Integer, default=2023)
    base_value = Column(Float, default=100.0)
    index_value = Column(Float, nullable=False)
    index_value_base_fare = Column(Float, nullable=True)
    index_value_total_fare = Column(Float, nullable=True)
    no_of_quotes = Column(Integer, nullable=False)
    yoy_change_pct = Column(Float, nullable=True)
    mom_change_pct = Column(Float, nullable=True)
    wow_change_pct = Column(Float, nullable=True)
    volatility_pct = Column(Float, nullable=True)
    calculation_timestamp = Column(DateTime(timezone=True), server_default=func.now())
