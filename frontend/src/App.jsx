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
import Favorites from "./pages/Favorites"
import PostRoom from "./pages/PostRoom"
import RoomDetail from "./pages/RoomDetail"
import Messages from "./pages/Messages"
import Chat from "./pages/Chat"
import AIChatbot from "./components/AIChatbot"
import StudentProfile from "./pages/StudentProfile"
import LandlordProfile from "./pages/LandlordProfile"
import PriceAnalytics from "./pages/PriceAnalytics"

function ProtectedRoute({ user, children }) {
  if (user === undefined) return null
  if (!user) return <Navigate to="/" replace />
  return children
}

function App() {
  const [user, setUser] = useState(undefined)

  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) return savedTheme === "dark"
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
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
        <Route path="/" element={<Register darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
        <Route path="/login" element={<Login darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />

        <Route path="/home" element={<ProtectedRoute user={user}><Home darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>} />
        <Route path="/find-rooms" element={<ProtectedRoute user={user}><FindRooms darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>} />
        <Route path="/rooms/:id" element={<ProtectedRoute user={user}><RoomDetail darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute user={user}><Messages darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>} />
        <Route path="/chat/:chatId" element={<ProtectedRoute user={user}><Chat darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>} />
        <Route path="/about" element={<ProtectedRoute user={user}><AboutUs darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>} />
        <Route path="/contact" element={<ProtectedRoute user={user}><Contact darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute user={user}><Favorites darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>} />
        <Route path="/post-room" element={<ProtectedRoute user={user}><PostRoom darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>} />
        <Route path="/profile/student" element={<ProtectedRoute user={user}><StudentProfile darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>} />
        <Route path="/profile/landlord" element={<ProtectedRoute user={user}><LandlordProfile darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute user={user}><PriceAnalytics darkMode={darkMode} toggleDarkMode={toggleDarkMode} /></ProtectedRoute>} />
      </Routes>

      {user && <AIChatbot darkMode={darkMode} />}
    </BrowserRouter>
  )
}

export default App