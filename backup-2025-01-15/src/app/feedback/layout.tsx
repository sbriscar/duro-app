'use client'

import Link from 'next/link'
import { IconType } from 'react-icons'
import { 
  FiMessageSquare, 
  FiStar, 
  FiUser, 
  FiBook, 
  FiSettings, 
  FiMessageCircle,
  FiHelpCircle,
  FiLogOut 
} from 'react-icons/fi'

interface MenuItem {
  label: string
  href: string
  icon: IconType
}

const menuItems: MenuItem[] = [
  { label: 'Chat History', href: '/dashboard', icon: FiMessageSquare },
  { label: 'Popular Prompts', href: '/dashboard/prompts', icon: FiStar },
  { label: 'Profile', href: '/profile', icon: FiUser },
  { label: 'Resources', href: '/dashboard/resources', icon: FiBook },
  { label: 'Settings', href: '/dashboard/settings', icon: FiSettings },
  { label: 'Feedback', href: '/feedback', icon: FiMessageCircle },
  { label: 'Support', href: '/dashboard/support', icon: FiHelpCircle },
]

const MenuItem = ({ label, href, icon: Icon }: MenuItem) => (
  <Link 
    href={href}
    className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors"
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </Link>
)

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar */}
      <aside className="w-64 bg-[#4ecdc4] p-4 flex flex-col">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">DURO</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <MenuItem key={item.label} {...item} />
          ))}
        </nav>

        {/* Logout Button */}
        <button className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-lg transition-colors mt-auto">
          <FiLogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  )
} 