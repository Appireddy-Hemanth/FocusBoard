function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function fromDateKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function addDays(dateKey, amount) {
  const date = fromDateKey(dateKey)
  date.setDate(date.getDate() + amount)
  return toDateKey(date)
}

function getWeekStart(dateKey) {
  const date = fromDateKey(dateKey)
  const offset = (date.getDay() + 6) % 7
  date.setDate(date.getDate() - offset)
  return toDateKey(date)
}

function getLocalTodayKey() {
  return toDateKey(new Date())
}

export function getHabitTargetPerWeek(habit = {}) {
  if (habit.frequency === 'Daily') return 7
  if (habit.frequency === 'Weekdays') return 5
  if (habit.frequency === 'Weekly') {
    const weekdays = [...new Set(habit.selectedWeekdays || [])]
      .filter(day => Number.isInteger(day) && day >= 0 && day <= 6)
    if (weekdays.length) return weekdays.length
    return 1
  }
  if (habit.frequency === 'Three times weekly') return 3
  const requestedTarget = Number(habit.targetPerWeek) || 3
  return Math.min(7, Math.max(1, Math.round(requestedTarget)))
}

export function isHabitDue(habit = {}, dateKey = getLocalTodayKey()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false
  if (habit.startDate && dateKey < habit.startDate) return false

  const day = fromDateKey(dateKey).getDay()
  if (habit.frequency === 'Weekdays') return day >= 1 && day <= 5
  if (habit.frequency === 'Weekly') {
    const weekdays = [...new Set(habit.selectedWeekdays || [])]
      .filter(value => Number.isInteger(value) && value >= 0 && value <= 6)
    return weekdays.length
      ? weekdays.includes(day)
      : day === (habit.startDate ? fromDateKey(habit.startDate).getDay() : day)
  }
  return true
}

function getWeeklyCompletions(completedDates, weekStart, habit) {
  const weekEnd = addDays(weekStart, 6)
  const startDate = habit.startDate || '0000-01-01'
  return completedDates.filter(date =>
    date >= weekStart && date <= weekEnd && date >= startDate,
  ).length
}

function isSuccessfulWeek(completedDates, weekStart, habit) {
  return getWeeklyCompletions(completedDates, weekStart, habit) >= getHabitTargetPerWeek(habit)
}

function calculateWeeklyStreak(completedDates, habit, todayKey) {
  const weekStarts = [...new Set(completedDates.map(getWeekStart))]
    .filter(weekStart => isSuccessfulWeek(completedDates, weekStart, habit))
    .sort()

  let longest = 0
  let run = 0
  let previousWeek = null
  for (const weekStart of weekStarts) {
    run = previousWeek && addDays(previousWeek, 7) === weekStart ? run + 1 : 1
    longest = Math.max(longest, run)
    previousWeek = weekStart
  }

  let cursorWeek = getWeekStart(todayKey)
  if (!isSuccessfulWeek(completedDates, cursorWeek, habit)) {
    cursorWeek = addDays(cursorWeek, -7)
  }
  let current = 0
  while (isSuccessfulWeek(completedDates, cursorWeek, habit)) {
    current += 1
    cursorWeek = addDays(cursorWeek, -7)
  }
  return { current, longest }
}

function getPreviousScheduledDate(dateKey, habit) {
  for (let offset = 1; offset <= 7; offset += 1) {
    const candidate = addDays(dateKey, -offset)
    if (isHabitDue(habit, candidate)) return candidate
  }
  return null
}

export function calculateStreak(completedDates = [], habit = {}, todayKey = getLocalTodayKey()) {
  const dates = [...new Set(completedDates)]
    .filter(date => /^\d{4}-\d{2}-\d{2}$/.test(date))
    .sort()
  if (!dates.length) return { current: 0, longest: 0 }

  if (habit.frequency === 'Weekly' || habit.frequency === 'Custom' || habit.frequency === 'Three times weekly') {
    return calculateWeeklyStreak(dates, habit, todayKey)
  }

  const scheduledDates = dates.filter(date => isHabitDue(habit, date))
  let longest = 0
  let run = 0
  let previousDate = null
  for (const date of scheduledDates) {
    run = previousDate && getPreviousScheduledDate(date, habit) === previousDate ? run + 1 : 1
    longest = Math.max(longest, run)
    previousDate = date
  }

  if (habit.startDate && todayKey < habit.startDate) return { current: 0, longest }
  let cursor = todayKey
  if (!dates.includes(cursor)) cursor = getPreviousScheduledDate(cursor, habit)
  let current = 0
  while (cursor && dates.includes(cursor)) {
    current += 1
    cursor = getPreviousScheduledDate(cursor, habit)
  }
  return { current, longest }
}

export function countRecentDays(completedDates = [], days, todayKey = getLocalTodayKey()) {
  const completions = new Set(completedDates)
  let count = 0
  for (let offset = 0; offset < days; offset += 1) {
    if (completions.has(addDays(todayKey, -offset))) count += 1
  }
  return count
}

export function getHabitProgress(completedDates = [], habit = {}, todayKey = getLocalTodayKey()) {
  const weekTarget = getHabitTargetPerWeek(habit)
  const monthTarget = Math.ceil(weekTarget * 30 / 7)
  const weekCount = countRecentDays(completedDates, 7, todayKey)
  const monthCount = countRecentDays(completedDates, 30, todayKey)
  return {
    weekCount,
    weekTarget,
    weekPercentage: Math.min(100, Math.round(weekCount / weekTarget * 100)),
    monthCount,
    monthTarget,
    monthPercentage: Math.min(100, Math.round(monthCount / monthTarget * 100)),
  }
}
