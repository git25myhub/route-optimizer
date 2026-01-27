from pydantic import BaseModel, Field
from typing import List

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
    
    class Config:
        json_schema_extra = {
            "example": {
                "locations": [
                    {"lat": 40.7128, "lng": -74.0060},
                    {"lat": 34.0522, "lng": -118.2437},
                    {"lat": 41.8781, "lng": -87.6298}
                ],
                "algorithm": "dijkstra"
            }
        }

class RouteResponse(BaseModel):
    path: List[Location] = Field(..., description="Optimized route path")
    distance_km: float = Field(..., description="Total distance in kilometers", example=3944.123)
    execution_time_ms: float = Field(..., description="Algorithm execution time in milliseconds", example=2.456)
    
    class Config:
        json_schema_extra = {
            "example": {
                "path": [
                    {"lat": 40.7128, "lng": -74.0060},
                    {"lat": 41.8781, "lng": -87.6298},
                    {"lat": 34.0522, "lng": -118.2437}
                ],
                "distance_km": 3944.123,
                "execution_time_ms": 2.456
            }
        }
