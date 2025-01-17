import { GeistSans } from 'geist/font'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata = {
  title: 'Volleyball Threads',
  description: 'Your AI-powered volleyball mentor',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#4ecdc4',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className={`${GeistSans.className} antialiased`} suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
