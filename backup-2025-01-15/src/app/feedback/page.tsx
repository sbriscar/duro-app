'use client'

import { useState } from 'react'
import { Star, Upload, X } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { submitFeedback } from '@/lib/feedbackService'

interface FeedbackForm {
  rating: number
  features: string[]
  feedback: string
  hasBug: boolean
  bugDescription: string
  navigation: string
  design: string
}

const features = [
  'AI Mindset Coach',
  'Personalized Visualization',
  'Notifications',
  'Chat Prompts',
  'Chat History',
  'Resources',
  'Progress Tracking',
  'Goal Setting',
  'Daily Check-Ins'
]

const navigationOptions = [
  'Very Easy',
  'Easy',
  'Neutral',
  'Difficult',
  'Very Difficult'
]

const designOptions = [
  'Great',
  'Good',
  'Neutral',
  'Needs Improvement',
  'Poor'
]

export default function FeedbackPage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState<FeedbackForm>({
    rating: 0,
    features: [],
    feedback: '',
    hasBug: false,
    bugDescription: '',
    navigation: '',
    design: ''
  })
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const updateProgress = (newFormData: Partial<FeedbackForm>) => {
    const totalFields = 6 // Total number of main fields
    const filledFields = Object.values({ ...formData, ...newFormData }).filter(value => {
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'boolean') return true
      return value
    }).length
    setProgress((filledFields / totalFields) * 100)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const newFormData = { ...formData, [name]: value }
    setFormData(newFormData)
    updateProgress(newFormData)
  }

  const handleFeatureToggle = (feature: string) => {
    const newFeatures = formData.features.includes(feature)
      ? formData.features.filter(f => f !== feature)
      : [...formData.features, feature]
    const newFormData = { ...formData, features: newFeatures }
    setFormData(newFormData)
    updateProgress(newFormData)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.uid) return
    
    setLoading(true)
    setError(null)

    try {
      await submitFeedback(user.uid, formData, files)
      setSuccess(true)
    } catch (error: any) {
      console.error('Error submitting feedback:', error)
      setError(error.message || 'Failed to submit feedback')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold text-[#4ecdc4] mb-4">Thank You!</h1>
        <p className="text-gray-600 mb-8">We appreciate your feedback! Your input helps us improve the app.</p>
        <Link href="/dashboard" className="text-[#4ecdc4] hover:underline">
          Return to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">We Value Your Feedback!</h1>
        <p className="text-gray-600">Help us improve by sharing your thoughts about the app.</p>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div
          className="bg-[#4ecdc4] h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Overall Experience */}
        <div>
          <label className="block text-sm font-medium mb-4">Overall Experience</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  const newFormData = { ...formData, rating: star }
                  setFormData(newFormData)
                  updateProgress(newFormData)
                }}
                className="text-2xl focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    formData.rating >= star
                      ? 'fill-[#4ecdc4] text-[#4ecdc4]'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Feature Feedback */}
        <div>
          <label className="block text-sm font-medium mb-4">Which features did you try?</label>
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature) => (
              <button
                key={feature}
                type="button"
                onClick={() => handleFeatureToggle(feature)}
                className={`p-3 rounded-lg border text-left text-sm transition-colors ${
                  formData.features.includes(feature)
                    ? 'border-[#4ecdc4] bg-[#4ecdc4] bg-opacity-10 text-[#4ecdc4]'
                    : 'border-gray-200 hover:border-[#4ecdc4]'
                }`}
              >
                {feature}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Feedback */}
        <div>
          <label className="block text-sm font-medium mb-2">Detailed Feedback</label>
          <textarea
            name="feedback"
            value={formData.feedback}
            onChange={handleInputChange}
            placeholder="Share your thoughts, issues, or ideas..."
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4ecdc4] min-h-[120px]"
          />
        </div>

        {/* Bug Report */}
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Did you encounter a bug?</label>
            <div className="space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="hasBug"
                  checked={formData.hasBug}
                  onChange={(e) => {
                    const newFormData = { ...formData, hasBug: true }
                    setFormData(newFormData)
                    updateProgress(newFormData)
                  }}
                  className="form-radio text-[#4ecdc4] focus:ring-[#4ecdc4]"
                />
                <span className="ml-2">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="hasBug"
                  checked={!formData.hasBug}
                  onChange={(e) => {
                    const newFormData = { ...formData, hasBug: false }
                    setFormData(newFormData)
                    updateProgress(newFormData)
                  }}
                  className="form-radio text-[#4ecdc4] focus:ring-[#4ecdc4]"
                />
                <span className="ml-2">No</span>
              </label>
            </div>
          </div>

          {formData.hasBug && (
            <textarea
              name="bugDescription"
              value={formData.bugDescription}
              onChange={handleInputChange}
              placeholder="Please describe the bug and steps to reproduce it..."
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4ecdc4] min-h-[120px]"
            />
          )}
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium mb-4">Attachments (Optional)</label>
          <div className="space-y-4">
            <label className="block">
              <span className="sr-only">Choose files</span>
              <input
                type="file"
                onChange={handleFileUpload}
                multiple
                accept="image/*"
                className="hidden"
              />
              <div className="px-4 py-3 rounded-lg border border-dashed border-gray-300 hover:border-[#4ecdc4] cursor-pointer text-center">
                <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <span className="text-sm text-gray-500">Upload screenshots or files</span>
              </div>
            </label>

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Optional Questions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">How easy was it to navigate the app?</label>
            <select
              name="navigation"
              value={formData.navigation}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4ecdc4]"
            >
              <option value="">Select an option</option>
              {navigationOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">What do you think of the app's design?</label>
            <select
              name="design"
              value={formData.design}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4ecdc4]"
            >
              <option value="">Select an option</option>
              {designOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-[#4ecdc4] text-white rounded-lg hover:bg-[#45c4bc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </button>

          <Link href="/dashboard" className="text-gray-500 hover:text-[#4ecdc4] text-sm">
            Skip Feedback
          </Link>
        </div>
      </form>
    </div>
  )
} 