import { useMemo, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useTaskContext } from '../context/useTaskContext'
import { calculateStreak, getHabitProgress } from '../utils/habitUtils'

const STORAGE_KEY = 'focusboard_habits_v1'

function toLocalDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function loadHabits() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(parsed)
      ? parsed.map(habit => ({
          ...habit,
          description: habit.description || '',
          category: habit.category || 'Personal',
          frequency: habit.frequency === 'Three times weekly'
            ? 'Custom'
            : ['Daily', 'Weekdays', 'Weekly', 'Custom'].includes(habit.frequency)
              ? habit.frequency
              : 'Daily',
          targetPerWeek: habit.frequency === 'Three times weekly'
            ? 3
            : Math.min(7, Math.max(1, Number(habit.targetPerWeek) || 3)),
          preferredTime: habit.preferredTime || 'Morning',
          startDate: habit.startDate || toLocalDateKey(),
          completedDates: Array.isArray(habit.completedDates)
            ? [...new Set(habit.completedDates.filter(date => /^\d{4}-\d{2}-\d{2}$/.test(date)))]
            : [],
          selectedWeekdays: Array.isArray(habit.selectedWeekdays)
            ? [...new Set(habit.selectedWeekdays.filter(day => Number.isInteger(day) && day >= 0 && day <= 6))]
            : [],
        }))
      : []
  } catch {
    return []
  }
}


const EMPTY_HABIT = {
  name: '',
  description: '',
  category: 'Personal',
  frequency: 'Daily',
  selectedWeekdays: [],
  targetPerWeek: 3,
  preferredTime: 'Morning',
  startDate: toLocalDateKey(),
}

