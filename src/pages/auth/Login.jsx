import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { Button, Input } from '../../components/ui/index.jsx'
import PinInput from '../../components/ui/PinInput'

export default function Login() {
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const { login, loading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!username.trim()) return setError('Please enter your username')
    if (pin.length !== 6) return setError('PIN must be exactly 6 digits')
    const { error: err } = await login(username.trim(), pin)
    if (err) setError(err.message || 'Incorrect username or PIN')
    else navigate('/')
  }

  return (
    <div
      className="min-h-screen bg-mahogany-800 flex flex-col"
      style={{ paddingTop: 'var(--sat)', paddingBottom: 'var(--sab)' }}
    >
      {/* Top branding */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center pt-12 pb-8 px-6">
        <img src="/icon-192.png" alt="Library" className="w-20 h-20 rounded-2xl shadow-book-lg mb-4" />
        <h1 className="font-display text-paper text-3xl font-bold text-center">Community Library</h1>
        <p className="font-serif text-mahogany-300 text-sm italic mt-1 text-center">
          Your neighbourhood reading hub
        </p>
      </div>

      {/* Card */}
      <div className="flex-1 bg-paper rounded-t-3xl px-6 py-8 shadow-warm-lg">
        <h2 className="font-display text-mahogany-800 text-2xl font-semibold mb-1">Welcome back</h2>
        <p className="font-sans text-mahogany-500 text-sm mb-8">Sign in to continue reading</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Username"
            type="text"
            placeholder="your_username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
          />

          <PinInput value={pin} onChange={setPin} error={null} />

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm font-sans leading-snug">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full"
          >
            Sign In
          </Button>
        </form>

        <p className="text-center text-mahogany-500 font-sans text-sm mt-8">
          New here?{' '}
          <Link to="/signup" className="text-amber-600 font-semibold hover:text-amber-700">
            Create an account →
          </Link>
        </p>
      </div>
    </div>
  )
}
