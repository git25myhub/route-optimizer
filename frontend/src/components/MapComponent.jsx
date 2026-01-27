import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet'
import { Icon } from 'leaflet'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in React-Leaflet
delete Icon.Default.prototype._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function MapComponent({ locations, optimizedRoute, onMapClick, onRemoveLocation }) {
  const defaultCenter = [40.7128, -74.0060] // New York
  const defaultZoom = 3

  // Calculate map bounds to fit all locations
  useEffect(() => {
    if (locations.length > 0 || (optimizedRoute && optimizedRoute.path)) {
      const allPoints = optimizedRoute?.path || locations
      if (allPoints.length > 0) {
        const bounds = allPoints.map(loc => [loc.lat, loc.lng])
        // Map will auto-fit bounds via Polyline component
      }
    }
  }, [locations, optimizedRoute])

  const getMarkerColor = (index, isOptimized) => {
    if (isOptimized) {
      return index === 0 ? 'green' : index === (optimizedRoute.path.length - 1) ? 'red' : 'blue'
    }
    return 'gray'
  }

  const createCustomIcon = (color) => {
    return new Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    })
  }

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler onMapClick={onMapClick} />

      {/* Original locations */}
      {locations.map((loc, index) => (
        <Marker
          key={`original-${index}`}
          position={[loc.lat, loc.lng]}
          icon={createCustomIcon('grey')}
        >
          <Popup>
            <div>
              <strong>Location {index + 1}</strong>
              <br />
              Lat: {loc.lat.toFixed(4)}, Lng: {loc.lng.toFixed(4)}
              <br />
              <button
                onClick={() => onRemoveLocation(index)}
                style={{
                  marginTop: '5px',
                  padding: '3px 8px',
                  background: '#ff4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                }}
              >
                Remove
              </button>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Optimized route path */}
      {optimizedRoute && optimizedRoute.path && optimizedRoute.path.length > 1 && (
        <>
          <Polyline
            positions={optimizedRoute.path.map(loc => [loc.lat, loc.lng])}
            color="blue"
            weight={4}
            opacity={0.7}
          />
          {optimizedRoute.path.map((loc, index) => (
            <Marker
              key={`optimized-${index}`}
              position={[loc.lat, loc.lng]}
              icon={createCustomIcon(
                index === 0 ? 'green' : index === optimizedRoute.path.length - 1 ? 'red' : 'blue'
              )}
            >
              <Popup>
                <div>
                  <strong>Stop {index + 1}</strong>
                  {index === 0 && <span> 🟢 Start</span>}
                  {index === optimizedRoute.path.length - 1 && <span> 🔴 End</span>}
                  <br />
                  Lat: {loc.lat.toFixed(4)}, Lng: {loc.lng.toFixed(4)}
                  {index > 0 && optimizedRoute.path[index - 1] && (
                    <>
                      <br />
                      <small>
                        Distance from previous: ~
                        {calculateDistance(
                          optimizedRoute.path[index - 1],
                          loc
                        ).toFixed(2)} km
                      </small>
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </>
      )}
    </MapContainer>
  )
}

// Haversine distance calculation (same as backend)
function calculateDistance(loc1, loc2) {
  const R = 6371 // Earth radius in km
  const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180
  const dLon = ((loc2.lng - loc1.lng) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1.lat * Math.PI) / 180) *
      Math.cos((loc2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default MapComponent
