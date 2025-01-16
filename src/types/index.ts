import { User as FirebaseUser } from 'firebase/auth'

export interface Message {
  id: string
  message: string
  userID: string
  role: 'user' | 'assistant'
  sessionId: string
  timestamp: string
  intent?: string
  confidence?: number
}

export interface ChatSession {
  id: string
  userID: string
  type: string
  title: string
  lastMessageAt: string
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
} 