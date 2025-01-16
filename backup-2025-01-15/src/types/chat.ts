export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

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