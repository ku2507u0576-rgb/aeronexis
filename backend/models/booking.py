from __future__ import annotations
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Date
from backend.database import Base

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    pnr = Column(String(10), unique=True, index=True, nullable=False)
    passenger_name = Column(String(100), nullable=False)
    passenger_email = Column(String(100), nullable=False)
    passenger_phone = Column(String(20), nullable=False)
    origin = Column(String(3), nullable=False)
    destination = Column(String(3), nullable=False)
    airline_code = Column(String(2), nullable=False)
    airline_name = Column(String(50), nullable=False)
    flight_number = Column(String(20), nullable=False)
    departure_date = Column(String(20), nullable=False)
    seat_number = Column(String(10), nullable=False)
    fare_class = Column(String(20), default="Economy")
    fare_amount = Column(Float, nullable=False)
    taxes = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    status = Column(String(20), default="CONFIRMED")
    booking_timestamp = Column(DateTime, default=datetime.now)
