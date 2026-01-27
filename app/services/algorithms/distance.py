"""
Distance calculation utilities using Haversine formula for real earth distances.
"""
import math

# Earth's radius in kilometers
EARTH_RADIUS_KM = 6371.0


def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Calculate the great circle distance between two points on Earth using Haversine formula.
    
    Args:
        lat1: Latitude of first point in degrees
        lng1: Longitude of first point in degrees
        lat2: Latitude of second point in degrees
        lng2: Longitude of second point in degrees
    
    Returns:
        Distance in kilometers
    """
    # Convert latitude and longitude from degrees to radians
    lat1_rad = math.radians(lat1)
    lng1_rad = math.radians(lng1)
    lat2_rad = math.radians(lat2)
    lng2_rad = math.radians(lng2)
    
    # Haversine formula
    dlat = lat2_rad - lat1_rad
    dlng = lng2_rad - lng1_rad
    
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(lat1_rad)
        * math.cos(lat2_rad)
        * math.sin(dlng / 2) ** 2
    )
    
    c = 2 * math.asin(math.sqrt(a))
    distance = EARTH_RADIUS_KM * c
    
    return distance


def calculate_distance_between_locations(loc1: dict, loc2: dict) -> float:
    """
    Calculate distance between two location dictionaries.
    
    Args:
        loc1: Dictionary with 'lat' and 'lng' keys
        loc2: Dictionary with 'lat' and 'lng' keys
    
    Returns:
        Distance in kilometers
    """
    return haversine_distance(loc1["lat"], loc1["lng"], loc2["lat"], loc2["lng"])
