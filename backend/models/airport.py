from sqlalchemy import Column, String, Boolean, Float
from backend.database import Base

class Airport(Base):
    __tablename__ = "airports"

    iata_code = Column(String(3), primary_key=True, index=True)
    name = Column(String, nullable=False)
    city = Column(String, nullable=False)
    state = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    is_metro = Column(Boolean, default=False)
