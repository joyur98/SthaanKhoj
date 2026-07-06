import { useEffect, useState, useMemo } from "react"
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList
} from "recharts"
import Navbar from "../components/Navbar"
import { db } from "../firebase"
import { collection, onSnapshot } from "firebase/firestore"

// ── Formatting helpers ───────────────────────────────────────────────────
const indianGroup = (numStr) => {
  const neg = numStr.startsWith("-")
  if (neg) numStr = numStr.slice(1)
  let last3 = numStr.slice(-3)
  let rest = numStr.slice(0, -3)
  if (rest) {
    rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",")
    last3 = "," + last3
  }
  return (neg ? "-" : "") + rest + last3
}

const formatPrice = (v) => `Rs. ${indianGroup(String(Math.round(Number(v) || 0)))}`

const isCompact = (v) => Number(v) >= 1e5
const formatBigRs = (v) => {
  const n = Number(v) || 0
  if (n >= 1e7) return `Rs. ${(n / 1e7).toFixed(n % 1e7 === 0 ? 0 : 2)} Cr`
  if (n >= 1e5) return `Rs. ${(n / 1e5).toFixed(n % 1e5 === 0 ? 0 : 2)} Lakh`
  return formatPrice(n)
}

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

const timeAgo = (iso) => {
  if (!iso) return ""
  const diffMs = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days <= 0) return "Added today"
  if (days === 1) return "Added yesterday"
  return `Added ${days} days ago`
}

const ROOM_TYPE_COLORS = { Flat: "#38bdf8", House: "#a78bfa", Room: "#10b981", Hostel: "#f59e0b" }
const FALLBACK_COLORS = ["#10b981", "#38bdf8", "#a78bfa", "#f59e0b", "#f472b6", "#22d3ee"]
const roomTypeColor = (name, i) => ROOM_TYPE_COLORS[name] || FALLBACK_COLORS[i % FALLBACK_COLORS.length]
const AVAILABILITY_COLORS = ["#10b981", "#334155"]

// ── Icons ─────────────────────────────────────────────────────────────────
const iconProps = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" }
const HomeIcon = () => <svg {...iconProps} className="w-5 h-5"><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" /></svg>
const BarsIcon = () => <svg {...iconProps} className="w-5 h-5"><path d="M4 20V10M12 20V4M20 20v-7" /></svg>
const ArrowDownIcon = () => <svg {...iconProps} className="w-5 h-5"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
const ArrowUpIcon = () => <svg {...iconProps} className="w-5 h-5"><path d="M12 19V5M5 12l7-7 7 7" /></svg>

