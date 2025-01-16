'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  User
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Set up auth persistence and state listener
  useEffect(() => {
    // Set persistence to LOCAL (30 days)
    setPersistence(auth, browserLocalPersistence)

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
      
      // Set or remove session cookie
      if (user) {
        user.getIdToken().then(token => {
          Cookies.set('session', token, { expires: 30 }) // 30 days
        })
      } else {
        Cookies.remove('session')
      }
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code))
      throw err
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setError(null)
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(user, { displayName: name })
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code))
      throw err
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      Cookies.remove('session')
      router.push('/login')
    } catch (err: any) {
      setError(getAuthErrorMessage(err.code))
      throw err
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signUp, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password'
    case 'auth/email-already-in-use':
      return 'Email already registered'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters'
    case 'auth/invalid-email':
      return 'Invalid email address'
    default:
      return 'An error occurred. Please try again'
  }
} 