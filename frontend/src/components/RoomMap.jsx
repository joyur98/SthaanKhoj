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

// Custom KU Gate marker - pulsing green double ring with graduate pin
const kuIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative; width:44px; height:44px; display:flex; justify-content:center; align-items:center;">
      <div class="animate-ku-pulse" style="
        position:absolute;
        width:40px;
        height:40px;
        border-radius:50%;
        background:rgba(16,185,129,0.15);
        border:1.5px solid #10b981;
      "></div>
      <div class="animate-ku-pulse" style="
        position:absolute;
        width:56px;
        height:56px;
        border-radius:50%;
        background:rgba(16,185,129,0.08);
        border:1px dashed #10b981;
        animation-delay: 0.6s;
      "></div>
      <div class="map-marker-glow" style="
        width:28px;
        height:28px;
        border-radius:50%;
        background:linear-gradient(135deg, #10b981 0%, #059669 100%);
        border:2.5px solid white;
        box-shadow: 0 4px 10px rgba(5,150,105,0.4);
        display:flex;
        justify-content:center;
        align-items:center;
        z-index: 10;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="14" height="14">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [56, 56],
  iconAnchor: [28, 28],
})

// Custom Room marker - coral-red gradient pulsing pin with home icon inside
const roomIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative; width:48px; height:48px; display:flex; justify-content:center; align-items:center;">
      <div style="
        position:absolute;
        width:36px;
        height:36px;
        border-radius:50%;
        background:rgba(255,107,71,0.25);
        border:1.5px solid #FF6B47;
        animation: marker-pulse 2s infinite ease-in-out;
      "></div>
      <div class="map-marker-glow" style="
        width:30px;
        height:30px;
        border-radius:12px 12px 0 12px;
        transform: rotate(45deg);
        background:linear-gradient(135deg, #FF6B47 0%, #E0522E 100%);
        border:2px solid white;
        box-shadow: 0 4px 12px rgba(255,107,71,0.5);
        display:flex;
        justify-content:center;
        align-items:center;
        z-index:10;
      ">
        <div style="transform: rotate(-45deg); display:flex; justify-content:center; align-items:center;">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2.5" width="13" height="13">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        </div>
      </div>
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
})

// ============================================
// UPDATED STUDENT SPOTS DATA
// ============================================
const STUDENT_SPOTS = [
  // Cafe & Chill
  {
    id: "cafe-1",
    name: "Thuldai ko chiya chautari",
    category: "cafe",
    lat: 27.62131,
    lng: 85.54147,
    desc: "Chilled spot for coffee and discussions near Buddha park.",
  },
  {
    id: "cafe-2",
    name: "Niru Bakery",
    category: "cafe",
    lat: 27.62117,
    lng: 85.53842,
    desc: "Fresh bakeries and pastries, highly rated by students.",
  },
  
  // Bus & Travel
  {
    id: "trans-1",
    name: "Dhulikhel Hospital Chowk - Local Buses",
    category: "transport",
    lat: 27.61862,
    lng: 85.55005,
    desc: "Local bus stop near Dhulikhel Hospital for commuting.",
  },
  {
    id: "trans-2",
    name: "Bus Stop for KU Students",
    category: "transport",
    lat: 27.61774,
    lng: 85.53734,
    desc: "Dedicated bus stop used by Kathmandu University students for daily commute.",
  },
  {
    id: "trans-3",
    name: "28Kilo Chowk - Local Buses",
    category: "transport",
    lat: 27.62507,
    lng: 85.54100,
    desc: "Catch local buses to Kathmandu and Dhulikhel from this hub.",
  },
  
  // Hospitals (NEW)
  {
    id: "hospital-1",
    name: "Dhulikhel Hospital",
    category: "hospital",
    lat: 27.61699,
    lng: 85.54803,
    desc: "Dhulikhel Hospital - Primary healthcare facility serving KU students.",
  },
  {
    id: "hospital-2",
    name: "Scheer Memorial Hospital",
    category: "hospital",
    lat: 27.63312,
    lng: 85.52735,
    desc: "Scheer Memorial Hospital - Well-equipped medical facility nearby.",
  },
  
  // Stores
  {
    id: "shop-1",
    name: "369 Mini Mart",
    category: "utility",
    lat: 27.62144,
    lng: 85.53822,
    desc: "Convenient grocery store stocked with student essentials.",
  },
]

