import logo2 from "../assets/logo2.png"
import { Link } from "react-router-dom"

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
        <Link to="/home" className="hover:text-green-700 transition">
          Home
        </Link>
        <Link to="/find-rooms">Find Rooms</Link>
        <Link to="/favorites">Favorites</Link>
        <Link to="/about">About Us</Link>
        <Link to="/contact">Contact</Link>
      </div>

      {/* Right */}
      <button className="bg-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition">
        Post a Room
      </button>
    </nav>
  )
}

export default Navbar