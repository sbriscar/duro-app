'use client'

import { useRouter } from 'next/navigation'
import { FiMessageSquare, FiTarget, FiTrendingUp, FiRefreshCcw, FiStar, FiUser, FiBook, FiSettings, FiMessageCircle, FiHelpCircle, FiLogOut, FiArrowLeft } from 'react-icons/fi'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ChatSession } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import ChatInterface from '@/components/ChatInterface'
import { MessageSquare } from 'lucide-react'

const QuickAction = ({ 
  icon: Icon, 
  title, 
  description,
  onClick
}: { 
  icon: any
  title: string
  description: string
  onClick: () => void
}) => (
  <div 
    className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer" 
    onClick={onClick}
  >
    <div className="w-12 h-12 bg-[#4ecdc4] bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-[#4ecdc4]" />
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
)

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [recentChats, setRecentChats] = useState<ChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [showChat, setShowChat] = useState(false)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRecentChats() {
      if (!user) return
      
      try {
        const chatsRef = collection(db, 'chatSessions')
        const q = query(
          chatsRef,
          orderBy('lastMessageAt', 'desc'),
          limit(3)
        )
        
        const querySnapshot = await getDocs(q)
        const chats = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ChatSession[]
        
        setRecentChats(chats)
      } catch (error) {
        console.error('Error fetching recent chats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentChats()
  }, [user])

  const handleNewChat = () => {
    setSelectedChatId('new')
    setShowChat(true)
  }

  const handleContinueChat = (chatId: string) => {
    setSelectedChatId(chatId)
    setShowChat(true)
  }

  const handleSetGoals = () => {
    router.push('/dashboard/goals')
  }

  const handleViewProgress = () => {
    router.push('/dashboard/progress')
  }

  const handleContinueLastChat = () => {
    if (recentChats.length > 0) {
      handleContinueChat(recentChats[0].id)
    } else {
      handleNewChat()
    }
  }

  if (showChat) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <ChatInterface 
          initialSessionId={selectedChatId} 
          onBack={() => setShowChat(false)}
          onPromptClick={(prompt) => {
            setSelectedChatId('new')
            // The ChatInterface will handle sending the message
          }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Hey{user ? ` ${user.email?.split('@')[0]}` : ''} 👋
        </h1>
        <p className="text-gray-600">Ready to continue your journey?</p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <QuickAction
          icon={FiMessageSquare}
          title="Start New Chat"
          description="Begin a new conversation with your AI mentor"
          onClick={handleNewChat}
        />
        <QuickAction
          icon={FiTarget}
          title="Set Goals"
          description="Define and track your personal development goals"
          onClick={handleSetGoals}
        />
        <QuickAction
          icon={FiTrendingUp}
          title="Track Progress"
          description="View insights from your previous sessions"
          onClick={handleViewProgress}
        />
        <QuickAction
          icon={FiRefreshCcw}
          title="Continue Last Chat"
          description="Pick up where you left off"
          onClick={handleContinueLastChat}
        />
      </div>

      {/* Recent Activity Section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 divide-y">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading recent chats...</div>
          ) : recentChats.length > 0 ? (
            recentChats.map((chat) => (
              <div key={chat.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{chat.title}</h3>
                    <p className="text-sm text-gray-600">
                      Last message: {formatDistanceToNow(new Date(chat.lastMessageAt))} ago
                    </p>
                  </div>
                  <button 
                    className="text-[#4ecdc4] hover:underline"
                    onClick={() => handleContinueChat(chat.id)}
                  >
                    Continue
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">No recent chats</div>
          )}
        </div>
      </div>
    </div>
  )
} 