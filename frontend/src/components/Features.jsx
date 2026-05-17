function Features() {

  const features = [
    {
      title: "Easy Search",
      desc: "Find rooms near your campus in just a few clicks."
    },
    {
      title: "Verified Listings",
      desc: "All listings are verified for your safety."
    },
    {
      title: "Affordable Options",
      desc: "Rooms that fit your budget and comfort."
    },
    {
      title: "Save Favorites",
      desc: "Save rooms and contact later anytime."
    }
  ]

  return (
    <section className="px-16 py-20">

      <h2 className="text-5xl font-bold text-center text-[#07122b] mb-16">
        Why Students Choose SthaanKhoj?
      </h2>

      <div className="grid grid-cols-4 gap-8">

        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-3xl p-8 shadow-md hover:shadow-xl transition"
          >
            <h3 className="text-2xl font-bold text-[#07122b] mb-4">
              {feature.title}
            </h3>

            <p className="text-gray-500 leading-relaxed">
              {feature.desc}
            </p>
          </div>
        ))}

      </div>

    </section>
  )
}

export default Features