import os

APP_NAME = "Route Optimization API"
VERSION = "1.0.0"

# OSRM base URL for road-based routing (free, no API key).
# Default: public demo server (rate-limited). For production, self-host or use a hosted OSRM.
OSRM_BASE_URL = os.getenv("OSRM_BASE_URL", "https://router.project-osrm.org")