// ============================================
// UPDATED getCategoryIcon Function
// ============================================
const getCategoryIcon = (category) => {
  let color = "#3b82f6" // blue utility
  let emoji = "🛒"
  
  if (category === "cafe") {
    color = "#f59e0b" // amber cafe
    emoji = "☕"
  } else if (category === "transport") {
    color = "#8b5cf6" // purple transport
    emoji = "🚌"
  } else if (category === "hospital") {
    color = "#ef4444" // red hospital
    emoji = "🏥"
  } else if (category === "utility") {
    color = "#3b82f6" // blue utility
    emoji = "🛒"
  }

  return L.divIcon({
    className: "",
    html: `
      <div class="map-marker-glow" style="
        width:24px;
        height:24px;
        border-radius:50%;
        background: ${color};
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        display:flex;
        justify-content:center;
        align-items:center;
      ">
        <span style="font-size: 11px; line-height:1; display:flex; justify-content:center; align-items:center;">${emoji}</span>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

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
    const svg = map.getContainer().querySelector("svg")
    if (svg) {
      let defs = svg.querySelector("defs")
      if (!defs) {
        defs = document.createElementNS("http://www.w3.org/2000/svg", "defs")
        svg.insertBefore(defs, svg.firstChild)
      }
      if (!defs.querySelector("#route-gradient")) {
        const gradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient")
        gradient.id = "route-gradient"
        gradient.setAttribute("x1", "0%")
        gradient.setAttribute("y1", "0%")
        gradient.setAttribute("x2", "100%")
        gradient.setAttribute("y2", "100%")
        gradient.innerHTML = `
          <stop offset="0%" stop-color="#10b981" />
          <stop offset="100%" stop-color="#06D6A0" />
        `
        defs.appendChild(gradient)
      }
    }
  }, [map])

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
        styles: [{ className: "animated-route-line", color: "#10b981", weight: 6, opacity: 0.85 }],
      },
      createMarker: () => null,
    }).addTo(map)

    const originalClearLines = routingControl._clearLines.bind(routingControl)
    routingControl._clearLines = function (...args) {
      try {
        originalClearLines(...args)
      } catch {
        // Route lines were already removed — safe to ignore.
      }
    }

    let removed = false
    const safeRemove = () => {
      if (removed) return
      removed = true
      try {
        map.removeControl(routingControl)
      } catch {
        // Control may already be detached — safe to ignore.
      }
    }

    return safeRemove
  }, [map, lat, lng])

  return null
}

function MapZoomControls() {
  const map = useMap()
  return (
    <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-1.5">
      <button
        type="button"
        onClick={() => map.zoomIn()}
        className="w-9 h-9 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-200 dark:border-white/10 shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title="Zoom In"
      >
        <span className="text-xl font-bold select-none leading-none">+</span>
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut()}
        className="w-9 h-9 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-200 dark:border-white/10 shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title="Zoom Out"
      >
        <span className="text-xl font-bold select-none leading-none -mt-1">-</span>
      </button>
    </div>
  )
}

function MapRecenterControl({ center }) {
  const map = useMap()
  return (
    <button
      type="button"
      onClick={() => map.flyTo(center, 16)}
      className="absolute bottom-28 right-4 z-[1000] w-9 h-9 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-200 dark:border-white/10 shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
      title="Recenter Map"
    >
      <span className="text-base select-none">🧭</span>
    </button>
  )
}

export function PickLocationMap({ lat, lng, onLocationSelect }) {
  const [mapType, setMapType] = useState("voyager")
  const center = lat && lng ? [lat, lng] : [27.6244, 85.5394]

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold">
        Click on the map to set the exact room location
      </p>

      <div className="relative rounded-2xl overflow-hidden border border-gray-200/80 dark:border-white/10 h-80 shadow-md">
        <div className="absolute top-3 right-3 z-[1000] flex gap-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border border-gray-200/20 dark:border-white/10 p-1 rounded-xl shadow-lg">
          <button
            type="button"
            onClick={() => setMapType("voyager")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
              mapType === "voyager"
                ? "bg-[#06D6A0] text-white"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            🗺 Street
          </button>
          <button
            type="button"
            onClick={() => setMapType("satellite")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
              mapType === "satellite"
                ? "bg-[#06D6A0] text-white"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            🛰 Sat
          </button>
          <button
            type="button"
            onClick={() => setMapType("positron")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
              mapType === "positron"
                ? "bg-[#06D6A0] text-white"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            ⚪ Clean
          </button>
        </div>

        <MapContainer
          center={center}
          zoom={16}
          zoomControl={false}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          {mapType === "voyager" && (
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution="© OpenStreetMap © CARTO"
            />
          )}
          {mapType === "positron" && (
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution="© OpenStreetMap © CARTO"
            />
          )}
          {mapType === "satellite" && (
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

          <MapZoomControls />
          <MapRecenterControl center={center} />
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

function MapFitRouteControl({ roomCoords }) {
  const map = useMap()
  useEffect(() => {
    if (!roomCoords?.[0]) return
    const bounds = L.latLngBounds([[KU_LAT, KU_LNG], roomCoords])
    map.fitBounds(bounds, { padding: [50, 50] })
  }, [map, roomCoords])

  const fit = () => {
    if (!roomCoords?.[0]) return
    const bounds = L.latLngBounds([[KU_LAT, KU_LNG], roomCoords])
    map.flyToBounds(bounds, { padding: [50, 50], duration: 1.2 })
  }

  return (
    <button
      type="button"
      onClick={fit}
      className="absolute bottom-28 right-4 z-[1000] w-9 h-9 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-200 dark:border-white/10 shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
      title="Recenter Route View"
    >
      <span className="text-base select-none">🧭</span>
    </button>
  )
}

export function ViewLocationMap({ lat, lng, title }) {
  const [mapType, setMapType] = useState("voyager")
  const [showCafes, setShowCafes] = useState(false)
  const [showTransport, setShowTransport] = useState(false)
  const [showHospitals, setShowHospitals] = useState(false)
  const [showUtility, setShowUtility] = useState(false)

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

  const walkTime = roadDistance ? Math.round((parseFloat(roadDistance) / 4.8) * 60) : null
  const bikeTime = roadDistance ? Math.round((parseFloat(roadDistance) / 14) * 60) : null

  return (
    <div className="bg-white dark:bg-dark-900/50 border border-gray-100/70 dark:border-white/5 rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] space-y-4">
      {/* Header with Switcher */}
      <div className="flex items-center justify-between px-6 pt-5 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#06D6A0] animate-pulse" />
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Location & Proximity</h2>
        </div>

        <div className="flex gap-1 bg-gray-50 dark:bg-white/5 border border-gray-200/50 dark:border-white/10 p-0.5 rounded-xl">
          <button
            type="button"
            onClick={() => setMapType("voyager")}
            className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold transition-all cursor-pointer ${
              mapType === "voyager"
                ? "bg-[#06D6A0] text-white"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            🗺 Street
          </button>
          <button
            type="button"
            onClick={() => setMapType("satellite")}
            className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold transition-all cursor-pointer ${
              mapType === "satellite"
                ? "bg-[#06D6A0] text-white"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            🛰 Sat
          </button>
          <button
            type="button"
            onClick={() => setMapType("positron")}
            className={`px-2.5 py-1 rounded-lg text-[9px] font-extrabold transition-all cursor-pointer ${
              mapType === "positron"
                ? "bg-[#06D6A0] text-white"
                : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            ⚪ Clean
          </button>
        </div>
      </div>

      {/* Travel Duration Cards */}
      <div className="px-6">
        {loading ? (
          <div className="grid grid-cols-3 gap-2.5 animate-pulse">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="h-16 bg-gray-100 dark:bg-white/5 rounded-2xl" />
            ))}
          </div>
        ) : roadDistance ? (
          <div className="grid grid-cols-3 gap-2.5">
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100/40 dark:border-emerald-900/20 shadow-sm text-center">
              <span className="text-xl mb-1">🚗</span>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Drive</p>
              <p className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                {roadDuration} <span className="text-[10px] font-bold">min</span>
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-teal-50/60 dark:bg-teal-950/20 border border-teal-100/40 dark:border-teal-900/20 shadow-sm text-center">
              <span className="text-xl mb-1">🚲</span>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ride</p>
              <p className="text-base font-black text-teal-600 dark:text-teal-400 mt-0.5">
                {bikeTime} <span className="text-[10px] font-bold">min</span>
              </p>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#FF6B47]/10 dark:bg-[#FF6B47]/5 border border-[#FF6B47]/20 dark:border-[#FF6B47]/10 shadow-sm text-center">
              <span className="text-xl mb-1">🚶</span>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Walk</p>
              <p className="text-base font-black text-[#FF6B47] mt-0.5">
                {walkTime} <span className="text-[10px] font-bold">min</span>
              </p>
            </div>
          </div>
        ) : null}

        {roadDistance && (
          <p className="text-[10px] text-center text-gray-400 font-semibold mt-2.5">
            Total distance to Kathmandu University Main Gate is approximately <span className="text-gray-700 dark:text-gray-300 font-bold">{roadDistance} km</span>.
          </p>
        )}
      </div>

      {/* Map Container */}
      <div className="h-72 mx-6 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-inner relative">
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          zoomControl={false}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          {mapType === "voyager" && (
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution="© OpenStreetMap © CARTO"
            />
          )}
          {mapType === "positron" && (
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution="© OpenStreetMap © CARTO"
            />
          )}
          {mapType === "satellite" && (
            <TileLayer
              url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              attribution="© Google Maps"
              maxZoom={20}
            />
          )}

          <Marker position={[KU_LAT, KU_LNG]} icon={kuIcon}>
            <Popup>
              <div className="p-1 text-center">
                <p className="font-bold text-gray-900">Kathmandu University</p>
                <p className="text-xs text-gray-500 mt-0.5">Main Gate Entrance</p>
              </div>
            </Popup>
          </Marker>

          <Marker position={[lat, lng]} icon={roomIcon}>
            <Popup>
              <div className="p-1 text-center">
                <p className="font-bold text-[#FF6B47]">{title || "Room Location"}</p>
                <p className="text-xs text-gray-500 mt-0.5">Rent: NPR {title ? "..." : ""}</p>
              </div>
            </Popup>
          </Marker>

          {STUDENT_SPOTS.map((spot) => {
            const visible =
              (spot.category === "cafe" && showCafes) ||
              (spot.category === "transport" && showTransport) ||
              (spot.category === "hospital" && showHospitals) ||
              (spot.category === "utility" && showUtility)

            if (!visible) return null

            return (
              <Marker key={spot.id} position={[spot.lat, spot.lng]} icon={getCategoryIcon(spot.category)}>
                <Popup>
                  <div className="p-1">
                    <p className="font-bold text-gray-800 flex items-center gap-1.5">
                      {spot.category === "cafe" ? "☕" : 
                       spot.category === "transport" ? "🚌" : 
                       spot.category === "hospital" ? "🏥" : "🛒"} {spot.name}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{spot.desc}</p>
                  </div>
                </Popup>
              </Marker>
            )
          })}

          <RouteFromKU lat={lat} lng={lng} />
          <MapZoomControls />
          <MapFitRouteControl roomCoords={[lat, lng]} />
        </MapContainer>
      </div>

      {/* Layer/Amenities Filter Controls - UPDATED */}
      <div className="px-6 pb-2">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Show Student Places Nearby:</p>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => setShowCafes((c) => !c)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              showCafes
                ? "bg-amber-500 border-transparent text-white shadow-[0_4px_10px_rgba(245,158,11,0.3)]"
                : "bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-amber-400"
            }`}
          >
            <span>☕</span> Cafe & Chill
          </button>
          <button
            type="button"
            onClick={() => setShowTransport((t) => !t)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              showTransport
                ? "bg-purple-500 border-transparent text-white shadow-[0_4px_10px_rgba(139,92,246,0.3)]"
                : "bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-purple-400"
            }`}
          >
            <span>🚌</span> Bus & Travel
          </button>
          <button
            type="button"
            onClick={() => setShowHospitals((h) => !h)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              showHospitals
                ? "bg-red-500 border-transparent text-white shadow-[0_4px_10px_rgba(239,68,68,0.3)]"
                : "bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-red-400"
            }`}
          >
            <span>🏥</span> Hospitals
          </button>
          <button
            type="button"
            onClick={() => setShowUtility((u) => !u)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              showUtility
                ? "bg-blue-500 border-transparent text-white shadow-[0_4px_10px_rgba(59,130,246,0.3)]"
                : "bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:border-blue-400"
            }`}
          >
            <span>🛒</span> Shops
          </button>
        </div>
      </div>

      {/* Safety & Location Insights Card */}
      {roadDistance && (
        <div className="px-6 py-4 mx-6 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-3">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Neighborhood Insights</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-white/5 flex items-center gap-3">
              <span className="text-xl">🚶‍♂️</span>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Walkability</p>
                <p className="text-xs font-black text-gray-800 dark:text-white mt-0.5">
                  {parseFloat(roadDistance) <= 1.0
                    ? "9.8 / 10 (Extremely Walkable)"
                    : parseFloat(roadDistance) <= 2.5
                    ? "8.5 / 10 (Highly Walkable)"
                    : "6.2 / 10 (Commuter Friendly)"}
                </p>
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-xs border border-gray-100 dark:border-white/5 flex items-center gap-3">
              <span className="text-xl">🛡️</span>
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Safety Score</p>
                <p className="text-xs font-black text-gray-800 dark:text-white mt-0.5">
                  {parseFloat(roadDistance) <= 1.5
                    ? "9.6 / 10 (Student Hub)"
                    : parseFloat(roadDistance) <= 3.0
                    ? "9.0 / 10 (Very Secure)"
                    : "8.5 / 10 (Quiet Residential)"}
                </p>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-2 pt-2 border-t border-gray-100/30 dark:border-white/5">
            {parseFloat(roadDistance) <= 1.0 ? (
              <>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span><strong>Prime Location:</strong> Less than a 10-minute walk to Kathmandu University gates.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span><strong>Student Streets:</strong> Active streetlights and student presence make late-night library returns safe.</span>
                </div>
              </>
            ) : parseFloat(roadDistance) <= 2.5 ? (
              <>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span><strong>Balanced Lifestyle:</strong> Quiet, peaceful neighborhood ideal for self-study and focusing.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span><strong>Good Access:</strong> Easy walk to campus (approx. 15-20 mins) or quick 5-minute cycle/ride.</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span><strong>Highly Peaceful:</strong> Far from the noise of campus gates, nestled in a secure residential suburb.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                  <span><strong>Transit Options:</strong> Well-connected by local micro-buses or ideal for a scenic bicycle commute.</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Google Maps directions */}
      <div className="px-6 pb-6 pt-1">
        <a
          href={`https://www.google.com/maps/dir/?api=1&origin=${KU_LAT},${KU_LNG}&destination=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-bold transition-all duration-200 shadow-lg shadow-emerald-200/20 dark:shadow-emerald-950/20 hover:-translate-y-0.5 active:translate-y-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4.5 h-4.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          Get Route Directions in Google Maps
        </a>
      </div>
    </div>
  )
}