export default function HabitTrackerView() {
  const { gamification } = useTaskContext()
  const [habits, setHabits] = useState(loadHabits)
  const [form, setForm] = useState(EMPTY_HABIT)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [today] = useState(() => toLocalDateKey())

  const saveHabits = next => {
    setHabits(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Keep habit state usable for the current session.
    }
  }

  const submitHabit = event => {
    event.preventDefault()
    const name = form.name.trim()
    if (!name) {
      setError('Please enter a habit name.')
      return
    }
    setError('')
    if (editingId) {
      saveHabits(habits.map(habit => habit.id === editingId
        ? {
            ...habit,
            ...form,
            name,
            description: form.description.trim(),
            selectedWeekdays: form.frequency === 'Weekly' ? form.selectedWeekdays : [],
            targetPerWeek: Math.min(7, Math.max(1, Number(form.targetPerWeek) || 3)),
          }
        : habit))
    } else {
      saveHabits([...habits, {
        ...form,
        name,
        description: form.description.trim(),
        selectedWeekdays: form.frequency === 'Weekly' ? form.selectedWeekdays : [],
        targetPerWeek: Math.min(7, Math.max(1, Number(form.targetPerWeek) || 3)),
        id: globalThis.crypto?.randomUUID?.() || `habit-${Date.now()}`,
        completedDates: [],
      }])
    }
    setForm(EMPTY_HABIT)
    setEditingId(null)
  }

  const toggleHabit = id => {
    saveHabits(habits.map(habit => {
      if (habit.id !== id) return habit
      const completedDates = habit.completedDates || []
      if (completedDates.includes(today)) {
        return { ...habit, completedDates: completedDates.filter(date => date !== today) }
      }
      gamification.awardHabitCompletion(id, today)
      const nextDates = [...completedDates, today]
      if (calculateStreak(nextDates, habit, today).longest >= 7) {
        gamification.unlockAchievement('seven-day-habit-streak')
      }
      return { ...habit, completedDates: nextDates }
    }))
  }

  const editHabit = habit => {
    setEditingId(habit.id)
    setForm({
      name: habit.name,
      description: habit.description || '',
      category: habit.category || 'Personal',
      frequency: habit.frequency || 'Daily',
      selectedWeekdays: Array.isArray(habit.selectedWeekdays) ? habit.selectedWeekdays : [],
      targetPerWeek: habit.targetPerWeek || 3,
      preferredTime: habit.preferredTime || 'Morning',
      startDate: habit.startDate || today,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm({ ...EMPTY_HABIT, startDate: today })
  }

  const removeHabit = id => saveHabits(habits.filter(habit => habit.id !== id))

  const longestAcrossHabits = useMemo(
    () => habits.reduce(
      (max, habit) => Math.max(max, calculateStreak(habit.completedDates, habit, today).longest),
      0,
    ),
    [habits, today],
  )

  return (
    <main className="main view-main" id="habits">
      <header className="view-header">
        <div><p className="eyebrow">Consistency</p><h1>Habit Tracker</h1></div>
        {longestAcrossHabits > 0 && <div className="habit-streak-score"><strong>{longestAcrossHabits}</strong><span>Longest streak</span></div>}
      </header>
      <section className="habit-layout">
        <form className="habit-form habit-meta-form" onSubmit={submitHabit}>
          <h2>{editingId ? 'Edit habit' : 'Create habit'}</h2>
          <label htmlFor="habit-name">Habit name</label>
          <input
            id="habit-name"
            value={form.name}
            onChange={event => { setForm(current => ({ ...current, name: event.target.value })); if (error) setError('') }}
            placeholder="Read for 30 minutes"
            aria-required="true"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'habit-name-error' : undefined}
          />
          {error && <small id="habit-name-error" className="form-error" role="alert">{error}</small>}
          <label htmlFor="habit-description">Description</label>
          <input id="habit-description" value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} placeholder="Optional details" />
          <div className="habit-meta-grid">
            <label>Category
              <select value={form.category} onChange={event => setForm(current => ({ ...current, category: event.target.value }))}>
                <option>Personal</option><option>Health</option><option>Learning</option><option>Career</option><option>Mindfulness</option>
              </select>
            </label>
            <label>Target frequency
              <select value={form.frequency} onChange={event => setForm(current => {
                const frequency = event.target.value
                const startDate = new Date(`${current.startDate}T00:00:00`)
                return {
                  ...current,
                  frequency,
                  selectedWeekdays: frequency === 'Weekly' && current.selectedWeekdays.length === 0
                    ? [startDate.getDay()]
                    : current.selectedWeekdays,
                }
              })}>
                <option>Daily</option><option>Weekdays</option><option>Weekly</option><option>Custom</option>
              </select>
            </label>
            {form.frequency === 'Custom' && (
              <label htmlFor="habit-target-per-week">Completions per week
                <input
                  id="habit-target-per-week"
                  type="number"
                  min="1"
                  max="7"
                  value={form.targetPerWeek}
                  onChange={event => setForm(current => ({
                    ...current,
                    targetPerWeek: Math.min(7, Math.max(1, Number(event.target.value) || 1)),
                  }))}
                />
              </label>
            )}
            <label>Preferred time
              <select value={form.preferredTime} onChange={event => setForm(current => ({ ...current, preferredTime: event.target.value }))}>
                <option>Morning</option><option>Afternoon</option><option>Evening</option><option>Any time</option>
              </select>
            </label>
            <label>Start date
              <input type="date" value={form.startDate} onChange={event => setForm(current => ({ ...current, startDate: event.target.value }))} />
            </label>
            {form.frequency === 'Weekly' && (
              <fieldset className="habit-weekday-selector">
                <legend>Repeat on</legend>
                {[
                  ['Sun', 0],
                  ['Mon', 1],
                  ['Tue', 2],
                  ['Wed', 3],
                  ['Thu', 4],
                  ['Fri', 5],
                  ['Sat', 6],
                ].map(([label, day]) => (
                  <label key={day}>
                    <input
                      type="checkbox"
                      checked={form.selectedWeekdays.includes(day)}
                      onChange={event => setForm(current => ({
                        ...current,
                        selectedWeekdays: event.target.checked
                          ? [...new Set([...current.selectedWeekdays, day])]
                          : current.selectedWeekdays.filter(selected => selected !== day),
                      }))}
                    />
                    {label}
                  </label>
                ))}
              </fieldset>
            )}
          </div>
          <div className="habit-form-actions">
            {editingId && <button type="button" className="cancel-button" onClick={cancelEdit}>Cancel</button>}
            <button type="submit" className="create-button">{editingId ? 'Save habit' : 'Add habit'}</button>
          </div>
        </form>

        <div className="habit-grid">
          {habits.map(habit => {
            const completedDates = habit.completedDates || []
            const completed = completedDates.includes(today)
            const streak = calculateStreak(completedDates, habit, today)
            const progress = getHabitProgress(completedDates, habit, today)
            return (
              <article className={`habit-card ${completed ? 'completed' : ''}`} key={habit.id}>
                <button type="button" className="habit-toggle" onClick={() => toggleHabit(habit.id)} aria-pressed={completed} aria-label={`${completed ? 'Undo' : 'Complete'} ${habit.name}`}>
                  <span>{completed ? '✓' : ''}</span>
                </button>
                <div className="habit-card-main">
                  <h2>{habit.name}</h2>
                  {habit.description && <p>{habit.description}</p>}
                  <small>
                    {habit.category} · {habit.frequency}
                    {habit.frequency === 'Custom' && ` · ${habit.targetPerWeek || 3}×/week`}
                    {habit.frequency === 'Weekly' && habit.selectedWeekdays?.length > 0
                      && ` · ${habit.selectedWeekdays.length} day${habit.selectedWeekdays.length === 1 ? '' : 's'}/week`}
                    {' · '}{habit.preferredTime}
                  </small>
                  <div className="habit-progress-row">
                    <span>This week</span><strong>{progress.weekCount}/{progress.weekTarget}</strong>
                    <span>30 days</span><strong>{progress.monthCount}/{progress.monthTarget}</strong>
                  </div>
                  <div className="habit-progress-bars">
                    <div><span style={{ width: `${progress.weekPercentage}%` }} /></div>
                    <div><span style={{ width: `${progress.monthPercentage}%` }} /></div>
                  </div>
                  <div className="habit-history" aria-label={`Recent completion history for ${habit.name}`}>
                    {Array.from({ length: 14 }, (_, index) => {
                      const date = new Date()
                      date.setDate(date.getDate() - (13 - index))
                      const key = toLocalDateKey(date)
                      return <span key={key} className={completedDates.includes(key) ? 'done' : ''} title={key} />
                    })}
                  </div>
                  <p>{completed ? 'Completed today' : 'Not completed today'} · {streak.current} current · {streak.longest} longest</p>
                </div>
                <div className="habit-actions">
                  <button type="button" onClick={() => editHabit(habit)} aria-label={`Edit habit ${habit.name}`}><Pencil size={16} /></button>
                  <button type="button" onClick={() => removeHabit(habit.id)} aria-label={`Delete habit ${habit.name}`}><Trash2 size={16} /></button>
                </div>
              </article>
            )
          })}
          {habits.length === 0 && (
            <article className="project-empty-card">
              <span aria-hidden="true" style={{ fontSize: 28 }}>↻</span>
              <h2>No habits yet</h2>
              <p>Create a habit and check it off daily.</p>
            </article>
          )}
        </div>
      </section>
    </main>
  )
}
