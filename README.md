# Route Optimization System (FastAPI + PostgreSQL)

## 📌 Project Overview

The Route Optimization System is a full-stack web application designed to compute the most efficient routes between multiple geographic locations. The system focuses on minimizing travel distance, time, or cost by applying classic graph and path-finding algorithms, and exposes this functionality through a scalable REST API built with FastAPI.

## 🚀 Quick Start

### Prerequisites

- Python 3.9 or higher
- PostgreSQL (optional - SQLite is used by default for development)
- Virtual environment (recommended)
- Node.js 18+ (for frontend)

### Installation

1. **Navigate to the project root directory:**
   ```bash
   cd C:\Users\User\Desktop\route-optimizer-backend
   ```

2. **Activate your virtual environment:**
   ```bash
   # Windows PowerShell
   .\app\venv\Scripts\Activate.ps1
   
   # Or if you're already in the app directory:
   .\venv\Scripts\Activate.ps1
   ```

3. **Install dependencies:**
   ```bash
   pip install -r app/requirements.txt
   ```

4. **Set up environment variables (optional):**
   ```bash
   # Copy the example env file
   copy .env.example .env
   
   # Edit .env and set your DATABASE_URL if using PostgreSQL
   # For development, you can skip this - SQLite will be used by default
   ```

### Running the Application

**Important:** Run uvicorn from the **project root directory** (not from inside the `app` directory):

```bash
# Make sure you're in: C:\Users\User\Desktop\route-optimizer-backend
uvicorn app.main:app --reload
```

The API will be available at: `http://127.0.0.1:8000`

### API Documentation

Once running, visit:
- **Swagger UI:** http://127.0.0.1:8000/docs
- **ReDoc:** http://127.0.0.1:8000/redoc

## 🧠 Core Problem Being Solved

In real-world logistics (delivery services, ride-hailing, field operations), visiting multiple locations in an inefficient order results in:
- Increased fuel costs
- Longer delivery times
- Poor resource utilization

This project solves that problem by modeling locations as nodes in a graph and applying route optimization algorithms to determine the optimal visiting sequence.

## ⚙️ How the System Works

1. **User submits multiple locations** - Each location is defined by latitude and longitude
2. **Graph modeling** - Locations are treated as nodes, distances between nodes are computed
3. **Algorithm selection** - Users can choose different algorithms (e.g., Dijkstra, A*)
4. **Optimization process** - The system calculates the most efficient path
5. **Results delivery** - Optimized route is returned as JSON
6. **Persistence** - Optimized routes and metadata are stored in the database

## 🧮 Algorithms and Concepts Used

- **Graph Theory** - Nodes, edges, weighted graphs
- **Shortest Path Algorithms** - Dijkstra's Algorithm, A* Search Algorithm
- **Optimization Heuristics** - Nearest-neighbor approach for multi-stop routing
- **Geospatial Computation** - Haversine formula for accurate Earth distance calculations

## 🏗️ Project Structure

```
route-optimizer-backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── database.py          # Database configuration
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py        # Application configuration
│   ├── models/
│   │   ├── __init__.py
│   │   └── route.py         # SQLAlchemy models
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── route.py         # Pydantic schemas
│   ├── routers/
│   │   ├── __init__.py
│   │   └── route_router.py  # API routes
│   ├── services/
│   │   ├── __init__.py
│   │   └── algorithms/
│   │       ├── __init__.py
│   │       ├── distance.py  # Haversine distance calculations
│   │       ├── dijkstra.py  # Dijkstra algorithm
│   │       └── astar.py     # A* algorithm
│   └── requirements.txt
├── requirements.txt         # Root requirements (for deployment)
├── render.yaml              # Render deployment configuration
├── runtime.txt              # Python version specification
├── DEPLOYMENT.md            # Deployment guide
├── run.ps1                  # PowerShell run script
├── run.bat                  # Batch run script
└── README.md
```

## 📝 API Usage Examples

### Optimize a Route

**Endpoint:** `POST /routes/optimize`

**Request:**
```bash
POST http://127.0.0.1:8000/routes/optimize
Content-Type: application/json

{
  "locations": [
    {"lat": 40.7128, "lng": -74.0060},
    {"lat": 40.7589, "lng": -73.9851},
    {"lat": 40.7489, "lng": -73.9680}
  ],
  "algorithm": "dijkstra"
}
```

