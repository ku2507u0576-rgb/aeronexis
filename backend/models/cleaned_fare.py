from sqlalchemy import Column, String, Integer, Float, Boolean, Date, Integer
from backend.database import Base

class CleanedFare(Base):
    __tablename__ = "cleaned_fares"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    origin = Column(String(3), nullable=False)
    destination = Column(String(3), nullable=False)
    departure_date = Column(Date, nullable=False)
    advance_days = Column(Integer, nullable=False)
    airline_code = Column(String(2), nullable=False)
    base_fare = Column(Float, nullable=False)
    taxes = Column(Float, nullable=False)
    total_fare = Column(Float, nullable=False)
    fare_class = Column(String, nullable=False)
    collection_date = Column(Date, nullable=False)
    is_aggregate = Column(Boolean, default=False)
    quote_count = Column(Integer, default=1)
