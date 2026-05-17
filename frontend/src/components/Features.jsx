function Features() {
  const features = [
    "Find nearby places",
    "Explore hidden gems",
    "Save favorite locations",
  ]

  return (
    <section className="bg-black text-white py-20 px-8">
      <h2 className="text-4xl font-bold text-center mb-12">
        Features
      </h2>

      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-gray-900 p-8 rounded-2xl shadow-lg"
          >
            <h3 className="text-2xl font-semibold">
              {feature}
            </h3>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Features