import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTaskContext } from '../context/useTaskContext'

export default function CalendarView({ onEditTask, onCreateDate }) {
  const { tasks } = useTaskContext()
  const [cursor, setCursor] = useState(() => new Date())
  const [mode, setMode] = useState('month')

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const [todayKey] = useState(() => new Date().toISOString().slice(0, 10))
  const [selectedDate, setSelectedDate] = useState(todayKey)

  const days = useMemo(() => {
    if (mode === 'week') {
      const start = new Date(cursor)
      start.setDate(cursor.getDate() - ((cursor.getDay() + 6) % 7))
      return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(start)
        date.setDate(start.getDate() + index)
        return date
      })
    }

    const start = new Date(year, month, 1)
    const gridStart = new Date(start)
    gridStart.setDate(start.getDate() - ((start.getDay() + 6) % 7))
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart)
      date.setDate(gridStart.getDate() + index)
      return date
    })
  }, [cursor, mode, month, year])

  const navigate = direction => {
    const next = new Date(cursor)
    if (mode === 'week') next.setDate(next.getDate() + direction * 7)
    else next.setMonth(next.getMonth() + direction)
    setCursor(next)
  }

  const dateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

  return (
    <main className="main view-main" id="calendar">
      <header className="view-header calendar-header">
        <div><p className="eyebrow">Planning</p><h1>Calendar</h1></div>
        <div className="calendar-actions">
          {onCreateDate && (
            <button type="button" className="secondary-button" onClick={() => onCreateDate(selectedDate)}>
              Create for date
            </button>
          )}
          <button type="button" className="secondary-button" onClick={() => setMode(mode === 'month' ? 'week' : 'month')}>
            {mode === 'month' ? 'Week view' : 'Month view'}
          </button>
          <button type="button" className="icon-button" onClick={() => navigate(-1)} aria-label="Previous period"><ChevronLeft size={18} /></button>
          <button type="button" className="icon-button" onClick={() => navigate(1)} aria-label="Next period"><ChevronRight size={18} /></button>
        </div>
      </header>
      <section className="calendar-panel" aria-label={`${mode} calendar`}>
        <div className="calendar-period">
          {mode === 'month'
            ? cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            : `Week of ${cursor.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
        </div>
        <div className={`calendar-grid ${mode}`}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(label => <div className="calendar-weekday" key={label}>{label}</div>)}
          {days.map(date => {
            const key = dateKey(date)
            const dayTasks = tasks.filter(task => task.dueDate === key)
            return (
              <div
                className={`calendar-day ${date.getMonth() !== month && mode === 'month' ? 'outside' : ''} ${key === todayKey ? 'today' : ''}`}
                key={key}
              >
                <button
                  type="button"
                  className="calendar-day-select"
                  onClick={() => setSelectedDate(key)}
                  aria-label={`Select ${key}`}
                >
                  <time dateTime={key}>{date.getDate()}</time>
                </button>
                <div className="calendar-tasks">
                  {dayTasks.map(task => (
                    <button
                      type="button"
                      key={task.id}
                      className={`calendar-task ${task.status === 'Completed' ? 'completed' : ''} ${task.dueDate < todayKey && task.status !== 'Completed' ? 'overdue' : ''}`}
                      onClick={() => onEditTask(task)}
                    >
                      {task.title}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
