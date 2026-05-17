import { BrowserRouter, Routes, Route } from "react-router-dom"
import Register from "./components/Register"
import Hero from "./components/Hero"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/home" element={<Hero />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App