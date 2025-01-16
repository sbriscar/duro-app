'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { journalService } from '@/lib/journalService'
import { JournalStats, JournalType } from '@/types/journal'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { format } from 'date-fns'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const JOURNAL_TYPES: { type: JournalType; label: string; description: string }[] = [
  {
    type: 'practice',
    label: 'Practice Journal',
    description: 'Track your practice sessions and progress'
  },
  {
    type: 'competition',
    label: 'Competition Journal',
    description: 'Record your competition experiences'
  },
  {
    type: 'mood',
    label: 'Mood Tracker',
    description: 'Monitor your daily mood and emotions'
  }
]

const MOOD_EMOJIS = {
  happy: '😊',
  neutral: '😐',
  frustrated: '😤',
  stressed: '😰',
  excited: '🤩',
  tired: '😴'
}

export default function JournalDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<JournalStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadStats()
    }
  }, [user])

  const loadStats = async () => {
    try {
      const journalStats = await journalService.getStats(user!.uid)
      setStats(journalStats)
    } catch (error) {
      console.error('Error loading journal stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = {
    labels: stats?.moodTrends.map(trend => format(new Date(trend.date), 'MMM d')) || [],
    datasets: [
      {
        label: 'Confidence',
        data: stats?.recentEntries
          .filter(entry => 'ratings' in entry)
          .map(entry => (entry as any).ratings.confidence) || [],
        borderColor: '#4ecdc4',
        tension: 0.1
      },
      {
        label: 'Motivation',
        data: stats?.recentEntries
          .filter(entry => 'ratings' in entry)
          .map(entry => (entry as any).ratings.motivation) || [],
        borderColor: '#ff6b6b',
        tension: 0.1
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const
      },
      title: {
        display: true,
        text: 'Recent Performance Trends'
      }
    },
    scales: {
      y: {
        min: 0,
        max: 5
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4ecdc4]"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Journal Dashboard</h1>
        <p className="text-gray-600">Track your progress and reflect on your journey</p>
      </div>

      {/* Journal Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {JOURNAL_TYPES.map(({ type, label, description }) => (
          <a
            key={type}
            href={`/journal/${type}`}
            className="block p-6 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold mb-2">{label}</h3>
            <p className="text-gray-600">{description}</p>
          </a>
        ))}
      </div>

      {/* Stats and Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mood Trends */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Moods</h3>
          <div className="flex flex-wrap gap-4">
            {stats?.moodTrends.slice(0, 7).map((trend, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl mb-1">{MOOD_EMOJIS[trend.mood]}</div>
                <div className="text-sm text-gray-500">
                  {format(new Date(trend.date), 'MMM d')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <Line data={chartData} options={chartOptions} />
        </div>

        {/* Recent Entries */}
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Recent Entries</h3>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 divide-y">
            {stats?.recentEntries.map(entry => (
              <a
                key={entry.id}
                href={`/journal/${entry.type}/${entry.id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium capitalize">{entry.type} Entry</h4>
                    <p className="text-sm text-gray-500">
                      {format(new Date(entry.date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <div className="text-[#4ecdc4]">View Details →</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 