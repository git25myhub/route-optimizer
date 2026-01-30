from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.route import RouteRequest, RouteResponse
from app.services.algorithms.dijkstra import dijkstra
from app.services.algorithms.astar import astar
from app.services.algorithms.tsp_matrix import optimize_order_from_matrix
from app.services.osrm_client import get_table, get_route_geometry
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


def _drive_optimize(locations_dict: list) -> tuple:
    """
    Use OSRM driving matrix + TSP to get best order and road geometry.
    Returns (ordered_path, distance_km, geometry) or raises HTTPException on OSRM failure.
    """
    if len(locations_dict) < 2:
        return locations_dict, 0.0, None

    table_result = get_table(locations_dict)
    if not table_result:
        raise HTTPException(
            status_code=503,
            detail="Road routing temporarily unavailable (OSRM). Try again or use mode=straight.",
        )
    durations, distances = table_result
    n = len(locations_dict)
    # Build matrix in km; OSRM may return null for unreachable pairs
    matrix_km = []
    for i in range(n):
        row = []
        for j in range(n):
            v = distances[i][j] if i != j else 0.0
            row.append((v / 1000.0) if v is not None else None)
        matrix_km.append(row)

    order = optimize_order_from_matrix(matrix_km, start_index=0)
    ordered_locations = [locations_dict[i] for i in order]

    route_result = get_route_geometry(ordered_locations)
    if not route_result:
        raise HTTPException(
            status_code=503,
            detail="Road route geometry unavailable (OSRM). Try again or use mode=straight.",
        )
    geometry, distance_km, _ = route_result
    return ordered_locations, round(distance_km, 3), geometry


@router.post("/optimize", response_model=RouteResponse)
def optimize_route(data: RouteRequest, db: Session = Depends(get_db)):
    """
    Optimize a route using the specified algorithm and save to database.

    - **mode=straight**: Order optimized by straight-line (Haversine) distance; path drawn as straight segments.
    - **mode=drive**: Order optimized by real driving distances (OSRM); returns road geometry for map drawing.

    Supported algorithms (for visit order): dijkstra, astar.
    """
    start = time.time()
    locations_dict = [loc.dict() for loc in data.locations]
    mode = (data.mode or "drive").strip().lower()
    algorithm_name = data.algorithm.lower()

    if mode == "drive":
        path, distance_km, geometry = _drive_optimize(locations_dict)
    else:
        if algorithm_name == "dijkstra":
            path, distance = dijkstra(locations_dict)
        elif algorithm_name in ("astar", "a*"):
            path, distance = astar(locations_dict)
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown algorithm: {data.algorithm}. Supported: dijkstra, astar",
            )
        distance_km = round(distance, 3)
        geometry = None

    end = time.time()
    execution_time_ms = round((end - start) * 1000, 3)

    route_record = Route(
        algorithm=algorithm_name,
        distance_km=distance_km,
        execution_time_ms=execution_time_ms,
        path=path,
        geometry=geometry,
    )
    db.add(route_record)
    db.commit()
    db.refresh(route_record)

    return {
        "path": path,
        "distance_km": distance_km,
        "execution_time_ms": execution_time_ms,
        "geometry": geometry,
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
                "geometry": getattr(route, "geometry", None),
                "created_at": route.created_at.isoformat() if route.created_at else None
            }
            for route in routes
        ]
    }
