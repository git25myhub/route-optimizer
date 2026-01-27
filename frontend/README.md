# Route Optimizer Frontend

React + Leaflet frontend for the Route Optimization API.

## Features

- 🗺️ Interactive map with click-to-add locations
- 🚀 Route optimization with Dijkstra and A* algorithms
- 📍 Visual path drawing on map
- 📜 Route history visualization
- 🎨 Modern, responsive UI

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API URL:**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://127.0.0.1:8000
   ```
   For production, set this to your Render API URL.

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Usage

1. Click on the map to add locations
2. Select an algorithm (Dijkstra or A*)
3. Click "Optimize Route" to calculate the optimal path
4. View the optimized route drawn on the map
5. Click "View History" to see past optimizations

## Deployment

The frontend can be deployed to:
- **Vercel** (recommended for React apps)
- **Netlify**
- **Render** (static site)
- Any static hosting service

Make sure to set `VITE_API_URL` to your production API URL.