**Supported Algorithms:**
- `dijkstra` - Nearest-neighbor heuristic with Dijkstra approach
- `astar` or `a*` - A* search algorithm with heuristic optimization

**Response:**
```json
{
  "path": [
    {"lat": 40.7128, "lng": -74.0060},
    {"lat": 40.7489, "lng": -73.9680},
    {"lat": 40.7589, "lng": -73.9851}
  ],
  "distance_km": 8.234,
  "execution_time_ms": 2.456
}
```

**Note:** The optimized route is automatically saved to the database.

### Get Route History

**Endpoint:** `GET /routes/history`

**Query Parameters:**
- `skip` (optional): Number of records to skip (default: 0)
- `limit` (optional): Maximum number of records to return (default: 10)

**Example:**
```bash
GET http://127.0.0.1:8000/routes/history?skip=0&limit=10
```

**Response:**
```json
{
  "total": 25,
  "routes": [
    {
      "id": 1,
      "algorithm": "dijkstra",
      "distance_km": 8.234,
      "execution_time_ms": 2.456,
      "path": [...],
      "created_at": "2024-01-15T10:30:00"
    },
    ...
  ]
}
```

## 🎯 Real-World Applications

- Delivery and logistics optimization
- Ride-hailing and transport systems
- Field service scheduling
- Emergency response routing
- Fleet management platforms

## 🚀 Features

✅ **Haversine Distance Calculation** - Accurate Earth distance calculations using the Haversine formula  
✅ **Multiple Algorithms** - Support for Dijkstra and A* search algorithms  
✅ **Route Persistence** - All optimized routes are saved to PostgreSQL  
✅ **Route History** - Query historical route optimizations via API  
✅ **Production Ready** - Configured for deployment to Render.com  

## 🔧 Troubleshooting

### ModuleNotFoundError: No module named 'app'

**Solution:** Make sure you're running uvicorn from the project root directory (`route-optimizer-backend`), not from inside the `app` directory.

```bash
# Correct (from project root):
cd C:\Users\User\Desktop\route-optimizer-backend
uvicorn app.main:app --reload

# Or use the run script:
.\run.ps1  # PowerShell
run.bat    # Command Prompt

# Incorrect (from inside app directory):
cd C:\Users\User\Desktop\route-optimizer-backend\app
uvicorn app.main:app --reload  # ❌ This will fail
```

### Database Connection Issues

If you're using PostgreSQL, make sure:
1. PostgreSQL is running
2. The database exists
3. Your `.env` file has the correct `DATABASE_URL`

For development, you can use SQLite (default) - no setup required! The application automatically creates tables on startup.

### Algorithm Not Found Error

Make sure you're using one of the supported algorithm names:
- `dijkstra` ✅
- `astar` or `a*` ✅

## 📚 Key Learning Outcomes

This project demonstrates:
- Translating algorithm theory into production-ready services
- Designing clean, scalable backend architectures
- Working with geospatial data and Haversine distance calculations
- Performance measurement and comparison across algorithms
- Real-world use of databases in backend systems
- API design and RESTful service development
- Deployment to cloud platforms (Render)

## 🎨 Frontend

A React + Leaflet frontend is included in the `frontend/` directory.

### Frontend Features

- 🗺️ Interactive map with click-to-add locations
- 🚀 Route optimization with visual path drawing
- 📜 Route history visualization
- 🎨 Modern, responsive UI

### Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

See [frontend/README.md](frontend/README.md) for more details.

## 🚢 Deployment

### Backend Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) and [RENDER_DEPLOYMENT_CHECKLIST.md](RENDER_DEPLOYMENT_CHECKLIST.md) for detailed instructions on deploying to Render.com.

**Quick deployment steps:**
1. Push code to Git repository
2. Create Web Service on Render
3. Create PostgreSQL database on Render
4. Link database to web service
5. Deploy!

The application is configured with:
- `render.yaml` for automatic configuration
- `runtime.txt` for Python version
- Production-ready database connection pooling

### Frontend Deployment

After deploying the backend:

1. Update `frontend/.env` with your Render API URL:
   ```env
   VITE_API_URL=https://your-api.onrender.com
   ```

2. Deploy to Vercel/Netlify:
   ```bash
   cd frontend
   npm run build
   # Deploy dist/ folder
   ```