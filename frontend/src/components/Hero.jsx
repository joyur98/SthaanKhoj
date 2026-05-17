function Hero() {
  return (
    <section className="h-[90vh] flex flex-col justify-center items-center bg-gray-950 text-white text-center px-4">
      <h1 className="text-6xl font-bold mb-6">
        Discover Amazing Places
      </h1>

      <p className="text-xl text-gray-400 max-w-2xl mb-8">
        SthaanKhoj helps you explore restaurants, cafes,
        tourist attractions, and hidden gems around Nepal.
      </p>

      <button className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:scale-105 transition">
        Explore Now
      </button>
    </section>
  )
}

export default Hero