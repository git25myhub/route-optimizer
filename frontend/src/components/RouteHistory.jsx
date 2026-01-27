import { useState, useEffect } from 'react'
import './RouteHistory.css'

function RouteHistory({ apiUrl, onClose }) {
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRoute, setSelectedRoute] = useState(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${apiUrl}/routes/history?limit=20`)
      if (!response.ok) throw new Error('Failed to fetch history')
      const data = await response.json()
      setHistory(data.routes || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <div className="route-history">
      <div className="history-header">
        <h2>📜 Route History</h2>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      {isLoading ? (
        <div className="loading">Loading history...</div>
      ) : error ? (
        <div className="error">❌ {error}</div>
      ) : history.length === 0 ? (
        <div className="empty">No route history found</div>
      ) : (
        <div className="history-list">
          {history.map((route) => (
            <div
              key={route.id}
              className={`history-item ${selectedRoute?.id === route.id ? 'selected' : ''}`}
              onClick={() => setSelectedRoute(route)}
            >
              <div className="history-item-header">
                <span className="route-id">#{route.id}</span>
                <span className={`algorithm-badge algorithm-${route.algorithm}`}>
                  {route.algorithm.toUpperCase()}
                </span>
              </div>
              <div className="history-item-details">
                <div className="detail-row">
                  <span>Distance:</span>
                  <strong>{route.distance_km.toFixed(2)} km</strong>
                </div>
                <div className="detail-row">
                  <span>Time:</span>
                  <strong>{route.execution_time_ms.toFixed(2)} ms</strong>
                </div>
                <div className="detail-row">
                  <span>Stops:</span>
                  <strong>{route.path?.length || 0}</strong>
                </div>
                <div className="detail-row">
                  <span>Date:</span>
                  <small>{formatDate(route.created_at)}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRoute && (
        <div className="route-details-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Route #{selectedRoute.id} Details</h3>
              <button onClick={() => setSelectedRoute(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Algorithm: {selectedRoute.algorithm.toUpperCase()}</h4>
                <p>Distance: {selectedRoute.distance_km.toFixed(2)} km</p>
                <p>Execution Time: {selectedRoute.execution_time_ms.toFixed(2)} ms</p>
                <p>Created: {formatDate(selectedRoute.created_at)}</p>
              </div>
              <div className="detail-section">
                <h4>Path ({selectedRoute.path?.length || 0} stops):</h4>
                <div className="path-list">
                  {selectedRoute.path?.map((loc, index) => (
                    <div key={index} className="path-item">
                      <span className="path-number">{index + 1}</span>
                      <span className="path-coords">
                        {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RouteHistory
