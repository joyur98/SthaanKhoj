function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-5 bg-black text-white">
      <h1 className="text-2xl font-bold">SthaanKhoj</h1>

      <div className="flex gap-6">
        <a href="#" className="hover:text-gray-400">Home</a>
        <a href="#" className="hover:text-gray-400">Explore</a>
        <a href="#" className="hover:text-gray-400">About</a>
      </div>
    </nav>
  )
}

export default Navbar