// ── Skeleton loader ────────────────────────────────────────────────────────
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-white/10 rounded-xl ${className}`} />
}

// ── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="bg-white dark:bg-dark-900/60 rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wide">{label}</p>
        <p className="font-display text-2xl font-extrabold text-gray-900 dark:text-white leading-tight tabular-nums truncate">
          {value}
        </p>
        {sub && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  )
}

// ── Chart Card wrapper ─────────────────────────────────────────────────────
const ACCENT_BAR = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  sky: "bg-sky-500",
  violet: "bg-violet-400",
  indigo: "bg-indigo-400",
  neutral: "bg-gray-300 dark:bg-white/20",
}
function ChartCard({ title, subtitle, accent = "neutral", children }) {
  return (
    <div className="bg-white dark:bg-dark-900/60 rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-1 h-4 rounded-full ${ACCENT_BAR[accent]}`} />
          <h3 className="font-display text-sm font-bold text-gray-900 dark:text-white tracking-tight">{title}</h3>
        </div>
        {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 ml-3">{subtitle}</p>}
      </div>
      {children}
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

// ── Shared ranked-area list ─────────────────────────────────────────────
function RankedAreaList({ data, direction = "desc", highlightLabel, accent = "emerald" }) {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (data.length && !revealed) {
      const t = setTimeout(() => setRevealed(true), 60)
      return () => clearTimeout(t)
    }
  }, [data, revealed])

  if (!data.length) {
    return <p className="text-xs text-gray-400 text-center py-10">No location data found.</p>
  }

  const sorted = [...data].sort((a, b) =>
    direction === "desc" ? b.avgPrice - a.avgPrice : a.avgPrice - b.avgPrice
  )
  const scaleMax = Math.max(...sorted.map((d) => d.avgPrice))
  const lo = Math.min(...sorted.map((d) => d.avgPrice))
  const hi = Math.max(...sorted.map((d) => d.avgPrice))

  const topGradient = accent === "amber"
    ? "linear-gradient(90deg, #f59e0b, #ea580c)"
    : "linear-gradient(90deg, #0d9488, #10b981)"
  const glow = accent === "amber" ? "rgba(234,88,12,0.35)" : "rgba(16,185,129,0.25)"
  const tagClasses = accent === "amber"
    ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10"
    : "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
  const rankClasses = accent === "amber" ? "text-amber-500" : "text-emerald-500"

  return (
    <div className="pt-1">
      <div className="space-y-4">
        {sorted.map((loc, i) => {
          const raw = scaleMax ? (loc.avgPrice / scaleMax) * 100 : 0
          const pct = Math.max(raw, 4)
          const isTop = i === 0
          return (
            <div key={loc.area} className="group">
              <div className="flex items-baseline justify-between mb-1.5 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`text-[10px] font-black tabular-nums shrink-0 ${isTop ? rankClasses : "text-gray-300 dark:text-gray-600"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate capitalize">
                    {loc.area}
                  </span>
                  {isTop && highlightLabel && (
                    <span className={`shrink-0 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${tagClasses}`}>
                      {highlightLabel}
                    </span>
                  )}
                </div>
                <span className="text-xs font-black text-gray-900 dark:text-white tabular-nums shrink-0">
                  {formatPrice(loc.avgPrice)}
                </span>
              </div>

              <div className="relative h-2.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{
                    width: revealed ? `${pct}%` : "0%",
                    transitionDelay: `${i * 70}ms`,
                    background: isTop ? topGradient : "linear-gradient(90deg, #0d9488, #059669)",
                    boxShadow: isTop ? `0 0 10px ${glow}` : "none",
                    opacity: isTop ? 1 : 0.85,
                  }}
                />
              </div>

              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                {loc.count} listing{loc.count !== 1 ? "s" : ""}
              </p>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50 dark:border-white/5 text-[10px] text-gray-400">
        <span>{formatPrice(lo)} lowest avg.</span>
        <span>{formatPrice(hi)} highest avg.</span>
      </div>
    </div>
  )
}

// ── Donut with a real center readout ─────────────────────────────────────
function DonutStat({ data, colorFor, centerValue, centerLabel, emptyMessage }) {
  if (!data.length) {
    return <p className="text-xs text-gray-400 text-center py-10">{emptyMessage}</p>
  }
  return (
    <div>
      <div className="relative" style={{ height: 190 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={88} paddingAngle={3} dataKey="value" stroke="none">
              {data.map((d, i) => (
                <Cell key={d.name} fill={colorFor(d.name, i)} />
              ))}
            </Pie>
            <Tooltip formatter={(v, n) => [`${v} listing${v !== 1 ? "s" : ""}`, n]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-display text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums">
            {centerValue}
          </span>
          <span className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">{centerLabel}</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: colorFor(d.name, i) }} />
            <span className="font-semibold text-gray-700 dark:text-gray-200">{d.name}</span>
            <span className="text-gray-400">· {d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Rental Price Distribution (histogram) ────────────────────────────────
// Buckets are built purely from `properties.price` already in memory — no
// new data source. The first four buckets are fixed at the everyday
// student-budget breakpoints; anything above Rs. 20K only gets split into
// extra buckets when the spread is large enough that a single "20K+" bucket
// would hide the shape of the high end (e.g. one outlier at Rs. 30 lakh).
const fmtBucketK = (v) => (v % 1000 === 0 ? `${v / 1000}K` : `${(v / 1000).toFixed(1)}K`)

const niceNumber = (x) => {
  const exponent = Math.floor(Math.log10(x))
  const fraction = x / Math.pow(10, exponent)
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10
  return niceFraction * Math.pow(10, exponent)
}

function buildPriceHistogram(properties) {
  const prices = properties
    .map((p) => p.price)
    .filter((v) => typeof v === "number" && v > 0)

  if (!prices.length) return { buckets: [], total: 0 }

  const fixedEdges = [0, 5000, 10000, 15000, 20000]
  const max = Math.max(...prices)

  let topEdges = [Infinity]
  if (max > 20000) {
    const ratio = max / 20000
    if (ratio > 3) {
      const extraBuckets = ratio > 20 ? 3 : 2
      const rawStep = (max - 20000) / extraBuckets
      const step = niceNumber(rawStep)
      const generated = []
      let edge = 20000
      for (let i = 0; i < extraBuckets; i++) {
        edge += step
        generated.push(edge)
      }
      generated[generated.length - 1] = Infinity // final bucket always stays open-ended
      topEdges = generated
    }
  }

  const edges = [...fixedEdges, ...topEdges]

  const buckets = edges.slice(0, -1).map((lo, i) => {
    const hi = edges[i + 1]
    const count = prices.filter((p) => (hi === Infinity ? p >= lo : p >= lo && p < hi)).length
    const label = hi === Infinity ? `Rs. ${fmtBucketK(lo)}+` : `Rs. ${fmtBucketK(lo)}–${fmtBucketK(hi)}`
    return { label, lo, hi, count }
  })

  return { buckets, total: prices.length }
}

// Concise, data-derived insight sentence — no hardcoded copy.
function buildDistributionInsight(buckets, total) {
  if (!total || !buckets.length) return ""

  const dominant = buckets.reduce((a, b) => (b.count > a.count ? b : a), buckets[0])
  const dominantPct = Math.round((dominant.count / total) * 100)

  const below10k = buckets.filter((b) => b.hi <= 10000).reduce((s, b) => s + b.count, 0)
  const below10kPct = Math.round((below10k / total) * 100)

  const above20k = buckets.filter((b) => b.lo >= 20000).reduce((s, b) => s + b.count, 0)
  const above20kPct = Math.round((above20k / total) * 100)

  if (dominantPct >= 40) {
    return `Most rooms (${dominantPct}%) are priced between ${dominant.label.replace("Rs. ", "")}.`
  }
  if (below10kPct > 50) {
    return `Over half of all rooms (${below10kPct}%) cost less than Rs. 10K.`
  }
  if (above20k > 0 && above20kPct <= 15) {
    return `Only ${above20kPct}% of listings exceed Rs. 20K.`
  }
  if (above20k === 0) {
    return "No listings currently exceed Rs. 20K — rents stay within a tight, student-friendly range."
  }
  return "Rental prices are fairly spread out, with no single range dominating."
}

// Rounded-top bar with a minimum visible height so a bucket with just 1-2
// listings doesn't disappear next to a bucket with 10.
function RoundedTopBar(props) {
  const { x, y, width, height, fill } = props
  const radius = Math.min(8, width / 2)
  const minHeight = height > 0 ? Math.max(height, 4) : 0
  const top = y + height - minHeight
  if (minHeight <= 0) return null
  return (
    <path
      d={`
        M${x},${top + radius}
        Q${x},${top} ${x + radius},${top}
        L${x + width - radius},${top}
        Q${x + width},${top} ${x + width},${top + radius}
        L${x + width},${top + minHeight}
        L${x},${top + minHeight}
        Z
      `}
      fill={fill}
    />
  )
}

function HistogramTooltip({ active, payload, total }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const pct = total ? Math.round((d.count / total) * 100) : 0
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-3 shadow-xl text-xs">
      <p className="font-bold text-gray-700 dark:text-gray-200 mb-1.5">{d.label}</p>
      <p className="text-gray-500 dark:text-gray-400">
        <span className="font-semibold text-gray-700 dark:text-gray-200">{d.count}</span> listing{d.count !== 1 ? "s" : ""}
      </p>
      <p className="text-gray-500 dark:text-gray-400">
        <span className="font-semibold text-gray-700 dark:text-gray-200">{pct}%</span> of total
      </p>
    </div>
  )
}

function PriceDistributionCard({ properties }) {
  const { buckets, total } = useMemo(() => buildPriceHistogram(properties), [properties])
  const insight = useMemo(() => buildDistributionInsight(buckets, total), [buckets, total])

  return (
    <ChartCard
      title="Rental Price Distribution"
      subtitle="See where most rental prices fall."
      accent="indigo"
    >
      {total === 0 ? (
        <p className="text-xs text-gray-400 text-center py-10">No listings with price data yet.</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={buckets} margin={{ top: 24, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="histogramBarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#0d9488" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b830" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<HistogramTooltip total={total} />} cursor={{ fill: "#94a3b815" }} />
              <Bar dataKey="count" fill="url(#histogramBarGradient)" shape={<RoundedTopBar />}>
                <LabelList
                  dataKey="count"
                  position="top"
                  style={{ fontSize: 11, fontWeight: 700 }}
                  fill="#94a3b8"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {insight && (
            <div className="mt-4 pt-3 border-t border-gray-50 dark:border-white/5 flex items-start gap-2">
              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{insight}</p>
            </div>
          )}
        </>
      )}
    </ChartCard>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function PriceAnalytics() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

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
      .map(([area, { total, count }]) => ({ area, avgPrice: Math.round(total / count), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [properties])

  const roomTypePie = useMemo(() => {
    const map = {}
    properties.forEach((p) => {
      if (!p.roomType) return
      const key = capitalize(p.roomType)
      map[key] = (map[key] || 0) + 1
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [properties])

  const availabilityData = useMemo(() => {
    if (!properties.length) return []
    const available = properties.filter((p) => p.isAvailable).length
    const occupied = properties.length - available
    return [
      { name: "Available", value: available },
      { name: "Occupied", value: occupied },
    ]
  }, [properties])

  const recentListings = useMemo(() => {
    return [...properties]
      .filter((p) => p.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)
  }, [properties])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&display=swap');
        .font-display { font-family: 'Sora', ui-sans-serif, system-ui, sans-serif; }
      `}</style>

      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-10 pb-28">

        {/* Page header */}
        <div className="mb-8 flex items-end justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-6 rounded-full bg-emerald-500" />
              <h1 className="font-display text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Rental Analytics
              </h1>
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
            <StatCard
              icon={<HomeIcon />}
              label="Total Listings"
              value={stats.total}
              sub={`${stats.available} available now`}
              color="bg-sky-500"
            />
            <StatCard
              icon={<BarsIcon />}
              label="Average Rent"
              value={formatBigRs(stats.avg)}
              sub={isCompact(stats.avg) ? `${formatPrice(stats.avg)} / mo` : "per month"}
              color="bg-emerald-500"
            />
            <StatCard
              icon={<ArrowDownIcon />}
              label="Lowest Rent"
              value={formatBigRs(stats.min)}
              sub={isCompact(stats.min) ? formatPrice(stats.min) : "cheapest listing"}
              color="bg-teal-500"
            />
            <StatCard
              icon={<ArrowUpIcon />}
              label="Highest Rent"
              value={formatBigRs(stats.max)}
              sub={isCompact(stats.max) ? formatPrice(stats.max) : "priciest listing"}
              color="bg-amber-500"
            />
          </div>
        )}

        {/* ── Rental Price Distribution — placed right after KPIs, before trend charts ── */}
        {loading ? (
          <div className="mb-6">
            <Skeleton className="h-80" />
          </div>
        ) : (
          <div className="mb-6">
            <PriceDistributionCard properties={properties} />
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

            <ChartCard
              title="Average Rent by Area"
              subtitle="Comparing localities around KU, ranked highest to lowest"
              accent="amber"
            >
              <RankedAreaList data={byLocation} direction="desc" highlightLabel="Priciest" accent="amber" />
            </ChartCard>

            <ChartCard
              title="Room Type Share"
              subtitle="Proportion of each listing type"
              accent="sky"
            >
              <DonutStat
                data={roomTypePie}
                colorFor={roomTypeColor}
                centerValue={stats.total}
                centerLabel="Total listings"
                emptyMessage="No room type data found."
              />
            </ChartCard>

            <ChartCard
              title="Room Availability"
              subtitle="Available vs. currently occupied"
              accent="emerald"
            >
              <DonutStat
                data={availabilityData}
                colorFor={(name, i) => AVAILABILITY_COLORS[i % AVAILABILITY_COLORS.length]}
                centerValue={`${Math.round((stats.available / stats.total) * 100)}%`}
                centerLabel="Available"
                emptyMessage="No availability data found."
              />
            </ChartCard>

            <ChartCard
              title="Most Affordable Areas"
              subtitle="Areas ranked by lowest average rent"
              accent="emerald"
            >
              <RankedAreaList data={byLocation} direction="asc" highlightLabel="Cheapest" accent="emerald" />
            </ChartCard>

          </div>
        )}

        {/* ── Recently Added Listings ── */}
        {!loading && stats && (
          <div className="grid grid-cols-1 gap-6 mt-6">
            <ChartCard
              title="Recently Added Listings"
              subtitle="Newest rooms posted on SthaanKhoj"
              accent="violet"
            >
              {recentListings.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-10">No listings yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  {recentListings.map((p) => {
                    const type = p.roomType ? capitalize(p.roomType) : "Room"
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between border-b border-gray-50 dark:border-white/5 py-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: roomTypeColor(type, 0) }}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-700 dark:text-gray-200 truncate">
                              {type}
                              {p.location && (
                                <span className="text-gray-400 font-normal">
                                  {" "}in {capitalize(p.location.split(",")[0].trim())}
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(p.createdAt)}</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-gray-900 dark:text-white tabular-nums shrink-0 ml-3">
                          {p.price ? formatPrice(p.price) : "—"}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </ChartCard>
          </div>
        )}

        <p className="text-center text-xs text-gray-300 dark:text-gray-600 mt-10">
          Data sourced from live SthaanKhoj listings · Updates in real-time
        </p>

      </div>
    </div>
  )
}