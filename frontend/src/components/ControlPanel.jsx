import { useState, useEffect } from 'react'
import { useDebounce } from '../hooks/useDebounce'
import { searchPlaces } from '../utils/geocode'
import './ControlPanel.css'

function ControlPanel({
  start,
  destinations,
  setStart,
  addDestination,
  removeDestination,
  optimizedRoute,
  isLoading,
  error,
  onOptimize,
  onClear,
  onShowHistory,
}) {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('dijkstra')
  const [selectedMode, setSelectedMode] = useState('drive')

  const [startQuery, setStartQuery] = useState('')
  const [startSuggestions, setStartSuggestions] = useState([])
  const [startLoading, setStartLoading] = useState(false)
  const startDebounced = useDebounce(startQuery, 350)

  const [destQuery, setDestQuery] = useState('')
  const [destSuggestions, setDestSuggestions] = useState([])
  const [destLoading, setDestLoading] = useState(false)
  const destDebounced = useDebounce(destQuery, 350)

  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState(null)

  useEffect(() => {
    if (!startDebounced || startDebounced.length < 2) {
      setStartSuggestions([])
      return
    }
    setStartLoading(true)
    searchPlaces(startDebounced, 5)
      .then(setStartSuggestions)
      .finally(() => setStartLoading(false))
  }, [startDebounced])

  useEffect(() => {
    if (!destDebounced || destDebounced.length < 2) {
      setDestSuggestions([])
      return
    }
    setDestLoading(true)
    searchPlaces(destDebounced, 5)
      .then(setDestSuggestions)
      .finally(() => setDestLoading(false))
  }, [destDebounced])

  const handleSelectStart = (r) => {
    const place = { lat: parseFloat(r.lat), lng: parseFloat(r.lon), displayName: r.display_name }
    setStart(place)
    setStartQuery('')
    setStartSuggestions([])
  }

  const handleSelectDestination = (r) => {
    const place = { lat: parseFloat(r.lat), lng: parseFloat(r.lon), displayName: r.display_name }
    addDestination(place)
    setDestQuery('')
    setDestSuggestions([])
  }

  const handleUseMyLocationForStart = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.')
      return
    }
    setLocationError(null)
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStart({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          displayName: 'Current location',
        })
        setLocationLoading(false)
      },
      (err) => {
        setLocationLoading(false)
        if (err.code === 1) setLocationError('Location permission denied.')
        else if (err.code === 2) setLocationError('Location unavailable.')
        else setLocationError('Could not get your location. Try again.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  const canOptimize = start && destinations.length >= 1

  return (
    <div className="control-panel">
      <div className="panel-section">
        <h2>🟢 Start</h2>
        <div className="search-wrap">
          <input
            type="text"
            className="search-input"
            placeholder="Search start point..."
            value={startQuery}
            onChange={(e) => setStartQuery(e.target.value)}
            onBlur={() => setTimeout(() => setStartSuggestions([]), 150)}
          />
          {startLoading && <span className="search-spinner">…</span>}
          {startSuggestions.length > 0 && (
            <ul className="search-results">
              {startSuggestions.map((r, i) => (
                <li
                  key={i}
                  className="search-result-item"
                  onMouseDown={(e) => { e.preventDefault(); handleSelectStart(r); }}
                >
                  <span className="search-result-name">{r.display_name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          className="btn-current-location"
          onClick={handleUseMyLocationForStart}
          disabled={locationLoading}
        >
          {locationLoading ? '⏳ Getting location…' : '📍 Use my location'}
        </button>
        {locationError && <p className="location-error">{locationError}</p>}
        {start && (
          <div className="selected-place">
            <strong>Start:</strong> {start.displayName || `${start.lat.toFixed(4)}, ${start.lng.toFixed(4)}`}
            <button type="button" className="btn-clear-place" onClick={() => setStart(null)}>✕</button>
          </div>
        )}
      </div>

      <div className="panel-section">
        <h2>🔴 Destination(s)</h2>
        <div className="search-wrap">
          <input
            type="text"
            className="search-input"
            placeholder="Search destination..."
            value={destQuery}
            onChange={(e) => setDestQuery(e.target.value)}
            onBlur={() => setTimeout(() => setDestSuggestions([]), 150)}
          />
          {destLoading && <span className="search-spinner">…</span>}
          {destSuggestions.length > 0 && (
            <ul className="search-results">
              {destSuggestions.map((r, i) => (
                <li
                  key={i}
                  className="search-result-item"
                  onMouseDown={(e) => { e.preventDefault(); handleSelectDestination(r); }}
                >
                  <span className="search-result-name">{r.display_name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="hint">Or click on the map to add a destination.</p>
        {destinations.length > 0 && (
          <ul className="destinations-list">
            {destinations.map((d, i) => (
              <li key={i} className="destination-item">
                <span className="destination-name">{d.displayName || `${d.lat.toFixed(4)}, ${d.lng.toFixed(4)}`}</span>
                <button type="button" className="btn-remove-dest" onClick={() => removeDestination(i)}>✕</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel-section">
        <h2>🛣️ Routing</h2>
        <div className="algorithm-selector">
          <label>
            <input type="radio" value="drive" checked={selectedMode === 'drive'} onChange={(e) => setSelectedMode(e.target.value)} />
            Drive (roads)
          </label>
          <label>
            <input type="radio" value="straight" checked={selectedMode === 'straight'} onChange={(e) => setSelectedMode(e.target.value)} />
            Straight line
          </label>
        </div>
      </div>

      <div className="panel-section">
        <h2>⚙️ Algorithm</h2>
        <div className="algorithm-selector">
          <label>
            <input type="radio" value="dijkstra" checked={selectedAlgorithm === 'dijkstra'} onChange={(e) => setSelectedAlgorithm(e.target.value)} />
            Dijkstra
          </label>
          <label>
            <input type="radio" value="astar" checked={selectedAlgorithm === 'astar'} onChange={(e) => setSelectedAlgorithm(e.target.value)} />
            A* Search
          </label>
        </div>
      </div>

      <div className="panel-section">
        <button
          className="btn-optimize"
          onClick={() => onOptimize(selectedAlgorithm, selectedMode)}
          disabled={isLoading || !canOptimize}
        >
          {isLoading ? '⏳ Optimizing...' : '🚀 Show route'}
        </button>

        {error && <div className="error-message">❌ {error}</div>}

        {optimizedRoute && (
          <div className="route-results">
            <h3>✅ Route</h3>
            <div className="result-item">
              <span className="result-label">Total Distance:</span>
              <span className="result-value">{optimizedRoute.distance_km.toFixed(2)} km</span>
            </div>
            <div className="result-item">
              <span className="result-label">Execution Time:</span>
              <span className="result-value">{optimizedRoute.execution_time_ms.toFixed(2)} ms</span>
            </div>
            <div className="result-item">
              <span className="result-label">Stops:</span>
              <span className="result-value">{optimizedRoute.path.length}</span>
            </div>
          </div>
        )}
      </div>

      <div className="panel-section panel-actions">
        <button className="btn-secondary" onClick={onClear}>🗑️ Clear All</button>
        <button className="btn-secondary" onClick={onShowHistory}>📜 View History</button>
      </div>
    </div>
  )
}

export default ControlPanel
