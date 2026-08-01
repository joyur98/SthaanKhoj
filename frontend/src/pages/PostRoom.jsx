import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createProperty } from "../services/api"
import Navbar from "../components/Navbar"
import { PickLocationMap } from "../components/RoomMap"

const AMENITIES_OPTIONS = [
  "WiFi", "Parking", "Water Included", "Electricity Included",
  "Furnished", "Kitchen", "Laundry", "Security", "Hot Water", "Balcony"
]

const ROOM_TYPES = ["room", "flat", "studio", "house", "pg", "office"]

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

function PostRoom({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [previews, setPreviews] = useState([])
  const [imageFiles, setImageFiles] = useState([])
  const [uploadProgress, setUploadProgress] = useState([])
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    availableFrom: "",
    roomType: "room",
    amenities: [],
    lat: null,
    lng: null,
  })

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const toggleAmenity = (amenity) =>
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(amenity)
        ? f.amenities.filter((a) => a !== amenity)
        : [...f.amenities, amenity],
    }))

  const handleLocationSelect = (lat, lng) =>
    setForm((f) => ({ ...f, lat, lng }))

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + imageFiles.length > 5) {
      setError("Maximum 5 photos allowed.")
      return
    }
    setError("")
    setImageFiles((prev) => [...prev, ...files])
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))])
    setUploadProgress((prev) => [...prev, ...files.map(() => 0)])
  }

  const removeImage = (i) => {
    setImageFiles((prev) => prev.filter((_, idx) => idx !== i))
    setPreviews((prev) => prev.filter((_, idx) => idx !== i))
    setUploadProgress((prev) => prev.filter((_, idx) => idx !== i))
  }

  const uploadToCloudinary = async (file, index) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", UPLOAD_PRESET)

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`)

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100)
          setUploadProgress((prev) => {
            const next = [...prev]
            next[index] = pct
            return next
          })
        }
      }

      xhr.onload = () => {
        const res = JSON.parse(xhr.responseText)
        if (xhr.status === 200) resolve(res.secure_url)
        else reject(new Error(res.error?.message || "Upload failed"))
      }

      xhr.onerror = () => reject(new Error("Network error during upload"))
      xhr.send(formData)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const images = await Promise.all(
        imageFiles.map((file, i) => uploadToCloudinary(file, i))
      )
      await createProperty({
        ...form,
        price: parseFloat(form.price),
        images,
        lat: form.lat,
        lng: form.lng,
      })
      setSuccess(true)
      setTimeout(() => navigate("/find-rooms"), 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={darkMode ? "dark" : ""}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <section className="relative overflow-hidden min-h-screen pt-8 pb-20 mesh-gradient-light dark:mesh-gradient transition-colors duration-300">
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary-200/20 dark:bg-primary-500/10 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>
        <div className="absolute bottom-[5%] right-[-10%] w-[350px] h-[350px] bg-teal-200/20 dark:bg-teal-500/10 rounded-full blur-[100px] -z-10 animate-pulse-slow" style={{ animationDelay: "2s" }}></div>

        <div className="max-w-3xl mx-auto px-6 md:px-12">

          <div className="mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 dark:bg-primary-950/30 rounded-full border border-primary-100/50 dark:border-primary-900/30">
              <span className="flex h-2 w-2 rounded-full bg-primary-600 dark:bg-primary-400 animate-ping"></span>
              <span className="text-xs font-bold text-primary-800 dark:text-primary-400 tracking-wide uppercase">
                Landlord Portal
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Post a{" "}
              <span className="bg-gradient-to-r from-primary-500 to-teal-400 bg-clip-text text-transparent">
                Room
              </span>
            </h1>
            <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">
              Fill in the details below and your listing will be visible to KU students.
            </p>
          </div>

          {success && (
            <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
              <span className="text-lg">✓</span> Room posted successfully! Redirecting…
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/40 rounded-2xl text-red-600 dark:text-red-400 text-sm font-semibold">
              <span className="text-lg">⚠</span> {error}
            </div>
          )}

          <div className="bg-white dark:bg-dark-900/50 border border-gray-100/70 dark:border-white/5 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.015)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-7">

              {/* Photo Upload */}
              <div className="space-y-2.5">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                  Photos <span className="text-gray-400 font-normal">(up to 5)</span>
                </label>
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl cursor-pointer hover:border-primary-400 dark:hover:border-primary-600 hover:bg-primary-50/50 dark:hover:bg-primary-950/10 transition-all duration-200">
                  <div className="flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <span className="text-sm font-semibold">Click to upload photos</span>
                    <span className="text-xs">JPG, PNG, WEBP up to 10MB each</span>
                  </div>
                  <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                </label>

                {previews.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {previews.map((src, i) => (
                      <div key={i} className="relative rounded-2xl overflow-hidden aspect-square">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        {loading && uploadProgress[i] < 100 && (
                          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                            <span className="text-white text-xs font-bold">{uploadProgress[i]}%</span>
                            <div className="w-3/4 h-1.5 bg-white/30 rounded-full mt-1">
                              <div className="h-full bg-primary-400 rounded-full transition-all" style={{ width: `${uploadProgress[i]}%` }} />
                            </div>
                          </div>
                        )}
                        {!loading && (
                          <button type="button" onClick={() => removeImage(i)} className="absolute top-1.5 right-1.5 p-1 bg-black/60 rounded-full text-white hover:bg-red-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                  Room Title <span className="text-primary-500">*</span>
                </label>
                <input
                  name="title" value={form.title} onChange={handleChange}
                  placeholder="e.g. Cozy room near KU main gate" required
                  className="w-full bg-gray-50/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 dark:focus:ring-primary-500/40 transition-all duration-200"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                  Description <span className="text-primary-500">*</span>
                </label>
                <textarea
                  name="description" value={form.description} onChange={handleChange}
                  placeholder="Describe the room, house rules, nearby facilities…"
                  required rows={4}
                  className="w-full bg-gray-50/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 dark:focus:ring-primary-500/40 transition-all duration-200 resize-none"
                />
              </div>

              {/* Price + Room Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Monthly Rent (NPR) <span className="text-primary-500">*</span>
                  </label>
                  <input
                    name="price" type="number" min="0" value={form.price}
                    onChange={handleChange} placeholder="e.g. 8000" required
                    className="w-full bg-gray-50/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 dark:focus:ring-primary-500/40 transition-all duration-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Room Type <span className="text-primary-500">*</span>
                  </label>
                  <select
                    name="roomType" value={form.roomType} onChange={handleChange}
                    className="w-full bg-gray-50/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50 dark:focus:ring-primary-500/40 transition-all duration-200 cursor-pointer"
                  >
                    {ROOM_TYPES.map((t) => (
                      <option key={t} value={t} className="dark:bg-dark-900">
                        {t === "pg" ? "PG" : t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location + Available From */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Location / Area <span className="text-primary-500">*</span>
                  </label>
                  <input
                    name="location" value={form.location} onChange={handleChange}
                    placeholder="e.g. Dhulikhel, Kavre" required
                    className="w-full bg-gray-50/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 dark:focus:ring-primary-500/40 transition-all duration-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Available From <span className="text-primary-500">*</span>
                  </label>
                  <input
                    name="availableFrom" type="date" value={form.availableFrom}
                    onChange={handleChange} required
                    className="w-full bg-gray-50/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50 dark:focus:ring-primary-500/40 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Map Location Picker */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                  Pin Location on Map
                </label>
                <PickLocationMap
                  lat={form.lat}
                  lng={form.lng}
                  onLocationSelect={handleLocationSelect}
                />
              </div>

              {/* Amenities */}
              <div className="space-y-2.5">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                  Amenities
                </label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES_OPTIONS.map((a) => (
                    <button
                      type="button" key={a} onClick={() => toggleAmenity(a)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                        form.amenities.includes(a)
                          ? "bg-gradient-to-r from-primary-600 to-teal-500 text-white border-transparent shadow-[0_4px_14px_rgba(16,185,129,0.22)]"
                          : "bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200/80 dark:border-white/10 hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-600 dark:hover:text-primary-400"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit" disabled={loading || success}
                className="relative overflow-hidden w-full py-3.5 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-teal-500 hover:from-primary-700 hover:to-teal-600 shadow-[0_4px_14px_rgba(16,185,129,0.22)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.32)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Uploading & Posting…
                  </span>
                ) : "Post Room"}
              </button>

            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PostRoom