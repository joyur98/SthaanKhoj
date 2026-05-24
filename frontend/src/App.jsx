import { useState, useEffect } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./firebase"

import Home from "./pages/Home"
import Register from "./pages/Register"
import Login from "./pages/Login"
import AboutUs from "./pages/AboutUs"
import FindRooms from "./pages/FindRooms"
import Contact from "./pages/Contact" 

function ProtectedRoute({ user, children }) {
  if (user === undefined) return null // still loading, render nothing
  if (!user) return <Navigate to="/" replace />
  return children
}

function App() {
  const [user, setUser] = useState(undefined) // undefined = auth still loading

  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) return savedTheme === "dark"
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  // Listen to Firebase auth state — handles logout automatically
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser) // null when signed out, object when signed in
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (darkMode) {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }, [darkMode])

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
        {/* Public routes */}
        <Route
          path="/"
          element={<Register darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
        />
        <Route
          path="/login"
          element={<Login darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
        />

        {/* Protected routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute user={user}>
              <Home darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/find-rooms"
          element={
            <ProtectedRoute user={user}>
              <FindRooms darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute user={user}>
              <AboutUs darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <ProtectedRoute user={user}>
              <Contact darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
