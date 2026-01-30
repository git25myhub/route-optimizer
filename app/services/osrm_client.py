"""
OSRM (Open Source Routing Machine) client for real road-based routing.
Uses driving distances/times and returns road geometry (no API key, free).
"""
import requests
from typing import List, Tuple, Optional

from app.core.config import OSRM_BASE_URL


def _coords_to_osrm(locations: List[dict]) -> str:
    """Convert list of {lat, lng} to OSRM format: lon1,lat1;lon2,lat2;..."""
    return ";".join(f"{loc['lng']},{loc['lat']}" for loc in locations)


def get_table(locations: List[dict]) -> Optional[Tuple[List[List[float]], List[List[float]]]]:
    """
    Get NxN driving duration (seconds) and distance (meters) matrix from OSRM.
    Returns (durations, distances) or None on failure.
    """
    if len(locations) < 2:
        return None
    coords = _coords_to_osrm(locations)
    url = f"{OSRM_BASE_URL.rstrip('/')}/table/v1/driving/{coords}"
    params = {"annotations": "duration,distance"}
    try:
        r = requests.get(url, params=params, timeout=30)
        r.raise_for_status()
        data = r.json()
        if data.get("code") != "Ok":
            return None
        durations = data.get("durations")
        distances = data.get("distances")
        if not durations or not distances:
            return None
        return (durations, distances)
    except Exception:
        return None


def get_route_geometry(locations: List[dict]) -> Optional[Tuple[List[list], float, float]]:
    """
    Get driving route geometry and total distance/duration for ordered waypoints.
    locations: list of {lat, lng} in visit order.
    Returns (geometry_as_list_of_[lat,lng], distance_km, duration_seconds) or None.
    """
    if len(locations) < 2:
        return None
    coords = _coords_to_osrm(locations)
    url = f"{OSRM_BASE_URL.rstrip('/')}/route/v1/driving/{coords}"
    params = {"overview": "full", "geometries": "geojson"}
    try:
        r = requests.get(url, params=params, timeout=60)
        r.raise_for_status()
        data = r.json()
        if data.get("code") != "Ok" or not data.get("routes"):
            return None
        route = data["routes"][0]
        # GeoJSON coordinates are [lon, lat]; we want [lat, lng] for frontend
        coords_geojson = route.get("geometry", {}).get("coordinates") or []
        geometry = [[c[1], c[0]] for c in coords_geojson]
        distance_m = float(route.get("distance", 0))
        duration_s = float(route.get("duration", 0))
        distance_km = distance_m / 1000.0
        return (geometry, distance_km, duration_s)
    except Exception:
        return None
