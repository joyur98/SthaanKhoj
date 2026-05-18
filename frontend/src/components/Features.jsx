function Features() {
  const listFeatures = [
    {
      title: "Smart Filtered Search",
      desc: "Instantly drill down your search by precise distance to KU main gates, room setup, amenities, and exact rent budgets.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="w-6 h-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z"
          />
        </svg>
      ),
      accent: "from-primary-500 to-emerald-400",
      bgLight: "bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400",
    },
    {
      title: "100% Vetted Listings",
      desc: "Say goodbye to fake ads. Every listing is verified by student volunteers and includes actual real photographs and pricing structure.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="w-6 h-6 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-1"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
          />
        </svg>
      ),
      accent: "from-teal-500 to-cyan-400",
      bgLight: "bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400",
    },
    {
      title: "Direct Landlord Chat",
      desc: "Skip unnecessary broker fees. Reach out directly to the landlord via instant secure calling or verified chat pipelines.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="w-6 h-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
          />
        </svg>
      ),
      accent: "from-indigo-500 to-primary-400",
      bgLight: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400",
    },
    {
      title: "Save Favorite Rooms",
      desc: "Create and build your personal shortlist as you browse. Easily compare price, distance, and reviews side-by-side.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="w-6 h-6 transition-transform duration-500 group-hover:scale-110 group-hover:fill-rose-500 group-hover:stroke-rose-500"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      ),
      accent: "from-rose-500 to-pink-400",
      bgLight: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
    },
  ]

  return (
    <section className="bg-[#fafbfc] dark:bg-[#0b1528] py-20 md:py-28 relative transition-colors duration-300">
      
      {/* Dynamic Grid Background Accent */}
      <div className="absolute top-[30%] left-[20%] w-[450px] h-[450px] bg-primary-100/10 dark:bg-primary-500/5 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* Component Header Block */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 rounded-full border border-emerald-100/40 dark:border-emerald-900/30">
            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
              Engineered For Comfort
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Everything you need for smart lodging
          </h2>
          <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
            No endless wandering around Dhulikhel knocking on doors. Explore vetted KU student lodgings from the comfort of your screen.
          </p>
        </div>

        {/* Feature Interactive Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {listFeatures.map((f, idx) => (
            <div
              key={idx}
              className="group relative bg-white dark:bg-dark-900/50 border border-gray-100/70 dark:border-white/5 p-8 md:p-10 rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.015)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(7,18,43,0.04)] dark:hover:shadow-[0_20px_50px_rgba(16,185,129,0.04)] hover:-translate-y-1.5 transition-all duration-500 text-left"
            >
              {/* Dynamic top hover glowing accent line */}
              <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-[32px]`}></div>
              
              <div className="flex flex-col sm:flex-row items-start gap-6">
                
                {/* SVG Icon Container */}
                <div className={`w-14 h-14 rounded-2xl ${f.bgLight} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-[0_4px_12px_rgba(0,0,0,0.01)]`}>
                  {f.icon}
                </div>

                {/* Card Content details */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {f.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
                    {f.desc}
                  </p>
                </div>

              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features