import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from "./pages/Home"
import Register from "./pages/Register"
import AboutUs from "./pages/AboutUs"

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Register />} />

        <Route path="/home" element={<Home />} />

        <Route path="/about" element={<AboutUs />} />

      </Routes>

    </BrowserRouter>
  )
}

export default App