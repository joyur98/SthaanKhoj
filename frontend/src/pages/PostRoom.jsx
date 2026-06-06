import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createProperty } from "../services/api"
import Navbar from "../components/Navbar"

const AMENITIES_OPTIONS = [
  "WiFi", "Parking", "Water Included", "Electricity Included",
  "Furnished", "Kitchen", "Laundry", "Security", "Hot Water", "Balcony"
]

const ROOM_TYPES = ["room", "flat", "studio", "house", "pg"]

function PostRoom({ darkMode, toggleDarkMode }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    availableFrom: "",
    roomType: "room",
    amenities: [],
    images: [""],
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

  const handleImageChange = (i, val) =>
    setForm((f) => {
      const imgs = [...f.images]
      imgs[i] = val
      return { ...f, images: imgs }
    })

  const addImageField = () =>
    setForm((f) => ({ ...f, images: [...f.images, ""] }))

  const removeImageField = (i) =>
    setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await createProperty({
        ...form,
        price: parseFloat(form.price),
        images: form.images.filter((u) => u.trim() !== ""),
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

        {/* Ambient blobs — matches Hero.jsx */}
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary-200/20 dark:bg-primary-500/10 rounded-full blur-[120px] -z-10 animate-pulse-slow"></div>
        <div className="absolute bottom-[5%] right-[-10%] w-[350px] h-[350px] bg-teal-200/20 dark:bg-teal-500/10 rounded-full blur-[100px] -z-10 animate-pulse-slow" style={{ animationDelay: "2s" }}></div>

        <div className="max-w-3xl mx-auto px-6 md:px-12">

          {/* Page Header */}
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
              Fill in the details below and your listing will be visible to KU students on Find Rooms.
            </p>
          </div>

          {/* Success Banner */}
          {success && (
            <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 rounded-2xl text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
              <span className="text-lg">✓</span> Room posted successfully! Redirecting…
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-6 flex items-center gap-3 px-5 py-4 bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/40 rounded-2xl text-red-600 dark:text-red-400 text-sm font-semibold">
              <span className="text-lg">⚠</span> {error}
            </div>
          )}

          {/* Form Card — matches Features card style */}
          <div className="bg-white dark:bg-dark-900/50 border border-gray-100/70 dark:border-white/5 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.015)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] p-8 md:p-10 space-y-8">

            <form onSubmit={handleSubmit} className="space-y-7">

              {/* Title */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                  Room Title <span className="text-primary-500">*</span>
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Cozy room near KU main gate"
                  required
                  className="w-full bg-gray-50/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 dark:focus:ring-primary-500/40 focus:border-primary-300 dark:focus:border-primary-700 transition-all duration-200"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                  Description <span className="text-primary-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the room, house rules, nearby facilities…"
                  required
                  rows={4}
                  className="w-full bg-gray-50/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 dark:focus:ring-primary-500/40 focus:border-primary-300 dark:focus:border-primary-700 transition-all duration-200 resize-none"
                />
              </div>

              {/* Price + Room Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Monthly Rent (NPR) <span className="text-primary-500">*</span>
                  </label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="e.g. 8000"
                    required
                    className="w-full bg-gray-50/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 dark:focus:ring-primary-500/40 transition-all duration-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Room Type <span className="text-primary-500">*</span>
                  </label>
                  <select
                    name="roomType"
                    value={form.roomType}
                    onChange={handleChange}
                    className="w-full bg-gray-50/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50 dark:focus:ring-primary-500/40 transition-all duration-200 cursor-pointer"
                  >
                    {ROOM_TYPES.map((t) => (
                      <option key={t} value={t} className="dark:bg-dark-900">
                        {t.charAt(0).toUpperCase() + t.slice(1)}
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
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="e.g. Dhulikhel, Kavre"
                    required
                    className="w-full bg-gray-50/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 dark:focus:ring-primary-500/40 transition-all duration-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                    Available From <span className="text-primary-500">*</span>
                  </label>
                  <input
                    name="availableFrom"
                    type="date"
                    value={form.availableFrom}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-50/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-400/50 dark:focus:ring-primary-500/40 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-2.5">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                  Amenities
                </label>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES_OPTIONS.map((a) => (
                    <button
                      type="button"
                      key={a}
                      onClick={() => toggleAmenity(a)}
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

              {/* Image URLs */}
              <div className="space-y-2.5">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                  Photo URLs
                </label>
                <div className="space-y-2">
                  {form.images.map((url, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        value={url}
                        onChange={(e) => handleImageChange(i, e.target.value)}
                        placeholder="https://example.com/photo.jpg"
                        className="flex-1 bg-gray-50/80 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-400/50 dark:focus:ring-primary-500/40 transition-all duration-200"
                      />
                      {form.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeImageField(i)}
                          className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addImageField}
                  className="flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add another photo
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || success}
                className="relative overflow-hidden w-full py-3.5 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-teal-500 hover:from-primary-700 hover:to-teal-600 shadow-[0_4px_14px_rgba(16,185,129,0.22)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.32)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Posting…
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