import { useParams } from "react-router-dom"
import Navbar from "../components/Navbar"
import ChatPanel from "../components/ChatPanel"

function Chat({ darkMode, toggleDarkMode }) {
  const { chatId } = useParams()

  return (
    <div className={`${darkMode ? "dark" : ""} flex flex-col h-screen overflow-hidden`}>
      <div className="shrink-0">
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatPanel chatId={chatId} hideBackButton={false} />
      </div>
    </div>
  )
}

export default Chat
