import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet-routing-machine"

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

const KU_LAT = 27.620532425085997
const KU_LNG = 85.53841251986667
const NEPAL_TRAFFIC_MULTIPLIER = 1.8

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains("dark"))

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  return isDark
}

// Custom KU marker - small clean dot with ring
const kuIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative; width:20px; height:20px;">
      <div style="
        position:absolute; top:50%; left:50%;
        transform:translate(-50%,-50%);
        width:20px; height:20px;
        border-radius:50%;
        background:rgba(5,150,105,0.2);
        border:2px solid #059669;
      "></div>
      <div style="
        position:absolute; top:50%; left:50%;
        transform:translate(-50%,-50%);
        width:10px; height:10px;
        border-radius:50%;
        background:#059669;
        border:2px solid white;
        box-shadow:0 2px 6px rgba(5,150,105,0.6);
      "></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

// Custom room marker - small teal dot with ring
const roomIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative; width:20px; height:20px;">
      <div style="
        position:absolute; top:50%; left:50%;
        transform:translate(-50%,-50%);
        width:20px; height:20px;
        border-radius:50%;
        background:rgba(13,148,136,0.2);
        border:2px solid #0d9488;
      "></div>
      <div style="
        position:absolute; top:50%; left:50%;
        transform:translate(-50%,-50%);
        width:10px; height:10px;
        border-radius:50%;
        background:#0d9488;
        border:2px solid white;
        box-shadow:0 2px 6px rgba(13,148,136,0.6);
      "></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

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
        styles: [{ color: "#10b981", weight: 4, opacity: 0.85 }],
      },
      createMarker: () => null,
    }).addTo(map)

    // Guard against a known leaflet-routing-machine bug: if an in-flight
    // OSRM response resolves after this control has already been removed
    // (e.g. React StrictMode's dev-mode double mount/unmount), the library
    // tries to clear route lines that no longer exist and throws. We make
    // that cleanup safe instead of letting it crash.
    const originalClearLines = routingControl._clearLines.bind(routingControl)
    routingControl._clearLines = function (...args) {
      try {
        originalClearLines(...args)
      } catch (err) {
        // Route lines were already removed — safe to ignore.
      }
    }

    let removed = false
    const safeRemove = () => {
      if (removed) return
      removed = true
      try {
        map.removeControl(routingControl)
      } catch (err) {
        // Control may already be detached — safe to ignore.
      }
    }

    return safeRemove
  }, [map, lat, lng])

  return null
}

export function PickLocationMap({ lat, lng, onLocationSelect }) {
  const [satellite, setSatellite] = useState(false)
  const isDark = useDarkMode()
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
            {satellite ? "Street view" : "🛰 Satellite"}
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
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution="© OpenStreetMap © CARTO"
            />
          )}
          {satellite && (
            <TileLayer
              url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              attribution="© Google Maps"
              maxZoom={20}
            />
          )}

          <LocationPicker onLocationSelect={onLocationSelect} />

          {lat && lng && (
            <Marker position={[lat, lng]} icon={roomIcon}>
              <Popup>Room location</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {lat && lng ? (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
          📍 Location pinned: {lat.toFixed(5)}, {lng.toFixed(5)}
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
  const isDark = useDarkMode()
  const [roadDistance, setRoadDistance] = useState(null)
  const [roadDuration, setRoadDuration] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!lat || !lng) return

    const fetchRoadDistance = async () => {
      try {
        setLoading(true)
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
      } finally {
        setLoading(false)
      }
    }

    fetchRoadDistance()
  }, [lat, lng])

  if (!lat || !lng) return null

  return (
    <div className="bg-white dark:bg-dark-900/50 border border-gray-100/70 dark:border-white/5 rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)]">

      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Location</h2>
        </div>
        <button
          type="button"
          onClick={() => setSatellite((s) => !s)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-emerald-400 dark:hover:border-emerald-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
          </svg>
          {satellite ? "Street view" : "🛰 Satellite"}
        </button>
      </div>

      {/* Distance + Time badges */}
      <div className="px-6 pb-4">
        {loading ? (
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-white/5 rounded-2xl animate-pulse">
            <div className="h-4 w-24 bg-gray-300 dark:bg-white/10 rounded" />
            <div className="h-4 w-24 bg-gray-300 dark:bg-white/10 rounded" />
          </div>
        ) : roadDistance ? (
          <div className="grid grid-cols-2 gap-3">
            {/* Distance card */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500 shadow-md shadow-emerald-200 dark:shadow-emerald-900/30">
                <span className="text-lg">🚗</span>
              </div>
              <div>
                <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 leading-none">
                  {roadDistance} <span className="text-sm font-bold">km</span>
                </p>
                <p className="text-[10px] text-emerald-600/70 dark:text-emerald-500/70 font-semibold mt-0.5">via road from KU</p>
              </div>
            </div>

            {/* Time card */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/40">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-teal-500 shadow-md shadow-teal-200 dark:shadow-teal-900/30">
                <span className="text-lg">⏱</span>
              </div>
              <div>
                <p className="text-xl font-black text-teal-700 dark:text-teal-400 leading-none">
                  {roadDuration} <span className="text-sm font-bold">min</span>
                </p>
                <p className="text-[10px] text-teal-600/70 dark:text-teal-500/70 font-semibold mt-0.5">drive from KU gate</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Map */}
      <div className="h-72 mx-6 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-inner">
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          {!satellite && (
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution="© OpenStreetMap © CARTO"
            />
          )}
          {satellite && (
            <TileLayer
              url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              attribution="© Google Maps"
              maxZoom={20}
            />
          )}

          {/* KU Gate marker */}
          <Marker position={[KU_LAT, KU_LNG]} icon={kuIcon}>
            <Popup>
              <strong>KU Main Gate</strong><br />Starting point
            </Popup>
          </Marker>

          {/* Room marker */}
          <Marker position={[lat, lng]} icon={roomIcon}>
            <Popup>{title}</Popup>
          </Marker>

          <RouteFromKU lat={lat} lng={lng} />
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 px-6 py-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-600 border-2 border-white shadow" />
          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">KU Gate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-teal-500 border-2 border-white shadow" />
          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">Room</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-1 rounded-full bg-emerald-400" />
          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold">Route</span>
        </div>
      </div>

      {/* Get Directions button */}
      <div className="px-6 pb-6">
        <a
          href={"https://www.google.com/maps/dir/?api=1&origin=" + KU_LAT + "," + KU_LNG + "&destination=" + lat + "," + lng}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-bold transition-all duration-200 shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          Open in Google Maps
        </a>
      </div>
    </div>
  )
}