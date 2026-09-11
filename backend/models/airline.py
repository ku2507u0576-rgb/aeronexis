from sqlalchemy import Column, String, Boolean, Float, DateTime
from sqlalchemy.sql import func
from backend.database import Base

class Airline(Base):
    __tablename__ = "airlines"

    code = Column(String(2), primary_key=True, index=True)
    name = Column(String, nullable=False)
    iata_code = Column(String(2), nullable=False)
    icao_code = Column(String(3), nullable=False)
    website = Column(String, nullable=True)
    market_share_pct = Column(Float, nullable=False)
    carrier_type = Column(String, nullable=False) # LCC/FSC
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
