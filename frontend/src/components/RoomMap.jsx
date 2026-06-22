import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet-routing-machine"

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

const KU_LAT = 27.620532425085997
const KU_LNG = 85.53841251986667

// OSRM assumes ideal highway speeds; Nepal roads are slower due to
// traffic, narrow roads, and curves — so we correct the estimate.
const NEPAL_TRAFFIC_MULTIPLIER = 1.8

function LocationPicker({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })

  return null
}

function RouteFromKU({ lat, lng }) {
  const map = useMap()

  useEffect(() => {
    if (!lat || !lng) return

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(KU_LAT, KU_LNG),
        L.latLng(lat, lng),
      ],
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
        profile: "driving",
      }),
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      lineOptions: {
        styles: [{ color: "#10b981", weight: 5, opacity: 0.8 }],
      },
      createMarker: () => null,
    }).addTo(map)

    return () => {
      map.removeControl(routingControl)
    }
  }, [map, lat, lng])

  return null
}

export function PickLocationMap({ lat, lng, onLocationSelect }) {
  const [satellite, setSatellite] = useState(false)

  const center = lat && lng ? [lat, lng] : [27.6244, 85.5394]

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold">
        Click on the map to set the exact room location
      </p>

      <div className="relative rounded-2xl overflow-hidden border border-gray-200/80 dark:border-white/10 h-80">
        <div className="absolute top-3 right-3 z-[1000]">
          <button
            type="button"
            onClick={() => setSatellite((s) => !s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg border transition-all duration-200 ${
              satellite
                ? "bg-white text-gray-800 border-white"
                : "bg-gray-900/80 text-white border-white/20 backdrop-blur-sm"
            }`}
          >
            {satellite ? "Map" : "Satellite"}
          </button>
        </div>

        <MapContainer
          center={center}
          zoom={16}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          {!satellite && (
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap"
            />
          )}

          {satellite && (
            <>
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="© ESRI"
              />

              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap © CARTO"
              />
            </>
          )}

          <LocationPicker onLocationSelect={onLocationSelect} />

          {lat && lng && (
            <Marker position={[lat, lng]}>
              <Popup>Room location</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {lat && lng ? (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
          Location pinned: {lat.toFixed(5)}, {lng.toFixed(5)}
        </p>
      ) : (
        <p className="text-xs text-amber-500 dark:text-amber-400 font-semibold">
          No pin placed yet — click on the map above
        </p>
      )}
    </div>
  )
}

export function ViewLocationMap({ lat, lng, title }) {
  const [satellite, setSatellite] = useState(false)
  const [roadDistance, setRoadDistance] = useState(null)
  const [roadDuration, setRoadDuration] = useState(null)

  useEffect(() => {
    if (!lat || !lng) return

    const fetchRoadDistance = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${KU_LNG},${KU_LAT};${lng},${lat}?overview=false`
        const res = await fetch(url)
        const data = await res.json()
        if (data.routes?.[0]) {
          setRoadDistance((data.routes[0].distance / 1000).toFixed(1))
          setRoadDuration(
            Math.round((data.routes[0].duration / 60) * NEPAL_TRAFFIC_MULTIPLIER)
          )
        }
      } catch (err) {
        console.error("Could not fetch road distance:", err)
      }
    }

    fetchRoadDistance()
  }, [lat, lng])

  if (!lat || !lng) return null

  return (
    <div className="bg-white dark:bg-dark-900/50 border border-gray-100/70 dark:border-white/5 rounded-[28px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.015)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">
          Location
        </h2>

        <button
          type="button"
          onClick={() => setSatellite((s) => !s)}
          className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-primary-400 dark:hover:border-primary-600"
        >
          {satellite ? "Street view" : "Satellite view"}
        </button>
      </div>

      {roadDistance && (
        <div className="flex items-center justify-center gap-6 mb-4 px-5 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🚗</span>
            <div className="text-left">
              <p className="text-lg font-extrabold text-white leading-none">{roadDistance} km</p>
              <p className="text-[11px] text-white/80 font-semibold mt-0.5">via road</p>
            </div>
          </div>
          <div className="w-px h-9 bg-white/30" />
          {roadDuration && (
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">⏱</span>
              <div className="text-left">
                <p className="text-lg font-extrabold text-white leading-none">{roadDuration} min</p>
                <p className="text-[11px] text-white/80 font-semibold mt-0.5">drive from KU</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl overflow-hidden h-80">
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          {!satellite && (
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap © CARTO"
            />
          )}

          {satellite && (
            <>
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="© ESRI"
              />

              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap © CARTO"
              />
            </>
          )}

          <Marker position={[lat, lng]}>
            <Popup>{title}</Popup>
          </Marker>

          <RouteFromKU lat={lat} lng={lng} />
        </MapContainer>
      </div>

      <a
        href={"https://www.google.com/maps/dir/?api=1&origin=" + KU_LAT + "," + KU_LNG + "&destination=" + lat + "," + lng}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
        </svg>
        Get Directions
      </a>
    </div>
  )
}