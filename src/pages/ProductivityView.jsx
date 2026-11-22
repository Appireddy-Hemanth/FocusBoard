import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { useTaskContext } from '../context/useTaskContext'

export default function ProductivityView() {
  const { tasks, activity, addActivity, gamification } = useTaskContext()
  const [workMinutes, setWorkMinutes] = useState(() => Number(localStorage.getItem('focusboard_pomodoro_work') || 25))
  const [breakMinutes, setBreakMinutes] = useState(() => Number(localStorage.getItem('focusboard_pomodoro_break') || 5))
  const [mode, setMode] = useState(() => localStorage.getItem('focusboard_pomodoro_mode') || 'work')
  const [seconds, setSeconds] = useState(() => Number(localStorage.getItem('focusboard_pomodoro_remaining') || workMinutes * 60))
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('focusboard_pomodoro_work', String(workMinutes))
  }, [workMinutes])

  useEffect(() => {
    localStorage.setItem('focusboard_pomodoro_break', String(breakMinutes))
  }, [breakMinutes])

  useEffect(() => {
    localStorage.setItem('focusboard_pomodoro_remaining', String(seconds))
  }, [seconds])

  useEffect(() => {
    localStorage.setItem('focusboard_pomodoro_mode', mode)
  }, [mode])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) setRunning(false)
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  useEffect(() => {
    if (!running) return
    intervalRef.current = window.setTimeout(() => {
      if (seconds <= 1) {
        setRunning(false)
        if (mode === 'work') {
          addActivity('Completed a Pomodoro focus session')
          gamification.awardFocusSession()
          gamification.unlockAchievement('first-focus-session')
          const sessions = Number(localStorage.getItem('focusboard_focus_sessions') || 0) + 1
          localStorage.setItem('focusboard_focus_sessions', String(sessions))
          try {
            const records = JSON.parse(localStorage.getItem('focusboard_focus_sessions_v1') || '[]')
            const next = Array.isArray(records) ? records : []
            localStorage.setItem('focusboard_focus_sessions_v1', JSON.stringify([
              ...next,
              { id: `session-${Date.now()}`, completedAt: new Date().toISOString(), minutes: workMinutes },
            ].slice(-500)))
          } catch {
            localStorage.setItem('focusboard_focus_sessions_v1', JSON.stringify([
              { id: `session-${Date.now()}`, completedAt: new Date().toISOString(), minutes: workMinutes },
            ]))
          }
          setMode('break')
          setSeconds(breakMinutes * 60)
        } else {
          setMode('work')
          setSeconds(workMinutes * 60)
        }
      } else {
        setSeconds(seconds - 1)
      }
    }, 1000)
    return () => window.clearTimeout(intervalRef.current)
  }, [running, seconds, mode, workMinutes, breakMinutes, addActivity, gamification])

  const resetTimer = () => {
    setRunning(false)
    setMode('work')
    setSeconds(workMinutes * 60)
  }

  const switchMode = nextMode => {
    setRunning(false)
    setMode(nextMode)
    setSeconds((nextMode === 'work' ? workMinutes : breakMinutes) * 60)
  }

  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0')
  const remainder = String(seconds % 60).padStart(2, '0')
  const [today] = useState(() => new Date().toISOString().slice(0, 10))
  const completedToday = tasks.filter(task =>
    task.status === 'Completed' && (task.updatedAt || '').slice(0, 10) === today,
  ).length
  const totalSessions = Number(localStorage.getItem('focusboard_focus_sessions') || 0)

  return (
    <main className="main view-main" id="focus">
      <header className="view-header">
        <div><p className="eyebrow">Productivity</p><h1>Focus Timer</h1></div>
      </header>
      <section className="focus-layout">
        <article className="pomodoro-card">
          <div className="pomodoro-tabs">
            <button type="button" className={mode === 'work' ? 'active' : ''} onClick={() => switchMode('work')}>Focus</button>
            <button type="button" className={mode === 'break' ? 'active' : ''} onClick={() => switchMode('break')}>Break</button>
          </div>
          <div className="timer-ring" role="timer" aria-live="polite">
            <strong>{minutes}:{remainder}</strong>
            <span>{mode === 'work' ? 'Focus session' : 'Short break'}</span>
          </div>
          <div className="timer-actions">
            <button type="button" className="timer-main" onClick={() => setRunning(current => !current)}>
              {running ? <Pause size={18} /> : <Play size={18} />}
              {running ? 'Pause' : 'Start'}
            </button>
            <button type="button" className="icon-button" onClick={resetTimer} aria-label="Reset timer"><RotateCcw size={18} /></button>
          </div>
          <div className="timer-config">
            <label>Focus minutes
              <input type="number" min="1" max="180" value={workMinutes} onChange={event => {
                const value = Math.max(1, Number(event.target.value) || 1)
                setWorkMinutes(value)
                if (mode === 'work' && !running) setSeconds(value * 60)
              }} />
            </label>
            <label>Break minutes
              <input type="number" min="1" max="60" value={breakMinutes} onChange={event => {
                const value = Math.max(1, Number(event.target.value) || 1)
                setBreakMinutes(value)
                if (mode === 'break' && !running) setSeconds(value * 60)
              }} />
            </label>
          </div>
        </article>

        <article className="activity-card">
          <div className="insight-heading"><div><span>Daily summary</span><strong>Today</strong></div></div>
          <div className="summary-metrics">
            <div><strong>{completedToday}</strong><span>Completed</span></div>
            <div><strong>{totalSessions}</strong><span>Focus sessions</span></div>
          </div>
          <h3>Recent activity</h3>
          <div className="activity-list">
            {activity.slice(0, 8).map(item => (
              <div key={item.id}>
                <span>{item.message}</span>
                <time dateTime={item.timestamp}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
              </div>
            ))}
            {activity.length === 0 && <p>No activity yet.</p>}
          </div>
        </article>
      </section>
    </main>
  )
}
