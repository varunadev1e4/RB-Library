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
    if (!username.trim())          e.username = 'Username is required'
    else if (username.length < 3)  e.username = 'At least 3 characters'
    else if (!/^[a-z0-9_]+$/i.test(username)) e.username = 'Letters, numbers and _ only'
    if (pin.length !== 6)          e.pin = 'PIN must be exactly 6 digits'
    if (confirmPin !== pin)        e.confirmPin = 'PINs do not match'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    const { error } = await signup(username.trim().toLowerCase(), pin)
    if (error) setErrors({ general: error.message })
    else navigate('/')
  }

  return (
    <div
      className="min-h-screen bg-mahogany-800 flex flex-col"
      style={{ paddingTop: 'var(--sat)', paddingBottom: 'var(--sab)' }}
    >
      {/* Top branding */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center pt-10 pb-6 px-6">
        <img src="/icon-192.png" alt="Library" className="w-16 h-16 rounded-2xl shadow-book mb-3" />
        <h1 className="font-display text-paper text-2xl font-bold text-center">Join the Library</h1>
        <p className="font-serif text-mahogany-300 text-sm italic mt-1 text-center">
          Start your reading journey
        </p>
      </div>

      {/* Card */}
      <div className="flex-1 bg-paper rounded-t-3xl px-6 py-8 shadow-warm-lg overflow-y-auto">
        <h2 className="font-display text-mahogany-800 text-2xl font-semibold mb-1">Create account</h2>
        <p className="font-sans text-mahogany-500 text-sm mb-6">Free, no email required</p>

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
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
          />

          <PinInput value={pin} onChange={setPin} error={errors.pin} />

          <div>
            <label className="text-sm font-medium font-sans text-mahogany-700 block mb-2">
              Confirm PIN
            </label>
            <PinInput value={confirmPin} onChange={setConfirmPin} error={errors.confirmPin} />
          </div>

          {errors.general && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm font-sans leading-snug">{errors.general}</p>
            </div>
          )}

          <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
            Create Account
          </Button>

          <p className="text-xs text-mahogany-400 font-sans text-center">
            First user to register becomes Admin
          </p>
        </form>

        <p className="text-center text-mahogany-500 font-sans text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-600 font-semibold hover:text-amber-700">
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  )
}
