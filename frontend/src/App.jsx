import { useState, useMemo } from 'react'
import MapComponent from './components/MapComponent'
import ControlPanel from './components/ControlPanel'
import RouteHistory from './components/RouteHistory'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

function App() {
  const [start, setStart] = useState(null)
  const [destinations, setDestinations] = useState([])
  const [optimizedRoute, setOptimizedRoute] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showHistory, setShowHistory] = useState(false)
  const [flyTo, setFlyTo] = useState(null)

  const locations = useMemo(() => {
    if (!start) return []
    return [{ ...start }, ...destinations]
  }, [start, destinations])

  const handleMapClick = (lat, lng) => {
    const point = { lat, lng }
    setOptimizedRoute(null)
    setError(null)
    if (!start) {
      setStart(point)
    } else {
      setDestinations([...destinations, point])
    }
    // No flyTo: user controls zoom when adding by map click
  }

  const handleSetStart = (place) => {
    setStart(place)
    setOptimizedRoute(null)
    setError(null)
    if (place && place.lat != null) setFlyTo({ lat: place.lat, lng: place.lng })
  }

  const handleAddDestination = (place) => {
    const newDestinations = [...destinations, place]
    setDestinations(newDestinations)
    setOptimizedRoute(null)
    setError(null)
    // Zoom out to show full path (start + all destinations)
    const points = start
      ? [[start.lat, start.lng], ...newDestinations.map((d) => [d.lat, d.lng])]
      : newDestinations.map((d) => [d.lat, d.lng])
    if (points.length > 0) setFlyTo({ type: 'bounds', points })
  }

  const handleRemoveDestination = (index) => {
    setDestinations(destinations.filter((_, i) => i !== index))
    setOptimizedRoute(null)
  }

  const handleOptimize = async (algorithm, mode = 'drive') => {
    if (!start || destinations.length === 0) {
      setError('Set a start point and at least one destination.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/routes/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    setStart(null)
    setDestinations([])
    setOptimizedRoute(null)
    setError(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🗺️ Route Optimizer</h1>
        <p>Set start and destination, then optimize your route</p>
      </header>

      <div className="app-container">
        <div className="map-section">
          <MapComponent
            start={start}
            destinations={destinations}
            locations={locations}
            optimizedRoute={optimizedRoute}
            onMapClick={handleMapClick}
            onRemoveDestination={handleRemoveDestination}
            flyTo={flyTo}
            onFlyToDone={() => setFlyTo(null)}
          />
        </div>

        <div className="sidebar">
          <ControlPanel
            start={start}
            destinations={destinations}
            setStart={handleSetStart}
            addDestination={handleAddDestination}
            removeDestination={handleRemoveDestination}
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
