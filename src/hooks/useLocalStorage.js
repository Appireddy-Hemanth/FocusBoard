import { useEffect, useState } from 'react'

/**
 * Safely reads and persists a state value in browser localStorage.
 * Invalid JSON and storage access failures fall back to the supplied initial value.
 *
 * @template T
 * @param {string} key
 * @param {T} initialValue
 * @param {(value: unknown) => boolean} [validate]
 * @returns {[T, import('react').Dispatch<import('react').SetStateAction<T>>]}
 */
export function useLocalStorage(key, initialValue, validate = () => true) {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const savedValue = window.localStorage.getItem(key)
      if (savedValue === null) return initialValue

      const parsedValue = JSON.parse(savedValue)
      return validate(parsedValue) ? parsedValue : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage may be unavailable in private or restricted browser contexts.
    }
  }, [key, value])

  return [value, setValue]
}
