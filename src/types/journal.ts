export type JournalType = 'practice' | 'competition' | 'mood'

export type Mood = 'happy' | 'neutral' | 'frustrated' | 'stressed' | 'excited' | 'tired'

export interface Rating {
  confidence: number
  motivation: number
  effort: number
  attitude: number
}

export interface BaseJournalEntry {
  id: string
  userID: string
  type: JournalType
  date: string
  createdAt: string
  updatedAt: string
}

export interface PracticeJournalEntry extends BaseJournalEntry {
  type: 'practice'
  goalsForNextPractice: string
  accomplishments: string
  biggestChallenge: string
  ratings: Rating
}

export interface CompetitionJournalEntry extends BaseJournalEntry {
  type: 'competition'
  specificGoals: string
  whatWentWell: string
  enjoyableMoments: string
  ratings: Rating
}

export interface MoodJournalEntry extends BaseJournalEntry {
  type: 'mood'
  mood: Mood
  note?: string
}

export type JournalEntry = PracticeJournalEntry | CompetitionJournalEntry | MoodJournalEntry

export interface JournalStats {
  moodTrends: Array<{
    date: string
    mood: Mood
  }>
  averageRatings: {
    confidence: number
    motivation: number
    effort: number
    attitude: number
  }
  recentEntries: JournalEntry[]
} 