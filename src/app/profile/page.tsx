'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { getUserProfile, updateUserProfile, updateUserPassword, UserProfile } from '@/lib/userService'

export default function ProfilePage() {
  const { user } = useAuth()
  const [sections, setSections] = useState<{ [key: string]: boolean }>({
    basic: true,
    athletic: true,
    settings: true
  })
  const [formData, setFormData] = useState<UserProfile>({
    // Basic Information
    name: '',
    email: '',
    birthdate: '',
    phone: '',
    pronouns: '',
    // Athletic Information
    sports: [],
    teamName: '',
    position: '',
    level: '',
    // Account Settings
    emailNotifications: true,
    appNotifications: true,
    language: 'English',
    isPublic: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const sports = [
    'Basketball', 'Baseball', 'Soccer', 'Volleyball', 'Tennis',
    'Swimming', 'Track & Field', 'Cross Country', 'Football',
    'Golf', 'Hockey', 'Lacrosse', 'Rugby', 'Softball'
  ]

  const levels = [
    'Recreational',
    'School',
    'Club',
    'Collegiate',
    'Professional'
  ]

  const languages = [
    'English',
    'Spanish',
    'French',
    'German',
    'Chinese',
    'Japanese'
  ]

  useEffect(() => {
    async function loadUserProfile() {
      if (!user?.uid) return
      
      try {
        setLoading(true)
        const profile = await getUserProfile(user.uid)
        if (profile) {
          setFormData({
            ...profile,
            email: user.email || ''
          })
        } else {
          // Initialize with auth data if no profile exists
          setFormData(prev => ({
            ...prev,
            name: user.displayName || '',
            email: user.email || ''
          }))
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        setError('Failed to load profile data')
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [user])

  const toggleSection = (section: string) => {
    setSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSportsChange = (sport: string) => {
    setFormData(prev => ({
      ...prev,
      sports: prev.sports.includes(sport)
        ? prev.sports.filter(s => s !== sport)
        : [...prev.sports, sport]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.uid) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Update password if provided
      if (currentPassword && newPassword) {
        await updateUserPassword(currentPassword, newPassword)
        setCurrentPassword('')
        setNewPassword('')
      }

      // Update profile
      await updateUserProfile(user.uid, formData)
      setSuccess('Profile updated successfully')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setError(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div>Please log in to view your profile.</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-500 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 text-green-500 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection('basic')}
            className="w-full flex items-center justify-between p-4 border-b"
          >
            <h2 className="text-xl font-semibold">Basic Information</h2>
            {sections.basic ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {sections.basic && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4ecdc4]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4ecdc4]"
                    required
                    autoComplete="username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4ecdc4]"
                    placeholder="Enter current password to change"
                    autoComplete="current-password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4ecdc4]"
                    placeholder="Enter new password"
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Birthdate</label>
                  <input
                    type="date"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4ecdc4]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Optional"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4ecdc4]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Gender/Pronouns</label>
                  <input
                    type="text"
                    name="pronouns"
                    value={formData.pronouns}
                    onChange={handleInputChange}
                    placeholder="e.g., She/Her, He/Him, They/Them"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4ecdc4]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Athletic Information */}
        <div className="bg-white rounded-lg shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection('athletic')}
            className="w-full flex items-center justify-between p-4 border-b"
          >
            <h2 className="text-xl font-semibold">Athletic Information</h2>
            {sections.athletic ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {sections.athletic && (
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Primary Sport(s)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {sports.map(sport => (
                    <label key={sport} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.sports.includes(sport)}
                        onChange={() => handleSportsChange(sport)}
                        className="rounded border-gray-300 text-[#4ecdc4] focus:ring-[#4ecdc4]"
                      />
                      <span>{sport}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Team/Club Name</label>
                  <input
                    type="text"
                    name="teamName"
                    value={formData.teamName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4ecdc4]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Position/Role</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4ecdc4]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Competition Level</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4ecdc4]"
                  >
                    <option value="">Select Level</option>
                    {levels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-lg shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection('settings')}
            className="w-full flex items-center justify-between p-4 border-b"
          >
            <h2 className="text-xl font-semibold">Account Settings</h2>
            {sections.settings ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {sections.settings && (
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Email Notifications</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={formData.emailNotifications}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4ecdc4]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">App Notifications</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="appNotifications"
                      checked={formData.appNotifications}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4ecdc4]"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Preferred Language</label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#4ecdc4]"
                  >
                    {languages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Profile Visibility</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4ecdc4]"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-2">When enabled, other athletes can view your sports and team information. Your personal details like email, phone, and birthdate remain private.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#4ecdc4] text-white rounded-lg hover:bg-[#45c4bc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
} 