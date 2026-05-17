import { Link } from "react-router-dom"

function AboutUs() {
  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#07122b]">

      {/* Header */}
      <header className="px-16 py-8 flex justify-between items-center">

        <Link
          to="/home"
          className="text-green-700 font-semibold hover:underline"
        >
          ← Back to Home
        </Link>

        <h1 className="text-5xl font-bold">
          About Us
        </h1>

      </header>

      {/* Main Content */}
      <main className="px-16 py-10 space-y-16">

        {/* Mission */}
        <section className="bg-white p-10 rounded-3xl shadow-md">
          <h2 className="text-3xl font-bold mb-4 text-green-700">
            Our Mission
          </h2>

          <p className="text-lg leading-relaxed text-gray-600">
            SthaanKhoj is dedicated to helping students find safe,
            affordable, and comfortable rooms near Kathmandu University.
            We aim to simplify room discovery through verified listings,
            maps, and smart search tools.
          </p>
        </section>

        {/* Vision */}
        <section className="bg-white p-10 rounded-3xl shadow-md">
          <h2 className="text-3xl font-bold mb-4 text-green-700">
            Our Vision
          </h2>

          <p className="text-lg leading-relaxed text-gray-600">
            We envision a platform where students and landlords connect
            seamlessly through trusted listings, real-time communication,
            and transparent booking systems.
          </p>
        </section>

        {/* Values */}
        <section className="bg-white p-10 rounded-3xl shadow-md">
          <h2 className="text-3xl font-bold mb-6 text-green-700">
            Our Values
          </h2>

          <ul className="space-y-4 text-lg text-gray-600">

            <li>
              <strong>Trust:</strong> Verified and authentic listings
            </li>

            <li>
              <strong>Accessibility:</strong> Easy room discovery for students
            </li>

            <li>
              <strong>Community:</strong> Connecting landlords and students
            </li>

            <li>
              <strong>Convenience:</strong> Smart search and booking experience
            </li>

          </ul>
        </section>

        {/* Team */}
        <section className="bg-white p-10 rounded-3xl shadow-md">
          <h2 className="text-3xl font-bold mb-4 text-green-700">
            Our Team
          </h2>

          <p className="text-lg leading-relaxed text-gray-600">
            SthaanKhoj is built by passionate developers and students
            focused on solving the real challenges students face while
            searching for accommodation.
          </p>
        </section>

        {/* Contact */}
        <section className="bg-white p-10 rounded-3xl shadow-md">
          <h2 className="text-3xl font-bold mb-4 text-green-700">
            Get In Touch
          </h2>

          <p className="text-lg text-gray-600 mb-4">
            Have questions or suggestions? We'd love to hear from you.
          </p>

          <p className="text-lg">
            Email:
            <a
              href="mailto:info@sthaankhoj.com"
              className="text-green-700 ml-2 hover:underline"
            >
              info@sthaankhoj.com
            </a>
          </p>
        </section>

      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500">
        © 2026 SthaanKhoj. All rights reserved.
      </footer>

    </div>
  )
}

export default AboutUs