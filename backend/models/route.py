from sqlalchemy import Column, String, Integer, Boolean
from backend.database import Base

class Route(Base):
    __tablename__ = "routes"

    origin = Column(String(3), primary_key=True)
    destination = Column(String(3), primary_key=True)
    distance_km = Column(Integer, nullable=False)
    typical_flight_time_minutes = Column(Integer, nullable=False)
    annual_passengers = Column(Integer, nullable=False)
    demand_tier = Column(String, nullable=False)
    is_monitored = Column(Boolean, default=True)
