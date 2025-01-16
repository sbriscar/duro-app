'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { journalService } from '@/lib/journalService'
import { Rating, CompetitionJournalEntry } from '@/types/journal'

interface FormData {
  date: string
  specificGoals: string
  whatWentWell: string
  enjoyableMoments: string
  ratings: Rating
}

const initialFormData: FormData = {
  date: new Date().toLocaleDateString('en-CA'),
  specificGoals: '',
  whatWentWell: '',
  enjoyableMoments: '',
  ratings: {
    confidence: 3,
    motivation: 3,
    effort: 3,
    attitude: 3
  }
}

const ratingLabels = {
  confidence: 'Confidence Level',
  motivation: 'Motivation Level',
  effort: 'Effort Level',
  attitude: 'Attitude Level'
}

export default function CompetitionJournalPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRatingChange = (name: keyof Rating, value: number) => {
    setFormData(prev => ({
      ...prev,
      ratings: {
        ...prev.ratings,
        [name]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('You must be logged in to save a journal entry')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const entry: Omit<CompetitionJournalEntry, 'id' | 'createdAt' | 'updatedAt'> = {
        userID: user.uid,
        type: 'competition',
        date: formData.date,
        specificGoals: formData.specificGoals,
        whatWentWell: formData.whatWentWell,
        enjoyableMoments: formData.enjoyableMoments,
        ratings: formData.ratings
      }
      await journalService.createEntry(entry)
      router.push('/journal')
    } catch (error: any) {
      console.error('Error saving journal entry:', error)
      setError(error.message || 'Failed to save journal entry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Competition Journal</h1>
        <p className="text-gray-600">Record your competition experience and reflect on your performance</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium mb-2">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4ecdc4]"
          />
        </div>

        {/* Specific Goals */}
        <div>
          <label className="block text-sm font-medium mb-2">Specific Goals for Next Match/Tournament</label>
          <textarea
            name="specificGoals"
            value={formData.specificGoals}
            onChange={handleInputChange}
            placeholder="What do you want to achieve in your next competition?"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4ecdc4] min-h-[100px]"
          />
        </div>

        {/* What Went Well */}
        <div>
          <label className="block text-sm font-medium mb-2">What Did I Do Well?</label>
          <textarea
            name="whatWentWell"
            value={formData.whatWentWell}
            onChange={handleInputChange}
            placeholder="What were your strengths during the competition?"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4ecdc4] min-h-[100px]"
          />
        </div>

        {/* Enjoyable Moments */}
        <div>
          <label className="block text-sm font-medium mb-2">Most Enjoyable Part</label>
          <textarea
            name="enjoyableMoments"
            value={formData.enjoyableMoments}
            onChange={handleInputChange}
            placeholder="What did you enjoy most about the competition?"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4ecdc4] min-h-[100px]"
          />
        </div>

        {/* Ratings */}
        <div>
          <h3 className="text-lg font-medium mb-4">Rate Your Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(Object.keys(ratingLabels) as Array<keyof Rating>).map(key => (
              <div key={key}>
                <label className="block text-sm font-medium mb-2">
                  {ratingLabels[key]}
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(value => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleRatingChange(key, value)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        formData.ratings[key] === value
                          ? 'bg-[#4ecdc4] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-[#4ecdc4] text-white rounded-lg hover:bg-[#45c4bc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </form>
    </div>
  )
} 