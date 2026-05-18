import Navbar from "../components/Navbar"
import Hero from "../components/Hero"
import Features from "../components/Features"

function Home({ darkMode, toggleDarkMode }) {
  return (
    <div className={darkMode ? "dark" : ""}>
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <Hero />
      <Features />
    </div>
  )
}

export default Home