import heroImg from "../assets/hero.png"

function Hero() {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:py-24 mesh-gradient-light dark:mesh-gradient">
      {/* Decorative ambient glowing blur circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] md:w-[500px] h-[350px] md:h-[500px] bg-primary-200/20 dark:bg-primary-500/10 rounded-full blur-[80px] md:blur-[120px] -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-[10%] right-[-10%] w-[300px] md:w-[450px] h-[300px] md:h-[450px] bg-teal-200/20 dark:bg-teal-500/10 rounded-full blur-[80px] md:blur-[120px] -z-10 animate-pulse-slow" style={{ animationDelay: "2s" }}></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-8">
          
          {/* Left Side: Copy and Search Widget */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 dark:bg-primary-950/30 rounded-full border border-primary-100/50 dark:border-primary-900/30">
              <span className="flex h-2 w-2 rounded-full bg-primary-600 dark:bg-primary-400 animate-ping"></span>
              <span className="text-xs font-bold text-primary-800 dark:text-primary-400 tracking-wide uppercase">
                Now serving Dhulikhel & KU area
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-gray-900 dark:text-white">
                Find your <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-primary-500 to-teal-400 bg-clip-text text-transparent">
                  perfect room
                </span> <br />
                near KU campus.
              </h1>
              
              <p className="text-lg md:text-xl text-gray-500 dark:text-gray-300 max-w-xl font-normal leading-relaxed">
                Safe, verified, and budget-friendly student accommodations in Dhulikhel—specifically vetted for Kathmandu University students.
              </p>
            </div>



            {/* Quick trust metrics */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 pt-2 text-left">
              <div className="flex items-center gap-2">
                <span className="text-primary-600 dark:text-primary-400 font-bold text-lg">✓</span>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Zero Commission</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary-600 dark:text-primary-400 font-bold text-lg">✓</span>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">KU Alumni Vetted</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-primary-600 dark:text-primary-400 font-bold text-lg">✓</span>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Direct Landlord Chat</span>
              </div>
            </div>
          </div>

          {/* Right Side: Showcase Illustration Image */}
          <div className="lg:col-span-5 relative w-full flex justify-center items-center">
            {/* Absolute decorative back panel */}
            <div className="absolute w-[95%] h-[95%] bg-gradient-to-tr from-primary-500 to-teal-400 rounded-[50px] rotate-3 opacity-10 blur-sm -z-10"></div>
            
            {/* Main Image Container */}
            <div className="relative rounded-[45px] overflow-hidden border-4 border-white dark:border-dark-900 shadow-[0_24px_50px_rgba(7,18,43,0.12)] dark:shadow-[0_24px_50px_rgba(0,0,0,0.4)] bg-white dark:bg-dark-900 transition-all duration-500 hover:scale-[1.02]">
              <img
                src={heroImg}
                alt="Beautiful Student Accommodation"
                className="w-full h-auto max-h-[480px] object-cover"
              />
            </div>

            {/* Floating Visual Badges */}
            <div className="absolute top-[10%] left-[-5%] glass-card dark:glass-card-dark p-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/80 dark:border-white/10 animate-float flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-950/40 rounded-xl text-primary-700 dark:text-primary-400 text-lg">🎓</div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">For KU Students</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-semibold leading-none">Dhulikhel Special</p>
              </div>
            </div>

            <div className="absolute bottom-[8%] right-[-3%] glass-card dark:glass-card-dark p-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/80 dark:border-white/10 animate-float flex items-center gap-3" style={{ animationDelay: "3s" }}>
              <div className="p-2 bg-amber-100 dark:bg-amber-950/40 rounded-xl text-amber-500 text-lg">★</div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-900 dark:text-white leading-none">4.9 Average Rating</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-semibold leading-none">Vetted by 500+ students</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  )
}

export default Hero