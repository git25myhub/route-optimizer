from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.route import RouteRequest, RouteResponse
from app.services.algorithms.dijkstra import dijkstra
from app.services.algorithms.astar import astar
from app.models.route import Route
from app.database import SessionLocal
import time

router = APIRouter(prefix="/routes", tags=["Routes"])


def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/optimize", response_model=RouteResponse)
def optimize_route(data: RouteRequest, db: Session = Depends(get_db)):
    """
    Optimize a route using the specified algorithm and save to database.
    
    Supported algorithms:
    - dijkstra: Nearest-neighbor heuristic with Dijkstra approach
    - astar: A* search algorithm with heuristic optimization
    """
    start = time.time()

    # Convert locations to dict format
    locations_dict = [loc.dict() for loc in data.locations]
    
    # Select algorithm
    algorithm_name = data.algorithm.lower()
    if algorithm_name == "dijkstra":
        path, distance = dijkstra(locations_dict)
    elif algorithm_name == "astar" or algorithm_name == "a*":
        path, distance = astar(locations_dict)
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown algorithm: {data.algorithm}. Supported algorithms: dijkstra, astar"
        )

    end = time.time()
    execution_time_ms = round((end - start) * 1000, 3)
    distance_km = round(distance, 3)

    # Save to database
    route_record = Route(
        algorithm=algorithm_name,
        distance_km=distance_km,
        execution_time_ms=execution_time_ms,
        path=path
    )
    db.add(route_record)
    db.commit()
    db.refresh(route_record)

    return {
        "path": path,
        "distance_km": distance_km,
        "execution_time_ms": execution_time_ms
    }


@router.get("/history")
def get_route_history(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """
    Get route optimization history from database.
    """
    routes = db.query(Route).order_by(Route.created_at.desc()).offset(skip).limit(limit).all()
    return {
        "total": db.query(Route).count(),
        "routes": [
            {
                "id": route.id,
                "algorithm": route.algorithm,
                "distance_km": route.distance_km,
                "execution_time_ms": route.execution_time_ms,
                "path": route.path,
                "created_at": route.created_at.isoformat() if route.created_at else None
            }
            for route in routes
        ]
    }
