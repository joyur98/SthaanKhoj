import { useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import L from "leaflet"

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

function LocationPicker({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    },
  })

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

      <div className="rounded-2xl overflow-hidden h-80">
        <MapContainer
          center={[lat, lng]}
          zoom={17}
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

          <Marker position={[lat, lng]}>
            <Popup>{title}</Popup>
          </Marker>
        </MapContainer>
      </div>

      <a
        href={"https://www.google.com/maps?q=" + lat + "," + lng}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
      >
        Open in Google Maps
      </a>
    </div>
  )
}