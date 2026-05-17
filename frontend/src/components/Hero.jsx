import heroImg from "../assets/hero.png"

function Hero() {
  return (
    <section className="px-16 py-10">

      <div className="grid grid-cols-2 items-center gap-12">

        {/* Left Side */}
        <div>

          <h1 className="text-8xl font-bold leading-tight">
            <span className="text-[#07122b]">Sthaan</span>
            <span className="text-green-700">Khoj</span>
          </h1>

          <h2 className="text-5xl font-bold text-[#07122b] mt-4">
            Student Room Finder
          </h2>

          <p className="text-2xl text-gray-500 mt-8 leading-relaxed">
            Find safe, affordable and comfortable rooms
            near your university.
          </p>

          {/* Search Box */}
          <div className="bg-white shadow-xl rounded-3xl p-6 mt-12 flex items-center gap-8">

            <div>
              <p className="font-semibold">Location</p>
              <p className="text-gray-400">Enter location</p>
            </div>

            <div>
              <p className="font-semibold">Room Type</p>
              <p className="text-gray-400">Any</p>
            </div>

            <div>
              <p className="font-semibold">Budget</p>
              <p className="text-gray-400">Any Budget</p>
            </div>

            <button className="bg-green-700 text-white px-8 py-4 rounded-2xl font-semibold">
              Search
            </button>

          </div>
        </div>

        {/* Right Side */}
        <div>
          <img
            src={heroImg}
            alt="room"
            className="rounded-[60px] shadow-2xl"
          />
        </div>

      </div>
    </section>
  )
}

export default Hero