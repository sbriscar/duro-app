import { db } from './firebase'
import { collection, addDoc, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore'
import { Message, ChatSession } from '@/types'

class ChatService {
  async createSession(userID: string, type: string, initialMessage: string): Promise<string> {
    const session = await addDoc(collection(db, 'chats'), {
      userID,
      type,
      title: initialMessage.slice(0, 50),
      preview: initialMessage,
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString()
    })

    return session.id
  }

  async createMessage(message: Omit<Message, 'id'>): Promise<void> {
    await addDoc(collection(db, 'messages'), message)
  }

  async getSessions(userID: string): Promise<ChatSession[]> {
    const q = query(
      collection(db, 'chats'),
      where('userID', '==', userID)
    )
    
    const snapshot = await getDocs(q)
    const sessions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ChatSession[]

    return sessions.sort((a, b) => 
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    )
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    const q = query(
      collection(db, 'messages'),
      where('sessionId', '==', sessionId)
    )
    
    const snapshot = await getDocs(q)
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[]
    
    return messages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      // Delete the chat session
      await deleteDoc(doc(db, 'chats', sessionId))
      
      // Delete all messages associated with this session
      const messagesQuery = query(
        collection(db, 'messages'),
        where('sessionId', '==', sessionId)
      )
      
      const snapshot = await getDocs(messagesQuery)
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)
    } catch (error) {
      console.error('Failed to delete session:', error)
      throw error
    }
  }
}

export const chatService = new ChatService() 