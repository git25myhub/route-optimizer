from pydantic import BaseModel, Field
from typing import List, Optional

class Location(BaseModel):
    lat: float = Field(..., description="Latitude in degrees", example=40.7128)
    lng: float = Field(..., description="Longitude in degrees", example=-74.0060)
    
    class Config:
        json_schema_extra = {
            "example": {
                "lat": 40.7128,
                "lng": -74.0060
            }
        }

class RouteRequest(BaseModel):
    locations: List[Location] = Field(..., description="List of locations to optimize")
    algorithm: str = Field(..., description="Algorithm to use: 'dijkstra' or 'astar'", example="dijkstra")
    mode: str = Field(
        default="drive",
        description="Routing mode: 'drive' (road network via OSRM) or 'straight' (as-the-crow-flies)",
        example="drive",
    )

    class Config:
        json_schema_extra = {
            "example": {
                "locations": [
                    {"lat": 40.7128, "lng": -74.0060},
                    {"lat": 34.0522, "lng": -118.2437},
                    {"lat": 41.8781, "lng": -87.6298}
                ],
                "algorithm": "dijkstra",
                "mode": "drive"
            }
        }

class RouteResponse(BaseModel):
    path: List[Location] = Field(..., description="Optimized route path (stop order)")
    distance_km: float = Field(..., description="Total distance in kilometers", example=3944.123)
    execution_time_ms: float = Field(..., description="Algorithm execution time in milliseconds", example=2.456)
    geometry: Optional[List[List[float]]] = Field(
        default=None,
        description="Road path as list of [lat, lng] (only when mode=drive); draw this for map",
    )

    class Config:
        json_schema_extra = {
            "example": {
                "path": [
                    {"lat": 40.7128, "lng": -74.0060},
                    {"lat": 41.8781, "lng": -87.6298},
                    {"lat": 34.0522, "lng": -118.2437}
                ],
                "distance_km": 3944.123,
                "execution_time_ms": 2.456,
                "geometry": [[40.7128, -74.006], [40.72, -74.01], [41.8781, -87.6298]]
            }
        }
