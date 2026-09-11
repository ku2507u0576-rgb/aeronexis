from sqlalchemy import Column, String, Integer, Float, Boolean, Date, DateTime
from sqlalchemy.sql import func
from backend.database import Base

class RawFare(Base):
    __tablename__ = "raw_fares"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    origin = Column(String(3), nullable=False)
    destination = Column(String(3), nullable=False)
    departure_date = Column(Date, nullable=False)
    return_date = Column(Date, nullable=True)
    advance_days = Column(Integer, nullable=False)
    airline_code = Column(String(2), nullable=False)
    airline_name = Column(String, nullable=True)
    base_fare = Column(Float, nullable=False)
    taxes = Column(Float, nullable=True)
    user_dev_fee = Column(Float, nullable=True)
    convenience_charge = Column(Float, nullable=True)
    total_fare = Column(Float, nullable=False)
    fare_class = Column(String, nullable=True, default="Economy")
    flight_number = Column(String, nullable=True)
    scheduled_departure = Column(DateTime, nullable=True)
    scheduled_arrival = Column(DateTime, nullable=True)
    aircraft_type = Column(String, nullable=True)
    source = Column(String, nullable=False)
    collection_timestamp = Column(DateTime, server_default=func.now())
    is_valid = Column(Boolean, default=True)
    collection_batch_id = Column(String, nullable=True)
    data_quality_flag = Column(String, nullable=True)
