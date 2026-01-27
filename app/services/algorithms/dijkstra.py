"""
Dijkstra's algorithm implementation for route optimization.
Uses nearest-neighbor heuristic with Haversine distance.
"""
from app.services.algorithms.distance import calculate_distance_between_locations


def dijkstra(locations):
    """
    Find optimal route using nearest-neighbor heuristic (simplified Dijkstra approach).
    
    Args:
        locations: List of location dictionaries with 'lat' and 'lng' keys
    
    Returns:
        Tuple of (optimized_path, total_distance_km)
    """
    if not locations:
        return [], 0

    if len(locations) == 1:
        return locations, 0

    visited = []
    total_distance = 0
    current = locations[0]
    visited.append(current)

    remaining = locations[1:]

    while remaining:
        next_loc = min(
            remaining,
            key=lambda x: calculate_distance_between_locations(current, x)
        )
        total_distance += calculate_distance_between_locations(current, next_loc)
        current = next_loc
        visited.append(current)
        remaining.remove(next_loc)

    return visited, total_distance
