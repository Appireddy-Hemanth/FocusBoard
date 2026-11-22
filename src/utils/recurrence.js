export function calculateNextOccurrence(task, completedDateKey) {
  if (!task || task.recurrence === 'None') return null
  const base = completedDateKey
    ? new Date(`${completedDateKey}T00:00:00`)
    : task.dueDate
      ? new Date(`${task.dueDate}T00:00:00`)
      : new Date()
  if (Number.isNaN(base.getTime())) return null

  if (task.recurrence === 'Daily') {
    base.setDate(base.getDate() + 1)
  } else if (task.recurrence === 'Weekly') {
    const weekdays = Array.isArray(task.recurrenceWeekdays)
      ? task.recurrenceWeekdays.map(Number).filter(day => day >= 0 && day <= 6)
      : []
    if (weekdays.length) {
      const nextWeekday = () => {
        for (let offset = 1; offset <= 7; offset += 1) {
          const candidate = new Date(base)
          candidate.setDate(base.getDate() + offset)
          if (weekdays.includes(candidate.getDay())) return candidate
        }
        return null
      }
      const selected = nextWeekday()
      if (selected) return `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, '0')}-${String(selected.getDate()).padStart(2, '0')}`
    }
    base.setDate(base.getDate() + 7)
  } else if (task.recurrence === 'Monthly') {
    const originalDay = base.getDate()
    base.setDate(1)
    base.setMonth(base.getMonth() + 1)
    const lastDay = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate()
    base.setDate(Math.min(originalDay, lastDay))
  } else {
    return null
  }

  return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, '0')}-${String(base.getDate()).padStart(2, '0')}`
}

export function getRecurrenceId(task) {
  return task.recurrenceId || task.id
}
