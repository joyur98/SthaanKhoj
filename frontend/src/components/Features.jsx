import { Search, Eye, Calendar } from "lucide-react"

function Features() {
  const features = [
    {
      title: "Smart Search",
      desc: "Filter by price, location, and amenities instantly.",
      icon: <Search className="w-6 h-6 text-[#06D6A0]" />
    },
    {
      title: "Virtual Tours",
      desc: "Explore rooms from home before you visit.",
      icon: <Eye className="w-6 h-6 text-[#06D6A0]" />
    },
    {
      title: "Instant Booking",
      desc: "Secure your room with a few clicks.",
      icon: <Calendar className="w-6 h-6 text-[#06D6A0]" />
    },
  ]

  return (
    <section className="bg-[#FBF7F0] dark:bg-[#111827] py-20 md:py-28 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 md:px-12">

        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-14 md:mb-16">
          <span className="sk-badge-teal">Engineered for Comfort</span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-4">
            Everything you need for{" "}
            <span className="text-[#06D6A0]">smart living</span>
          </h2>
          <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
            No endless wandering around Dhulikhel. Explore vetted KU student lodgings from the comfort of your screen.
          </p>
        </div>

        {/* 3-column feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="group bg-white dark:bg-gray-800 rounded-[18px] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.07)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.10)] dark:hover:shadow-[0_16px_48px_rgba(0,0,0,0.35)] hover:-translate-y-1.5 transition-all duration-400 text-left flex flex-col justify-center"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight flex items-center gap-2">
                <span className="flex items-center justify-center p-2 bg-[#06D6A0]/10 rounded-lg">{f.icon}</span> {f.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-normal">
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-14">
          <a
            href="/find-rooms"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold text-white bg-[#06D6A0] hover:bg-[#05c490] shadow-[0_6px_20px_rgba(6,214,160,0.30)] hover:shadow-[0_8px_28px_rgba(6,214,160,0.40)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            Explore All Rooms
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>

      </div>
    </section>
  )
}

export default Features