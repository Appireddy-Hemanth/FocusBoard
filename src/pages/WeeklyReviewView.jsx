import { useState } from 'react'
import { useTaskContext } from '../context/useTaskContext'
import { getHabitProgress } from '../utils/habitUtils'
import { readFocusSessions } from '../utils/focusSessions'

const HABITS_STORAGE_KEY = 'focusboard_habits_v1'

function toLocalDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function readHabits() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HABITS_STORAGE_KEY) || '[]')
    return Array.isArray(parsed)
      ? parsed.filter(habit => habit && Array.isArray(habit.completedDates))
      : []
  } catch {
    return []
  }
}

export default function WeeklyReviewView() {
  const { tasks } = useTaskContext()
  const [reviewPeriod] = useState(() => {
    const today = new Date()
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today)
      date.setDate(today.getDate() - (6 - index))
      return {
        dateKey: toLocalDateKey(date),
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      }
    })
    return {
      todayKey: toLocalDateKey(today),
      weekStartKey: days[0].dateKey,
      days,
    }
  })
  const { todayKey, weekStartKey } = reviewPeriod

  const completed = tasks.filter(task => {
    const completedDate = (task.completedAt || task.updatedAt || '').slice(0, 10)
    return task.status === 'Completed' && completedDate >= weekStartKey && completedDate <= todayKey
  })
  const overdue = tasks.filter(task =>
    task.status !== 'Completed' && task.dueDate && task.dueDate < todayKey,
  )
  const focusSessions = readFocusSessions().filter(record => {
    const dateKey = record.completedAt.slice(0, 10)
    return dateKey >= weekStartKey && dateKey <= todayKey
  })
  const focusMinutes = focusSessions.reduce((sum, record) => sum + record.minutes, 0)
  const habitProgress = readHabits().map(habit =>
    getHabitProgress(habit.completedDates, habit, todayKey),
  )
  const habitCheckIns = habitProgress.reduce((sum, progress) => sum + progress.weekCount, 0)
  const habitTarget = habitProgress.reduce((sum, progress) => sum + progress.weekTarget, 0)
  const habitCompletionRate = habitTarget
    ? Math.min(100, Math.round(habitCheckIns / habitTarget * 100))
    : 0

  const dailyTrend = reviewPeriod.days.map(({ dateKey, label }) => {
    return {
      dateKey,
      label,
      completed: completed.filter(task =>
        (task.completedAt || task.updatedAt || '').slice(0, 10) === dateKey,
      ).length,
      focusMinutes: focusSessions
        .filter(record => record.completedAt.slice(0, 10) === dateKey)
        .reduce((sum, record) => sum + record.minutes, 0),
    }
  })

  return (
    <main className="main view-main" id="weekly-review">
      <header className="view-header">
        <div><p className="eyebrow">Last 7 days</p><h1>Weekly Productivity Review</h1></div>
      </header>
      <section className="weekly-review-grid" aria-label="Weekly productivity summary">
        <article className="review-card"><span>Completed tasks</span><strong>{completed.length}</strong></article>
        <article className="review-card"><span>Overdue tasks</span><strong>{overdue.length}</strong></article>
        <article className="review-card"><span>Focus sessions</span><strong>{focusSessions.length}</strong></article>
        <article className="review-card"><span>Focus time</span><strong>{focusMinutes} min</strong></article>
        <article className="review-card"><span>Habit check-ins</span><strong>{habitCheckIns} / {habitTarget}</strong></article>
        <article className="review-card"><span>Habit goal progress</span><strong>{habitCompletionRate}%</strong></article>
        <article className="review-card wide">
          <h2>Daily trend</h2>
          <ul className="weekly-trend-list">
            {dailyTrend.map(day => (
              <li key={day.dateKey}>
                <span>{day.label}</span>
                <span>{day.completed} task{day.completed === 1 ? '' : 's'} completed</span>
                <span>{day.focusMinutes} min focus</span>
              </li>
            ))}
          </ul>
        </article>
        <article className="review-card wide">
          <h2>Recommendations</h2>
          <ul>
            {overdue.length > 0 && <li>Review {overdue.length} overdue task{overdue.length === 1 ? '' : 's'} before adding new work.</li>}
            {completed.length >= 5
              ? <li>You completed {completed.length} tasks; keep protecting time for focused work.</li>
              : <li>Break larger tasks into smaller actions to make weekly progress easier to sustain.</li>}
            {focusSessions.length === 0
              ? <li>Schedule a focus block and use the timer to record a session.</li>
              : <li>You recorded {focusMinutes} focus minutes across {focusSessions.length} session{focusSessions.length === 1 ? '' : 's'}.</li>}
            {habitTarget > 0 && habitCompletionRate < 100
              && <li>Complete {Math.max(0, habitTarget - habitCheckIns)} more habit check-in{habitTarget - habitCheckIns === 1 ? '' : 's'} to meet this week's targets.</li>}
          </ul>
        </article>
      </section>
    </main>
  )
}
