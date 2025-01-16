'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  ArrowLeft, 
  Settings, 
  Send, 
  MessageSquare,
  User,
  Book,
  MessageCircle,
  HelpCircle,
  LogOut,
  Star,
  FileText
} from 'lucide-react'
import { format } from 'date-fns'
import { chatService } from '@/lib/chatService'
import { Message, ChatSession } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import styles from './chat.module.css'
import { useRouter } from 'next/navigation'

export interface ChatInterfaceProps {
  initialSessionId?: string | null
  onBack?: () => void
  onPromptClick?: (prompt: string) => void
}

const getChatType = (title: string): string => {
  const lowerTitle = title.toLowerCase()
  
  // Anxiety related keywords
  if (lowerTitle.includes('anxiety') || 
      lowerTitle.includes('nervous') || 
      lowerTitle.includes('stress') ||
      lowerTitle.includes('worried') ||
      lowerTitle.includes('fear') ||
      lowerTitle.includes('pressure') ||
      lowerTitle.includes('panic')) {
    return 'anxiety'
  }
  
  // Confidence related keywords
  if (lowerTitle.includes('confidence') || 
      lowerTitle.includes('believe') || 
      lowerTitle.includes('trust') ||
      lowerTitle.includes('self-doubt') ||
      lowerTitle.includes('improve') ||
      lowerTitle.includes('better') ||
      lowerTitle.includes('strong')) {
    return 'confidence'
  }
  
  // Burnout related keywords
  if (lowerTitle.includes('burnout') || 
      lowerTitle.includes('tired') || 
      lowerTitle.includes('exhausted') ||
      lowerTitle.includes('overwhelmed') ||
      lowerTitle.includes('stress') ||
      lowerTitle.includes('break') ||
      lowerTitle.includes('rest')) {
    return 'burnout'
  }
  
  // Motivation related keywords
  if (lowerTitle.includes('motivation') || 
      lowerTitle.includes('inspire') || 
      lowerTitle.includes('drive') ||
      lowerTitle.includes('goals') ||
      lowerTitle.includes('achieve') ||
      lowerTitle.includes('success') ||
      lowerTitle.includes('push')) {
    return 'motivation'
  }
  
  return 'general'
}

const getEmojiForType = (type: string): string => {
  switch (type) {
    case 'anxiety':
      return '😰'
    case 'confidence':
      return '💪'
    case 'burnout':
      return '😮‍💨'
    case 'motivation':
      return '🔥'
    case 'general':
      return '💭'
    default:
      return '💭'
  }
}

