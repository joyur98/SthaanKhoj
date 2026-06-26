import { useEffect, useState, useMemo } from "react"
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts"
import Navbar from "../components/Navbar"
import { db } from "../firebase"
import { collection, getDocs } from "firebase/firestore"

// ── Helpers ────────────────────────────────────────────────────────────────

const COLORS = ["#059669", "#0d9488", "#0891b2", "#7c3aed", "#db2777", "#ea580c"]

const formatPrice = (v) => `Rs. ${Number(v).toLocaleString()}`

const monthLabel = (iso) => {
  const d = new Date(iso)
  return d.toLocaleString("default", { month: "short", year: "2-digit" })
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

// ── Main Component ─────────────────────────────────────────────────────────
export default function PriceAnalytics() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const snap = await getDocs(collection(db, "properties"))
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        setProperties(data)
      } catch (err) {
        console.error(err)
        setError("Failed to load property data.")
      } finally {
        setLoading(false)
      }
    }
    fetchProperties()
  }, [])

  // ── Derived analytics ───────────────────────────────────────────────────

  const stats = useMemo(() => {
    if (!properties.length) return null
    const prices = properties.map((p) => p.price).filter(Boolean)
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const available = properties.filter((p) => p.isAvailable).length
    return { avg: Math.round(avg), min, max, total: properties.length, available }
  }, [properties])

  // Monthly average price trend
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

  // Price by room type
  const byRoomType = useMemo(() => {
    const map = {}
    properties.forEach((p) => {
      if (!p.roomType || !p.price) return
      const key = p.roomType.charAt(0).toUpperCase() + p.roomType.slice(1)
      if (!map[key]) map[key] = { total: 0, count: 0 }
      map[key].total += p.price
      map[key].count += 1
    })
    return Object.entries(map).map(([type, { total, count }]) => ({
      type,
      avgPrice: Math.round(total / count),
      count,
    }))
  }, [properties])

  // Price by location (top 6)
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

  // Price range distribution
  const priceDistribution = useMemo(() => {
    const brackets = [
      { label: "< Rs.3k", min: 0, max: 3000 },
      { label: "Rs.3k–5k", min: 3000, max: 5000 },
      { label: "Rs.5k–8k", min: 5000, max: 8000 },
      { label: "Rs.8k–12k", min: 8000, max: 12000 },
      { label: "> Rs.12k", min: 12000, max: Infinity },
    ]
    return brackets.map((b) => ({
      label: b.label,
      count: properties.filter((p) => p.price >= b.min && p.price < b.max).length,
    }))
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

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-6 rounded-full bg-emerald-500" />
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Market Analytics</h1>
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500 ml-3.5">
            Real-time pricing insights across all listings in SthaanKhoj
          </p>
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
            <StatCard icon="📊" label="Average Price" value={`Rs. ${stats.avg.toLocaleString()}`} sub="per month" color="bg-teal-500" />
            <StatCard icon="⬇" label="Lowest Price" value={`Rs. ${stats.min.toLocaleString()}`} sub="cheapest listing" color="bg-blue-500" />
            <StatCard icon="⬆" label="Highest Price" value={`Rs. ${stats.max.toLocaleString()}`} sub="premium listing" color="bg-purple-500" />
          </div>
        )}

        {/* ── Charts grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-72" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* 1. Monthly price trend */}
            <ChartCard
              title="Average Price Trend"
              subtitle="Monthly average rental price over time"
            >
              {monthlyTrend.length < 2 ? (
                <p className="text-xs text-gray-400 text-center py-10">Not enough data yet — more listings needed.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => `Rs.${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="avgPrice"
                      name="Avg Price"
                      stroke="#059669"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#059669" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* 2. Price by room type */}
            <ChartCard
              title="Price by Room Type"
              subtitle="Average monthly rent per category"
            >
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={byRoomType} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(v) => `Rs.${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="avgPrice" name="Avg Price" radius={[6, 6, 0, 0]}>
                    {byRoomType.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* 3. Price by location */}
            <ChartCard
              title="Price by Area"
              subtitle="Average rent across different locations"
            >
              {byLocation.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-10">No location data found.</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={byLocation} layout="vertical" barSize={18}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" tickFormatter={(v) => `Rs.${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
                    <YAxis dataKey="area" type="category" tick={{ fontSize: 10 }} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="avgPrice" name="Avg Price" radius={[0, 6, 6, 0]}>
                      {byLocation.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* 4. Price range distribution */}
            <ChartCard
              title="Price Range Distribution"
              subtitle="How many rooms fall in each price bracket"
            >
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={priceDistribution} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v) => [`${v} rooms`, "Count"]}
                    contentStyle={{ borderRadius: 12, fontSize: 12 }}
                  />
                  <Bar dataKey="count" name="Rooms" radius={[6, 6, 0, 0]}>
                    {priceDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* 5. Room type share pie */}
            <ChartCard
              title="Listing Share by Room Type"
              subtitle="Proportion of each room category in the market"
            >
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
            </ChartCard>

            {/* 6. Top cheapest areas */}
            <ChartCard
              title="Most Affordable Areas"
              subtitle="Areas ranked by lowest average rent"
            >
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
