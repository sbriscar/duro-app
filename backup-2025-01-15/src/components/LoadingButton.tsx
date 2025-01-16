interface LoadingButtonProps {
  loading: boolean
  children: React.ReactNode
  type?: 'button' | 'submit'
  onClick?: () => void
  className?: string
}

export default function LoadingButton({
  loading,
  children,
  type = 'button',
  onClick,
  className = ''
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`w-full bg-[#1b3652] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#264973] focus:outline-none focus:ring-2 focus:ring-[#1b3652] focus:ring-offset-2 focus:ring-offset-[#40E0D0] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
} 