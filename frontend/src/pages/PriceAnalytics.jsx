import { useEffect, useState, useMemo } from "react"
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts"
import Navbar from "../components/Navbar"
import { db } from "../firebase"
import { collection, onSnapshot } from "firebase/firestore"

// ── Helpers ────────────────────────────────────────────────────────────────

const COLORS = ["#059669", "#0d9488", "#0891b2", "#7c3aed", "#db2777", "#ea580c"]
const AVAILABILITY_COLORS = ["#059669", "#d1d5db"] // available, occupied

const formatPrice = (v) => `Rs. ${Number(v).toLocaleString()}`

const monthLabel = (iso) => {
  const d = new Date(iso)
  return d.toLocaleString("default", { month: "short", year: "2-digit" })
}

const formatK = (v) => (v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : `${Math.round(v)}`)

// "Added 2 days ago" / "Added yesterday" / "Added today"
const timeAgo = (iso) => {
  if (!iso) return ""
  const diffMs = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days <= 0) return "Added today"
  if (days === 1) return "Added yesterday"
  return `Added ${days} days ago`
}

// ── Skeleton loader ────────────────────────────────────────────────────────
function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-white/10 rounded-xl ${className}`} />
  )
}

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="bg-white dark:bg-dark-900/60 rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{value}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ── Chart Card wrapper ─────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white dark:bg-dark-900/60 rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

// ── Custom Tooltip ─────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="font-bold text-gray-700 dark:text-gray-200 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {formatPrice(p.value)}
        </p>
      ))}
    </div>
  )
}

// ── Live indicator ─────────────────────────────────────────────────────────
function LiveBadge({ lastUpdated }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      Live
      {lastUpdated && (
        <span className="text-gray-300 dark:text-gray-600">
          · updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      )}
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function PriceAnalytics() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // Real-time subscription — charts refresh automatically as listings
  // are added, edited, or removed in Firestore.
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "properties"),
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        setProperties(data)
        setLastUpdated(new Date())
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error(err)
        setError("Failed to load property data.")
        setLoading(false)
      }
    )
    return () => unsubscribe()
  }, [])

  // ── Derived analytics ───────────────────────────────────────────────────

  const stats = useMemo(() => {
    if (!properties.length) return null
    const prices = properties.map((p) => p.price).filter(Boolean)
    if (!prices.length) return null
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const available = properties.filter((p) => p.isAvailable).length
    return { avg: Math.round(avg), min, max, total: properties.length, available }
  }, [properties])

  // Monthly average rent trend
  const monthlyTrend = useMemo(() => {
    const map = {}
    properties.forEach((p) => {
      if (!p.createdAt || !p.price) return
      const key = monthLabel(p.createdAt)
      if (!map[key]) map[key] = { total: 0, count: 0 }
      map[key].total += p.price
      map[key].count += 1
    })
    return Object.entries(map)
      .map(([month, { total, count }]) => ({
        month,
        avgPrice: Math.round(total / count),
      }))
      .sort((a, b) => new Date("1 " + a.month) - new Date("1 " + b.month))
  }, [properties])

  // Average rent by area (top 6)
  const byLocation = useMemo(() => {
    const map = {}
    properties.forEach((p) => {
      if (!p.location || !p.price) return
      const area = p.location.split(",")[0].trim()
      if (!map[area]) map[area] = { total: 0, count: 0 }
      map[area].total += p.price
      map[area].count += 1
    })
    return Object.entries(map)
      .map(([area, { total, count }]) => ({
        area,
        avgPrice: Math.round(total / count),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [properties])

  // Room type share for pie
  const roomTypePie = useMemo(() => {
    const map = {}
    properties.forEach((p) => {
      if (!p.roomType) return
      const key = p.roomType.charAt(0).toUpperCase() + p.roomType.slice(1)
      map[key] = (map[key] || 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [properties])

  // Availability — available vs occupied
  const availabilityData = useMemo(() => {
    if (!properties.length) return []
    const available = properties.filter((p) => p.isAvailable).length
    const occupied = properties.length - available
    return [
      { name: "Available", value: available },
      { name: "Occupied", value: occupied },
    ]
  }, [properties])

  // Recently added listings (newest first)
  const recentListings = useMemo(() => {
    return [...properties]
      .filter((p) => p.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)
  }, [properties])

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Page header */}
        <div className="mb-8 flex items-end justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-6 rounded-full bg-emerald-500" />
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Rental Analytics</h1>
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500 ml-3.5">
              Rental insights around Kathmandu University, powered by live SthaanKhoj listings
            </p>
          </div>
          <LiveBadge lastUpdated={lastUpdated} />
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 font-semibold">
            ⚠ {error}
          </div>
        )}

        {/* ── Stat cards ── */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
        ) : stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon="🏠" label="Total Listings" value={stats.total} sub={`${stats.available} available now`} color="bg-emerald-500" />
            <StatCard icon="📊" label="Average Rent" value={`Rs. ${stats.avg.toLocaleString()}`} sub="per month" color="bg-teal-500" />
            <StatCard icon="⬇" label="Lowest Rent" value={`Rs. ${stats.min.toLocaleString()}`} sub="cheapest listing" color="bg-blue-500" />
            <StatCard icon="⬆" label="Highest Rent" value={`Rs. ${stats.max.toLocaleString()}`} sub="priciest listing" color="bg-purple-500" />
          </div>
        )}

        {/* ── Charts grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-72" />)}
          </div>
        ) : !stats ? (
          <div className="bg-white dark:bg-dark-900/60 rounded-2xl p-10 border border-gray-100 dark:border-white/5 shadow-sm text-center">
            <p className="text-sm text-gray-400">No listings with price data yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* 1. Monthly rent trend */}
            <ChartCard
              title="Average Monthly Rent Trend"
              subtitle="How average rent has moved over time"
            >
              {monthlyTrend.length < 2 ? (
                <p className="text-xs text-gray-400 text-center py-10">Not enough data yet — more listings needed.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `Rs.${formatK(v)}`} tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="avgPrice"
                      name="Avg Rent"
                      stroke="#059669"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#059669" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* 2. Average rent by area */}
            <ChartCard
              title="Average Rent by Area"
              subtitle="Comparing localities around KU"
            >
              {byLocation.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-10">No location data found.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={byLocation} layout="vertical" barSize={18}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" tickFormatter={(v) => `Rs.${formatK(v)}`} tick={{ fontSize: 10 }} />
                    <YAxis dataKey="area" type="category" tick={{ fontSize: 10 }} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="avgPrice" name="Avg Rent" radius={[0, 6, 6, 0]}>
                      {byLocation.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* 3. Room type share */}
            <ChartCard
              title="Room Type Share"
              subtitle="Proportion of each listing type"
            >
              {roomTypePie.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-10">No room type data found.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={roomTypePie}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {roomTypePie.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v} listings`, n]} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* 4. Availability */}
            <ChartCard
              title="Room Availability"
              subtitle="Available vs. currently occupied"
            >
              {availabilityData.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-10">No availability data found.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={availabilityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {availabilityData.map((_, i) => (
                        <Cell key={i} fill={AVAILABILITY_COLORS[i % AVAILABILITY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v} listings`, n]} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

          </div>
        )}

        {/* ── Bottom section: Most Affordable Areas + Recently Added ── */}
        {!loading && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">

            {/* 5. Most affordable areas */}
            <ChartCard
              title="Most Affordable Areas"
              subtitle="Areas ranked by lowest average rent"
            >
              {byLocation.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-10">No location data found.</p>
              ) : (
                <div className="space-y-3 mt-2">
                  {[...byLocation]
                    .sort((a, b) => a.avgPrice - b.avgPrice)
                    .map((loc, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs font-black text-gray-400 w-5">{i + 1}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{loc.area}</span>
                            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                              Rs. {loc.avgPrice.toLocaleString()}
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                              style={{
                                width: `${Math.min(100, (loc.avgPrice / (stats?.max || 1)) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400 w-14 text-right">{loc.count} listing{loc.count !== 1 ? "s" : ""}</span>
                      </div>
                    ))}
                </div>
              )}
            </ChartCard>

            {/* 6. Recently added listings */}
            <ChartCard
              title="Recently Added Listings"
              subtitle="Newest rooms posted on SthaanKhoj"
            >
              {recentListings.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-10">No listings yet.</p>
              ) : (
                <div className="space-y-3 mt-1">
                  {recentListings.map((p) => (
                    <div key={p.id} className="flex items-center justify-between border-b border-gray-50 dark:border-white/5 last:border-0 pb-3 last:pb-0">
                      <div>
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-200">
                          {p.roomType ? `${p.roomType.charAt(0).toUpperCase()}${p.roomType.slice(1)}` : "Room"}
                          {p.location && <span className="text-gray-400 font-normal"> in {p.location.split(",")[0].trim()}</span>}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(p.createdAt)}</p>
                      </div>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0">
                        {p.price ? formatPrice(p.price) : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </ChartCard>

          </div>
        )}

        {/* Footer note */}
        <p className="text-center text-xs text-gray-300 dark:text-gray-600 mt-10">
          Data sourced from live SthaanKhoj listings · Updates in real-time
        </p>

      </div>
    </div>
  )
}