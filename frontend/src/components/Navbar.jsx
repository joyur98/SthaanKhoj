import logo2 from "../assets/logo2.png"

function Navbar() {
  return (
    <nav className="flex justify-between items-center px-16 py-6">

      {/* Left */}
      <div className="flex items-center gap-3">
        <img
          src={logo2}
          alt="logo"
          style={{ width: "40px", height: "40px" }}
        />

        <h1 className="text-3xl font-bold">
          <span className="text-[#07122b]">Sthaan</span>
          <span className="text-green-700">Khoj</span>
        </h1>
      </div>

      {/* Center */}
      <div className="flex gap-10 font-medium text-[#07122b]">
        <a href="#" className="text-green-700 border-b-2 border-green-700 pb-1">
          Home
        </a>

        <a href="#">Find Rooms</a>
        <a href="#">Favorites</a>
        <a href="#">About Us</a>
        <a href="#">Contact</a>
      </div>

      {/* Right */}
      <button className="bg-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition">
        Post a Room
      </button>
    </nav>
  )
}

export default Navbar