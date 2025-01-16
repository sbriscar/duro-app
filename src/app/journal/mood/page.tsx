'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { journalService } from '@/lib/journalService'
import { Mood } from '@/types/journal'

interface FormData {
  date: string
  mood: Mood
  note: string
}

const initialFormData: FormData = {
  date: new Date().toLocaleDateString('en-CA'),
  mood: 'neutral',
  note: ''
}

const MOOD_OPTIONS: { value: Mood; label: string; emoji: string }[] = [
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'excited', label: 'Excited', emoji: '🤩' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'tired', label: 'Tired', emoji: '😴' },
  { value: 'frustrated', label: 'Frustrated', emoji: '😤' },
  { value: 'stressed', label: 'Stressed', emoji: '😰' }
]

export default function MoodTrackerPage() {
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

  const handleMoodSelect = (mood: Mood) => {
    setFormData(prev => ({
      ...prev,
      mood
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      await journalService.createEntry(user.uid, {
        type: 'mood',
        date: formData.date,
        mood: formData.mood,
        note: formData.note
      })
      router.push('/journal')
    } catch (error: any) {
      setError(error.message || 'Failed to save mood entry')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mood Tracker</h1>
        <p className="text-gray-600">Track your daily mood and emotional state</p>
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

        {/* Mood Selection */}
        <div>
          <label className="block text-sm font-medium mb-4">How are you feeling today?</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {MOOD_OPTIONS.map(({ value, label, emoji }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleMoodSelect(value)}
                className={`p-4 rounded-lg border transition-colors ${
                  formData.mood === value
                    ? 'border-[#4ecdc4] bg-[#4ecdc4] bg-opacity-10'
                    : 'border-gray-200 hover:border-[#4ecdc4]'
                }`}
              >
                <div className="text-3xl mb-2">{emoji}</div>
                <div className="text-sm font-medium">{label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-2">Additional Notes</label>
          <textarea
            name="note"
            value={formData.note}
            onChange={handleInputChange}
            placeholder="Why do you feel this way? (Optional)"
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