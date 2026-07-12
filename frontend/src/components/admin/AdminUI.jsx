function StatCard({ label, value, sub, color = "bg-[#06D6A0]" }) {
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-5 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white text-lg mb-3`}>
        {value}
      </div>
      <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">{label}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export function PageHeader({ title, description }) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[#06D6A0]/10 to-transparent dark:from-[#06D6A0]/5 p-4 rounded-xl -mx-4 px-4">
      <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">{title}</h1>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      )}
    </div>
  )
}

export function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="relative">
        <div className="w-10 h-10 border-4 border-[#06D6A0]/20 rounded-full"></div>
        <div className="absolute top-0 left-0 w-10 h-10 border-4 border-[#06D6A0] border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  )
}

export function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <div className="mb-6 px-4 py-3 bg-red-50 dark:bg-red-950/30 border-l-4 border-red-500 border border-red-200 dark:border-red-800/40 rounded-xl text-red-600 dark:text-red-400 text-sm font-semibold animate-slideDown">
      {message}
    </div>
  )
}

export function SuccessBanner({ message }) {
  if (!message) return null
  return (
    <div className="mb-6 px-4 py-3 bg-green-50 dark:bg-green-950/30 border-l-4 border-green-500 border border-green-200 dark:border-green-800/40 rounded-xl text-green-700 dark:text-green-400 text-sm font-semibold animate-slideDown">
      {message}
    </div>
  )
}

export function DataTable({ columns, rows, emptyMessage = "No data found." }) {
  if (!rows.length) {
    return (
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-white/5 p-12 text-center text-gray-400 text-sm">
        <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">📋</span>
        </div>
        <p className="font-medium text-gray-600 dark:text-gray-300">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.id || i}
                className="border-b border-gray-50 dark:border-white/5 last:border-0 hover:bg-gray-50/50 dark:hover:bg-white/5 hover:shadow-sm transition-all duration-200"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function Badge({ children, variant = "default" }) {
  const styles = {
    default: "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300",
    success: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    warning: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold uppercase text-[10px] tracking-wider",
    danger: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold uppercase text-[10px] tracking-wider",
    info: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    admin: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  }
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ${styles[variant] || styles.default}`}>
      {children}
    </span>
  )
}

export function ActionButton({ children, onClick, variant = "default", disabled }) {
  const styles = {
    default: "bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20",
    primary: "bg-[#06D6A0] text-white hover:bg-[#05c490]",
    danger: "bg-red-500 text-white hover:bg-red-600",
    warning: "bg-amber-500 text-white hover:bg-amber-600",
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 hover:opacity-80 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]}`}
    >
      {children}
    </button>
  )
}

export function formatDate(iso) {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-NP", {
    day: "numeric", month: "short", year: "numeric",
  })
}

export default StatCard