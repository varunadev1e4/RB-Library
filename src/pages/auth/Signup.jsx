import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { Button, Input } from '../../components/ui/index.jsx'
import PinInput from '../../components/ui/PinInput'

export default function Signup() {
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [errors, setErrors] = useState({})
  const { signup, loading } = useAuthStore()
  const navigate = useNavigate()

  const validate = () => {
    const e = {}
    if (!username.trim()) e.username = 'Username is required'
    else if (username.length < 3) e.username = 'At least 3 characters'
    else if (!/^[a-z0-9_]+$/i.test(username)) e.username = 'Letters, numbers and _ only'

    if (pin.length !== 6) e.pin = 'PIN must be exactly 6 digits'
    if (confirmPin !== pin) e.confirmPin = 'PINs do not match'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})

    const { error } = await signup(username.trim().toLowerCase(), pin)
    if (error) {
      setErrors({ general: error.message })
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-paper flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-mahogany-800 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute text-8xl opacity-20"
              style={{ left: `${(i % 3) * 35 + 5}%`, top: `${Math.floor(i / 3) * 30 + 5}%`, transform: `rotate(${i * 15 - 30}deg)` }}>
              📚
            </div>
          ))}
        </div>
        <div className="relative z-10 text-center">
          <div className="text-7xl mb-6">🌱</div>
          <h1 className="font-display text-paper text-4xl font-bold leading-tight">Start Your<br />Reading Journey</h1>
          <p className="font-serif text-mahogany-300 mt-4 text-lg italic">
            "Not all those who wander are lost —<br />some are just browsing."
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <div className="text-5xl mb-3">📚</div>
            <h1 className="font-display text-mahogany-800 text-3xl font-bold">Community Library</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-warm p-8 border border-mahogany-100">
            <h2 className="font-display text-mahogany-800 text-2xl font-semibold mb-1">Join the library</h2>
            <p className="text-mahogany-500 font-sans text-sm mb-6">Create your free account</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Username"
                type="text"
                placeholder="choose_a_username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                error={errors.username}
                hint="Letters, numbers and _ only"
                autoComplete="username"
                autoFocus
              />

              <PinInput value={pin} onChange={setPin} error={errors.pin} />

              <div>
                <label className="text-sm font-medium font-sans text-mahogany-700 block mb-1">Confirm PIN</label>
                <PinInput value={confirmPin} onChange={setConfirmPin} error={errors.confirmPin} />
              </div>

              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm font-sans">{errors.general}</p>
                </div>
              )}

              <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
                Create Account
              </Button>
            </form>

            <p className="text-xs text-mahogany-400 font-sans mt-4 text-center">
              The first registered user automatically becomes Admin
            </p>
          </div>

          <p className="text-center text-mahogany-500 font-sans text-sm mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-600 font-semibold hover:text-amber-700 underline-offset-2 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
