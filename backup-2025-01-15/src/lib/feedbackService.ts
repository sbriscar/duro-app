import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from './firebase'

export interface FeedbackData {
  userId: string
  rating: number
  features: string[]
  feedback: string
  hasBug: boolean
  bugDescription: string
  navigation: string
  design: string
  attachments: string[]
  createdAt: any
}

export const submitFeedback = async (
  userId: string,
  feedback: Omit<FeedbackData, 'userId' | 'attachments' | 'createdAt'>,
  files: File[]
): Promise<void> => {
  try {
    // Upload files first if any
    const attachmentUrls = await Promise.all(
      files.map(async (file) => {
        const storageRef = ref(storage, `feedback-attachments/${userId}/${Date.now()}-${file.name}`)
        await uploadBytes(storageRef, file)
        return getDownloadURL(storageRef)
      })
    )

    // Create feedback document
    const feedbackData: FeedbackData = {
      userId,
      ...feedback,
      attachments: attachmentUrls,
      createdAt: serverTimestamp()
    }

    await addDoc(collection(db, 'feedback'), feedbackData)
  } catch (error) {
    console.error('Error submitting feedback:', error)
    throw error
  }
} 