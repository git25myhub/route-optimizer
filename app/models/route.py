from sqlalchemy import Column, Integer, String, Float, JSON, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    algorithm = Column(String, nullable=False)
    distance_km = Column(Float, nullable=False)
    execution_time_ms = Column(Float, nullable=False)
    path = Column(JSON, nullable=False)  # Store the optimized path as JSON
    geometry = Column(JSON, nullable=True)  # Road path polyline [lat,lng] when mode=drive
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
