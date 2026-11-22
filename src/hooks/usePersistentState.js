import { useEffect, useState } from 'react'

export function usePersistentState(key, initialValue, validate = value => value !== null) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key)
      if (saved === null) return initialValue
      const parsed = JSON.parse(saved)
      return validate(parsed) ? parsed : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Keep the feature usable when storage is unavailable.
    }
  }, [key, value])

  return [value, setValue]
}
