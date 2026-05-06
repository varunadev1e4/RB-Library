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
    if (err) {
      setError('Invalid username or PIN')
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Left decorative panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-mahogany-800 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute text-8xl opacity-20"
              style={{ left: `${(i % 3) * 35 + 5}%`, top: `${Math.floor(i / 3) * 30 + 5}%`, transform: `rotate(${i * 15 - 30}deg)` }}
            >
              📚
            </div>
          ))}
        </div>
        <div className="relative z-10 text-center">
          <div className="text-7xl mb-6">📚</div>
          <h1 className="font-display text-paper text-4xl font-bold leading-tight">
            Community<br />Library
          </h1>
          <p className="font-serif text-mahogany-300 mt-4 text-lg italic">
            "A reader lives a thousand lives<br />before he dies."
          </p>
          <p className="text-mahogany-400 font-sans text-sm mt-2">— George R.R. Martin</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="text-5xl mb-3">📚</div>
            <h1 className="font-display text-mahogany-800 text-3xl font-bold">Community Library</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-warm p-8 border border-mahogany-100">
            <h2 className="font-display text-mahogany-800 text-2xl font-semibold mb-1">Welcome back</h2>
            <p className="text-mahogany-500 font-sans text-sm mb-6">Sign in to your library account</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Username"
                type="text"
                placeholder="your_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
              />

              <PinInput
                value={pin}
                onChange={setPin}
                error={null}
              />

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm font-sans">{error}</p>
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
          </div>

          <p className="text-center text-mahogany-500 font-sans text-sm mt-4">
            New here?{' '}
            <Link to="/signup" className="text-amber-600 font-semibold hover:text-amber-700 underline-offset-2 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
