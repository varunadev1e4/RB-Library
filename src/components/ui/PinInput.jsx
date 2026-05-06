import { useRef, useState } from 'react'

export default function PinInput({ value, onChange, error }) {
  const inputRefs = useRef([])
  const digits = (value || '').split('').concat(Array(6).fill('')).slice(0, 6)

  const handleChange = (index, e) => {
    const raw = e.target.value.replace(/\D/g, '')
    if (!raw) {
      const newDigits = [...digits]
      newDigits[index] = ''
      onChange(newDigits.join(''))
      return
    }
    const digit = raw[raw.length - 1]
    const newDigits = [...digits]
    newDigits[index] = digit
    onChange(newDigits.join(''))
    if (index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted.padEnd(6, '').slice(0, 6))
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium font-sans text-mahogany-700">6-digit PIN</label>
      <div className="flex gap-2 justify-center">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={`
              w-12 h-14 text-center text-xl font-display font-bold rounded-lg border-2
              text-mahogany-800 bg-white transition-all duration-150 outline-none
              focus:border-amber-500 focus:ring-2 focus:ring-amber-200
              ${error ? 'border-red-400' : d ? 'border-mahogany-400' : 'border-mahogany-200'}
            `}
          />
        ))}
      </div>
      {error && <p className="text-xs text-red-600 text-center font-sans">{error}</p>}
    </div>
  )
}
