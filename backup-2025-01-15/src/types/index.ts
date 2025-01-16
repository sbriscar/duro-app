import { User as FirebaseUser } from 'firebase/auth'

export interface Message {
  id: string
  message: string
  userId: string
  role: 'user' | 'assistant'
  sessionId: string
  timestamp: string
}

export interface ChatSession {
  id: string
  userId: string
  type: string
  title: string
  preview: string
  createdAt: string
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