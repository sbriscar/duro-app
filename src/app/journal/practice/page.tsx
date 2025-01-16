'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { journalService } from '@/lib/journalService'
import { Rating } from '@/types/journal'

interface FormData {
  date: string
  goalsForNextPractice: string
  accomplishments: string
  biggestChallenge: string
  ratings: Rating
}

const initialFormData: FormData = {
  date: new Date().toLocaleDateString('en-CA'),
  goalsForNextPractice: '',
  accomplishments: '',
  biggestChallenge: '',
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

export default function PracticeJournalPage() {
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
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      await journalService.createEntry(user.uid, {
        type: 'practice',
        date: formData.date,
        goalsForNextPractice: formData.goalsForNextPractice,
        accomplishments: formData.accomplishments,
        biggestChallenge: formData.biggestChallenge,
        ratings: formData.ratings
      })
      router.push('/journal')
    } catch (error: any) {
      setError(error.message || 'Failed to save journal entry')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Practice Journal</h1>
        <p className="text-gray-600">Record your practice session and track your progress</p>
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

        {/* Goals */}
        <div>
          <label className="block text-sm font-medium mb-2">Goals for Next Practice</label>
          <textarea
            name="goalsForNextPractice"
            value={formData.goalsForNextPractice}
            onChange={handleInputChange}
            placeholder="What do you want to achieve in your next practice?"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4ecdc4] min-h-[100px]"
          />
        </div>

        {/* Accomplishments */}
        <div>
          <label className="block text-sm font-medium mb-2">What Did I Accomplish Today?</label>
          <textarea
            name="accomplishments"
            value={formData.accomplishments}
            onChange={handleInputChange}
            placeholder="What progress did you make today?"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4ecdc4] min-h-[100px]"
          />
        </div>

        {/* Ratings */}
        <div>
          <h3 className="text-lg font-medium mb-4">Rate Your Practice</h3>
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

        {/* Biggest Challenge */}
        <div>
          <label className="block text-sm font-medium mb-2">Biggest Challenge</label>
          <textarea
            name="biggestChallenge"
            value={formData.biggestChallenge}
            onChange={handleInputChange}
            placeholder="What was your biggest challenge during practice?"
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4ecdc4] min-h-[100px]"
          />
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