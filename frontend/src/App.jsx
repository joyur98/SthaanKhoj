import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import Features from "./components/Features"

function App() {
  return (
    <div className="bg-[#f8f7f4] min-h-screen">
      <Navbar />
      <Hero />
      <Features />
    </div>
  )
}

export default App