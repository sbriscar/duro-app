export default function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm">
      {message}
    </div>
  )
} 