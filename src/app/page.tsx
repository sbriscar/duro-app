'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/dashboard')
      } else {
        router.replace('/login')
      }
    }
  }, [loading, user, router])

  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#4ecdc4]"></div>
    </div>
  )
}