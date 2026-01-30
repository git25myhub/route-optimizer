import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
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

function FlyToView({ flyTo, onFlyToDone }) {
  const map = useMap()
  useEffect(() => {
    if (!flyTo) return
    if (flyTo.type === 'bounds' && flyTo.points && flyTo.points.length > 0) {
      const bounds = L.latLngBounds(flyTo.points)
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 })
      const t = setTimeout(onFlyToDone, 300)
      return () => clearTimeout(t)
    }
    if (flyTo.lat != null && flyTo.lng != null) {
      map.flyTo([flyTo.lat, flyTo.lng], 15, { duration: 0.8 })
      const t = setTimeout(onFlyToDone, 900)
      return () => clearTimeout(t)
    }
  }, [flyTo, map, onFlyToDone])
  return null
}

function MapComponent({ start, destinations, locations, optimizedRoute, onMapClick, onRemoveDestination, flyTo, onFlyToDone }) {
  const defaultCenter = [40.7128, -74.0060] // New York
  const defaultZoom = 3

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
      {flyTo && onFlyToDone && <FlyToView flyTo={flyTo} onFlyToDone={onFlyToDone} />}

      {/* Start marker */}
      {start && (
        <Marker key="start" position={[start.lat, start.lng]} icon={createCustomIcon('green')}>
          <Popup>
            <div>
              <strong>🟢 Start</strong>
              <br />
              {start.displayName || `${start.lat.toFixed(4)}, ${start.lng.toFixed(4)}`}
            </div>
          </Popup>
        </Marker>
      )}
      {/* Destination markers */}
      {destinations.map((loc, index) => (
        <Marker
          key={`dest-${index}`}
          position={[loc.lat, loc.lng]}
          icon={createCustomIcon(index === destinations.length - 1 ? 'red' : 'blue')}
        >
          <Popup>
            <div>
              <strong>{index === destinations.length - 1 ? '🔴 Destination' : `Stop ${index + 1}`}</strong>
              <br />
              {loc.displayName || `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`}
              <br />
              <button
                onClick={() => onRemoveDestination(index)}
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

      {/* Optimized route path: use road geometry when available, else straight segments */}
      {optimizedRoute && optimizedRoute.path && optimizedRoute.path.length > 1 && (
        <>
          <Polyline
            positions={
              optimizedRoute.geometry && optimizedRoute.geometry.length > 0
                ? optimizedRoute.geometry.map(coord => [coord[0], coord[1]])
                : optimizedRoute.path.map(loc => [loc.lat, loc.lng])
            }
            color={optimizedRoute.geometry ? '#2563eb' : 'blue'}
            weight={optimizedRoute.geometry ? 5 : 4}
            opacity={0.8}
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
