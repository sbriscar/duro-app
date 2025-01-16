'use client'

import { useRouter } from 'next/navigation'
import ChatInterface from '@/components/ChatInterface'

const ChatPage = () => {
  const router = useRouter()

  const handleBack = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white">
      <ChatInterface onBack={handleBack} />
    </div>
  )
}

export default ChatPage 