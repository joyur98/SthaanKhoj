import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Register from "./pages/Register"
import AboutUs from "./pages/AboutUs"

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      return savedTheme === "dark"
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [darkMode])

  // Sync theme changes from the Laptop/OS settings automatically
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = (e) => {
      if (!localStorage.getItem("theme")) {
        setDarkMode(e.matches)
      }
    }
    
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const nextValue = !prev
      localStorage.setItem("theme", nextValue ? "dark" : "light")
      return nextValue
    })
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Register darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          }
        />
        <Route
          path="/home"
          element={
            <Home darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          }
        />
        <Route
          path="/about"
          element={
            <AboutUs darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App