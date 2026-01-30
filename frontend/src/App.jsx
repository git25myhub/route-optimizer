import { useState, useEffect } from 'react'
import MapComponent from './components/MapComponent'
import ControlPanel from './components/ControlPanel'
import RouteHistory from './components/RouteHistory'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

function App() {
  const [locations, setLocations] = useState([])
  const [optimizedRoute, setOptimizedRoute] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  const handleMapClick = (lat, lng) => {
    const newLocation = { lat, lng }
    setLocations([...locations, newLocation])
    setError(null)
  }

  const handleOptimize = async (algorithm, mode = 'drive') => {
    if (locations.length < 2) {
      setError('Please add at least 2 locations on the map')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/routes/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          locations,
          algorithm,
          mode: mode || 'drive',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const msg = Array.isArray(errorData.detail)
          ? errorData.detail.map((d) => d.msg || d.message).join(', ')
          : (errorData.detail?.message || errorData.detail || 'Failed to optimize route')
        throw new Error(msg)
      }

      const data = await response.json()
      setOptimizedRoute(data)
    } catch (err) {
      setError(err.message)
      setOptimizedRoute(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setLocations([])
    setOptimizedRoute(null)
    setError(null)
  }

  const handleRemoveLocation = (index) => {
    setLocations(locations.filter((_, i) => i !== index))
    setOptimizedRoute(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🗺️ Route Optimizer</h1>
        <p>Click on the map to add locations, then optimize your route</p>
      </header>

      <div className="app-container">
        <div className="map-section">
          <MapComponent
            locations={locations}
            optimizedRoute={optimizedRoute}
            onMapClick={handleMapClick}
            onRemoveLocation={handleRemoveLocation}
          />
        </div>

        <div className="sidebar">
          <ControlPanel
            locations={locations}
            optimizedRoute={optimizedRoute}
            isLoading={isLoading}
            error={error}
            onOptimize={handleOptimize}
            onClear={handleClear}
            onShowHistory={() => setShowHistory(true)}
          />

          {showHistory && (
            <RouteHistory
              apiUrl={API_BASE_URL}
              onClose={() => setShowHistory(false)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
