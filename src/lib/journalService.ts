import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { 
  JournalEntry, 
  JournalStats, 
  JournalType, 
  Mood, 
  Rating,
  PracticeJournalEntry,
  CompetitionJournalEntry,
  MoodJournalEntry
} from '@/types/journal'

const COLLECTION_NAME = 'journal_entries'

export const journalService = {
  // Create a new journal entry
  async createEntry(entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...entry,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating journal entry:', error)
      throw error
    }
  },

  // Update an existing journal entry
  async updateEntry(id: string, entry: Partial<JournalEntry>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      await updateDoc(docRef, {
        ...entry,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating journal entry:', error)
      throw error
    }
  },

  // Delete a journal entry
  async deleteEntry(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Error deleting journal entry:', error)
      throw error
    }
  },

  // Get a single journal entry by ID
  async getEntry(id: string): Promise<JournalEntry | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as JournalEntry
      }
      return null
    } catch (error) {
      console.error('Error getting journal entry:', error)
      throw error
    }
  },

  // Get entries by type for a user
  async getEntriesByType(userID: string, type: JournalType, limitCount = 10): Promise<JournalEntry[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userID', '==', userID),
        where('type', '==', type),
        orderBy('date', 'desc'),
        limit(limitCount)
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as JournalEntry[]
    } catch (error) {
      console.error('Error getting journal entries:', error)
      throw error
    }
  },

  // Get entries within a date range for a user
  async getEntriesInRange(userID: string, startDate: Date, endDate: Date): Promise<JournalEntry[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('userID', '==', userID),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as JournalEntry[]
    } catch (error) {
      console.error('Error getting journal entries:', error)
      throw error
    }
  },

  // Get statistics for a user
  async getStats(userID: string): Promise<JournalStats> {
    try {
      // Get recent mood entries
      const moodEntries = await this.getEntriesByType(userID, 'mood', 30) as MoodJournalEntry[]
      
      // Calculate mood trends
      const moodTrends = moodEntries.map(entry => ({
        date: entry.date,
        mood: entry.mood
      }))

      // Get recent practice and competition entries
      const practiceEntries = await this.getEntriesByType(userID, 'practice', 30) as PracticeJournalEntry[]
      const competitionEntries = await this.getEntriesByType(userID, 'competition', 30) as CompetitionJournalEntry[]

      // Calculate average ratings
      const calculateAverageRatings = (entries: (PracticeJournalEntry | CompetitionJournalEntry)[]): Rating => {
        const totals = {
          confidence: 0,
          motivation: 0,
          effort: 0,
          attitude: 0
        }
        let count = 0

        entries.forEach(entry => {
          if (entry.ratings) {
            totals.confidence += entry.ratings.confidence
            totals.motivation += entry.ratings.motivation
            totals.effort += entry.ratings.effort
            totals.attitude += entry.ratings.attitude
            count++
          }
        })

        return {
          confidence: count > 0 ? totals.confidence / count : 0,
          motivation: count > 0 ? totals.motivation / count : 0,
          effort: count > 0 ? totals.effort / count : 0,
          attitude: count > 0 ? totals.attitude / count : 0
        }
      }

      const averageRatings = calculateAverageRatings([...practiceEntries, ...competitionEntries])

      return {
        moodTrends,
        averageRatings,
        recentEntries: [...moodEntries, ...practiceEntries, ...competitionEntries]
      }
    } catch (error) {
      console.error('Error getting journal stats:', error)
      throw error
    }
  }
} 