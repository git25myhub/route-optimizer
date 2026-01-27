import { useState } from 'react'
import './ControlPanel.css'

function ControlPanel({
  locations,
  optimizedRoute,
  isLoading,
  error,
  onOptimize,
  onClear,
  onShowHistory,
}) {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('dijkstra')

  return (
    <div className="control-panel">
      <div className="panel-section">
        <h2>📍 Locations</h2>
        {locations.length === 0 ? (
          <p className="empty-state">Click on the map to add locations</p>
        ) : (
          <div className="locations-list">
            {locations.map((loc, index) => (
              <div key={index} className="location-item">
                <span className="location-number">{index + 1}</span>
                <span className="location-coords">
                  {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel-section">
        <h2>⚙️ Algorithm</h2>
        <div className="algorithm-selector">
          <label>
            <input
              type="radio"
              value="dijkstra"
              checked={selectedAlgorithm === 'dijkstra'}
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
            />
            Dijkstra
          </label>
          <label>
            <input
              type="radio"
              value="astar"
              checked={selectedAlgorithm === 'astar'}
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
            />
            A* Search
          </label>
        </div>
      </div>

      <div className="panel-section">
        <button
          className="btn-optimize"
          onClick={() => onOptimize(selectedAlgorithm)}
          disabled={isLoading || locations.length < 2}
        >
          {isLoading ? '⏳ Optimizing...' : '🚀 Optimize Route'}
        </button>

        {error && <div className="error-message">❌ {error}</div>}

        {optimizedRoute && (
          <div className="route-results">
            <h3>✅ Optimized Route</h3>
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
        <button className="btn-secondary" onClick={onClear}>
          🗑️ Clear All
        </button>
        <button className="btn-secondary" onClick={onShowHistory}>
          📜 View History
        </button>
      </div>
    </div>
  )
}

export default ControlPanel