const BOT_AVATAR = `data:image/svg+xml;base64,${Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="32" fill="#40E0D0"/>
  <circle cx="24" cy="28" r="4" fill="white"/>
  <circle cx="40" cy="28" r="4" fill="white"/>
  <path d="M24 40C24 40 28 44 32 44C36 44 40 40 40 40" stroke="white" stroke-width="3" stroke-linecap="round"/>
  <circle cx="32" cy="12" r="3" fill="white"/>
  <line x1="32" y1="15" x2="32" y2="20" stroke="white" stroke-width="3" stroke-linecap="round"/>
</svg>`).toString('base64')}`

export default function ChatInterface({ 
  initialSessionId,
  onBack,
  onPromptClick 
}: ChatInterfaceProps) {
  const { user } = useAuth()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(initialSessionId || null)
  const [isLoading, setIsLoading] = useState(false)
  const [visibleSessions, setVisibleSessions] = useState(3)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (user) {
      loadSessions()
    }
  }, [user])

  useEffect(() => {
    if (initialSessionId) {
      setCurrentSessionId(initialSessionId)
    }
  }, [initialSessionId])

  useEffect(() => {
    if (currentSessionId && currentSessionId !== 'new') {
      loadMessages(currentSessionId)
    } else {
      setMessages([])
    }
  }, [currentSessionId])

  const loadSessions = async () => {
    if (!user) return
    try {
      const loadedSessions = await chatService.getSessions(user.uid)
      setSessions(loadedSessions)
    } catch (error) {
      console.error('Failed to load sessions:', error)
    }
  }

  const loadMessages = async (sessionId: string) => {
    try {
      const loadedMessages = await chatService.getMessages(sessionId)
      setMessages(loadedMessages)
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const handleSendMessage = async (content: string) => {
    console.log('Attempting to send message:', content)
    if (!content.trim() || isLoading || !user) {
      console.log('Send blocked:', { 
        emptyContent: !content.trim(), 
        isLoading, 
        noUser: !user 
      })
      return
    }
    
    try {
      setIsLoading(true)
      let sessionId = currentSessionId

      // Create new session if needed
      if (!sessionId || sessionId === 'new') {
        console.log('Creating new session...')
        const chatType = getChatType(content)
        sessionId = await chatService.createSession(user.uid, chatType, content)
        setCurrentSessionId(sessionId)
      }

      // Add optimistic user message
      const userMessage: Message = {
        id: Date.now().toString(),
        message: content,
        userId: user.uid,
        role: 'user',
        sessionId,
        timestamp: new Date().toISOString()
      }
      
      console.log('Adding user message:', userMessage)
      setMessages(prev => [...prev, userMessage])
      setInput('')

      // Create user message in DB
      await chatService.createMessage(userMessage)

      // Get AI response
      console.log('Fetching AI response...')
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: content,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.message
          }))
        })
      })

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`)
      }

      const data = await response.json()
      console.log('Received AI response:', data)

      // Create AI message
      const aiMessage: Message = {
        id: Date.now().toString(),
        message: data.message,
        userId: user.uid,
        role: 'assistant',
        sessionId,
        timestamp: new Date().toISOString()
      }
      await chatService.createMessage(aiMessage)

      // Update UI with AI message
      setMessages(prev => [...prev, aiMessage])
      await loadSessions() // Refresh sessions list
      
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      console.log('Enter key pressed, sending message:', input)
      handleSendMessage(input)
    }
  }

  const handlePromptClick = (prompt: string) => {
    console.log('Prompt clicked:', prompt)
    if (onPromptClick) {
      onPromptClick(prompt)
    }
    setInput(prompt)
    handleSendMessage(prompt)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSendClick = () => {
    console.log('Send button clicked, sending message:', input)
    handleSendMessage(input)
  }

  const handleLoadMore = () => {
    setVisibleSessions(prev => prev + 3)
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-4">
        <button 
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          {messages.length > 0 ? (
            <button 
              className="hover:bg-gray-50 p-2 rounded-full"
              onClick={() => {
                setMessages([])
                setCurrentSessionId(null)
                setInput('')
              }}
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          ) : (
            <div className="w-9" />
          )}
          <h1 className="text-lg font-medium">Ashley</h1>
          <button className="hover:bg-gray-50 p-2 rounded-full">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className={`flex-1 px-6 ${messages.length > 0 ? 'overflow-y-auto' : ''}`}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center pt-8">
              <img 
                src="/ashley.jpg" 
                alt="Ashley" 
                className="w-20 h-20 rounded-full object-cover mb-4"
              />
              <h2 className="text-xl font-medium mb-4">Start a new chat.</h2>
              <div className="relative w-full max-w-xl">
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Write your message here"
                  className="w-full px-4 py-3 rounded-full bg-gray-50 border border-gray-100 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#4ecdc4]"
                />
                <button
                  onClick={handleSendClick}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4ecdc4]"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${message.role === 'user' ? 'bg-[#4ecdc4] text-white' : 'bg-gray-100'} rounded-lg px-4 py-2`}>
                    {message.message}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    Typing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {messages.length > 0 && (
          <div className="px-6 py-4 border-t">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Write your message here"
                className="w-full px-4 py-3 rounded-full bg-gray-50 border border-gray-100 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#4ecdc4]"
              />
              <button
                onClick={handleSendClick}
                disabled={isLoading}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4ecdc4]"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {messages.length === 0 && (
          <>
            <div className="px-6 pt-[25px]">
              <h3 className="font-medium mb-3">Popular Prompts</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => handlePromptClick("Help me with performance anxiety")}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border border-gray-100"
                >
                  Help me with performance anxiety
                </button>
                <button 
                  onClick={() => handlePromptClick("How do I build confidence?")}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border border-gray-100"
                >
                  How do I build confidence?
                </button>
                <button 
                  onClick={() => handlePromptClick("I'm feeling a little burned out")}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border border-gray-100"
                >
                  I'm feeling a little burned out
                </button>
              </div>
            </div>

            <div className="px-6 pt-[25px]">
              <h3 className="font-medium mb-3">Chat History</h3>
              <div className="space-y-2">
                {sessions.slice(0, visibleSessions).map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setCurrentSessionId(session.id)}
                    className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="flex justify-between items-center">
                      <span>{session.title}</span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(session.lastMessageAt), 'M/d/yyyy')}
                      </span>
                    </div>
                  </button>
                ))}
                {sessions.length > visibleSessions && (
                  <button
                    onClick={handleLoadMore}
                    className="w-full text-center p-3 text-[#4ecdc4] hover:bg-gray-50 rounded-lg border border-gray-100"
                  >
                    Load More
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 