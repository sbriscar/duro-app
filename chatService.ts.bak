import { db } from './firebase'
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore'
import { Message, ChatSession } from '@/types'

class ChatService {
  async createSession(userId: string, type: string, initialMessage: string): Promise<string> {
    const session = await addDoc(collection(db, 'chats'), {
      userId,
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

  async getSessions(userId: string): Promise<ChatSession[]> {
    const q = query(
      collection(db, 'chats'),
      where('userId', '==', userId)
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
}

export const chatService = new ChatService() 