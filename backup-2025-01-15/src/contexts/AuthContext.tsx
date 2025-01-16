'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { User } from '@/types'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendEmailVerification, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import Link from 'next/link'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null | React.ReactNode
  signUp: (email: string, password: string, name: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const getAuthErrorMessage = (code: string, isSignup = false) => {
  const messages = {
    // Signup-specific errors
    'auth/email-already-in-use': (
      <span className="text-red-500">
        This email is already registered.{' '}
        <Link href="/login" className="text-blue-500 hover:underline">
          Click here to log in
        </Link>
      </span>
    ),
    'auth/invalid-email': 'Please enter a valid email address',
    'auth/weak-password': 'Password must be at least 6 characters',
    'auth/invalid-credential': 'Invalid email or password',
    'default': 'An error occurred. Please try again.'
  }

  return messages[code as keyof typeof messages] || messages['default']
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  signUp: async () => {},
  login: async () => {},
  logout: async () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null | React.ReactNode>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser && firebaseUser.email) {
        const appUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0]
        }
        setUser(appUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, name: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(result.user, {
        displayName: name
      })
      await sendEmailVerification(result.user)
      await signOut(auth)
      setUser(null)
      return
    } catch (error: any) {
      console.error('Signup error:', error)
      setError(getAuthErrorMessage(error.code, true))
      return
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      if (result.user && result.user.email) {
        const appUser: User = {
          id: result.user.uid,
          email: result.user.email,
          name: result.user.displayName || result.user.email.split('@')[0]
        }
        setUser(appUser)
      }
    } catch (error: any) {
      console.error('Login error:', error)
      setError(getAuthErrorMessage(error.code, false))
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      await signOut(auth)
      setUser(null)
    } catch (error: any) {
      console.error('Logout error:', error)
      setError('Failed to log out')
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, signUp, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext) 