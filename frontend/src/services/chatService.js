import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  increment,
} from "firebase/firestore"
import { db } from "../firebase"

export const getChatId = (studentId, propertyId) => {
  return `${studentId}_${propertyId}`
}

export const getOrCreateChat = async (studentId, landlordId, propertyId, propertyTitle) => {
  if (!studentId || !landlordId || !propertyId) {
    throw new Error("Missing studentId, landlordId, or propertyId")
  }

  const chatId = getChatId(studentId, propertyId)
  const chatRef = doc(db, "chats", chatId)
  const chatSnap = await getDoc(chatRef)

  if (!chatSnap.exists()) {
    await setDoc(chatRef, {
      chatId,
      studentId,
      landlordId,
      propertyId,
      propertyTitle: propertyTitle || "Room",
      participants: [studentId, landlordId],
      lastMessage: "",
      lastMessageTime: serverTimestamp(),
      lastSenderId: "",
      unreadStudent: 0,
      unreadLandlord: 0,
      typingStudent: false,
      typingLandlord: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }

  return chatId
}

export const sendMessage = async (chatId, senderId, text) => {
  const cleanText = text?.trim()

  if (!chatId || !senderId || !cleanText) {
    throw new Error("Missing chatId, senderId, or message text")
  }

  const messagesRef = collection(db, "chats", chatId, "messages")
  const chatRef = doc(db, "chats", chatId)

  // Write the message — Firestore rules enforce that senderId must be a chat participant
  await addDoc(messagesRef, {
    senderId,
    text: cleanText,
    createdAt: serverTimestamp(),
    read: false,
  })

  // Determine role for unread counter by checking who the student is
  const chatSnap = await getDoc(chatRef)
  const chat = chatSnap.exists() ? chatSnap.data() : null
  const isStudent = chat ? senderId === chat.studentId : true

  await updateDoc(chatRef, {
    lastMessage: cleanText,
    lastMessageTime: serverTimestamp(),
    lastSenderId: senderId,
    updatedAt: serverTimestamp(),
    unreadStudent: isStudent ? 0 : increment(1),
    unreadLandlord: isStudent ? increment(1) : 0,
    typingStudent: false,
    typingLandlord: false,
  })
}

export const listenToMessages = (chatId, callback) => {
  const messagesRef = collection(db, "chats", chatId, "messages")
  const q = query(messagesRef, orderBy("createdAt", "asc"))

  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }))
    callback(messages)
  })
}

export const listenToChats = (userId, role, onSuccess, onError) => {
  const field = role === "student" ? "studentId" : "landlordId"

  const q = query(
    collection(db, "chats"),
    where(field, "==", userId)
  )

  return onSnapshot(
    q,
    (snap) => {
      const chats = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const aTime = a.lastMessageTime?.toMillis?.() ?? 0
          const bTime = b.lastMessageTime?.toMillis?.() ?? 0
          return bTime - aTime
        })
      onSuccess(chats)
    },
    (err) => {
      console.error("listenToChats error:", err)
      if (onError) onError(err)
    }
  )
}

export const markAsRead = async (chatId, role) => {
  if (!chatId || !role) return

  const chatRef = doc(db, "chats", chatId)

  await updateDoc(chatRef, {
    [role === "student" ? "unreadStudent" : "unreadLandlord"]: 0,
  })
}

export const listenToUnreadCount = (userId, role, callback) => {
  const field = role === "student" ? "studentId" : "landlordId"
  const unreadField = role === "student" ? "unreadStudent" : "unreadLandlord"

  const q = query(collection(db, "chats"), where(field, "==", userId))

  return onSnapshot(q, (snap) => {
    const total = snap.docs.reduce((sum, d) => {
      return sum + (d.data()[unreadField] || 0)
    }, 0)
    callback(total)
  })
}

export const setTyping = async (chatId, role, isTyping) => {
  if (!chatId || !role) return

  const chatRef = doc(db, "chats", chatId)

  await updateDoc(chatRef, {
    [role === "student" ? "typingStudent" : "typingLandlord"]: isTyping,
  })
}