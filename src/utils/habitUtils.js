export function calculateStreak(completedDates = []) {
  const dates = [...new Set(completedDates)].sort()
  if (!dates.length) return { current: 0, longest: 0 }

  let longest = 0
  let run = 0
  let previous = null
  for (const dateKey of dates) {
    const current = new Date(`${dateKey}T00:00:00`)
    if (previous) {
      const expected = new Date(previous)
      expected.setDate(expected.getDate() + 1)
      run = current.getTime() === expected.getTime() ? run + 1 : 1
    } else {
      run = 1
    }
    longest = Math.max(longest, run)
    previous = current
  }

  const today = new Date()
  const toKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  let cursor = new Date(today)
  let current = 0
  if (!dates.includes(toKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  while (dates.includes(toKey(cursor))) {
    current += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return { current, longest }
}

export function countRecentDays(completedDates = [], days) {
  const today = new Date()
  let count = 0
  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - offset)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    if (completedDates.includes(key)) count += 1
  }
  return count
}
