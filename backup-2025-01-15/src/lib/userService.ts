import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db, auth } from './firebase'
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'

export interface UserProfile {
  name: string
  email: string
  birthdate: string
  phone: string
  pronouns: string
  sports: string[]
  teamName: string
  position: string
  level: string
  emailNotifications: boolean
  appNotifications: boolean
  language: string
  isPublic: boolean
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile
    }
    return null
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw error
  }
}

export const updateUserProfile = async (userId: string, profile: Partial<UserProfile>): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists()) {
      // Create new profile if it doesn't exist
      await setDoc(userRef, profile)
    } else {
      // Update existing profile
      await updateDoc(userRef, profile)
    }
    
    // Update Firebase Auth display name if it's changed
    if (profile.name && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: profile.name
      })
    }
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

export const updateUserPassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  if (!auth.currentUser || !auth.currentUser.email) {
    throw new Error('No authenticated user')
  }

  try {
    // Re-authenticate user before password change
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      currentPassword
    )
    await reauthenticateWithCredential(auth.currentUser, credential)
    
    // Update password
    await updatePassword(auth.currentUser, newPassword)
  } catch (error) {
    console.error('Error updating password:', error)
    throw error
  }
}

export const createUserProfile = async (userId: string, profile: UserProfile): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', userId), profile)
  } catch (error) {
    console.error('Error creating user profile:', error)
    throw error
  }
} 