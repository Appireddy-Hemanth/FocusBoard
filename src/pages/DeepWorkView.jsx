import { useEffect, useRef, useState } from 'react'
import { useTaskContext } from '../context/useTaskContext'

export default function DeepWorkView({ onExit }) {
  const { tasks, updateStatus, gamification, addActivity } = useTaskContext()
  const [selectedId, setSelectedId] = useState(() => localStorage.getItem('focusboard_deep_task') || '')
  const [distraction, setDistraction] = useState('')
  const [seconds, setSeconds] = useState(() => Number(localStorage.getItem('focusboard_deep_remaining') || 25 * 60))
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  const selected = tasks.find(task => task.id === selectedId)

  useEffect(() => {
    if (selectedId) localStorage.setItem('focusboard_deep_task', selectedId)
  }, [selectedId])

  useEffect(() => {
    localStorage.setItem('focusboard_deep_remaining', String(seconds))
  }, [seconds])

  useEffect(() => {
    if (!running) return
    intervalRef.current = window.setTimeout(() => {
      if (seconds <= 1) {
        setRunning(false)
        gamification.awardFocusSession()
        gamification.unlockAchievement('first-focus-session')
        addActivity('Completed a Deep Work session')
        setSeconds(25 * 60)
      } else {
        setSeconds(current => current - 1)
      }
    }, 1000)
    return () => window.clearTimeout(intervalRef.current)
  }, [running, seconds, gamification, addActivity])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) setRunning(false)
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  const completeTask = () => {
    if (!selected) return
    updateStatus(selected.id, 'Completed')
  }

  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0')
  const remainder = String(seconds % 60).padStart(2, '0')

  return (
    <main className="main view-main deep-work" id="deep-work">
      <header className="view-header">
        <div><p className="eyebrow">Distraction-free workspace</p><h1>Deep Work</h1></div>
        <button type="button" className="secondary-button" onClick={onExit}>Exit deep work</button>
      </header>
      <section className="deep-work-layout">
        <div className="deep-task-select">
          <label htmlFor="deep-task">Selected task</label>
          <select id="deep-task" value={selectedId} onChange={event => setSelectedId(event.target.value)}>
            <option value="">Choose a task</option>
            {tasks.filter(task => task.status !== 'Completed').map(task => (
              <option key={task.id} value={task.id}>{task.title}</option>
            ))}
          </select>
        </div>
        <div className="deep-timer" role="timer" aria-live="polite">
          <strong>{minutes}:{remainder}</strong>
          {selected && <span>{selected.title}</span>}
        </div>
        <div className="timer-actions">
          <button type="button" className="timer-main" onClick={() => setRunning(current => !current)}>{running ? 'Pause' : 'Start'}</button>
          <button type="button" className="secondary-button" onClick={() => setSeconds(25 * 60)}>Reset</button>
          <button type="button" className="create-button" onClick={completeTask} disabled={!selected}>Complete task</button>
        </div>
        <label className="distraction-note">Distraction note
          <textarea value={distraction} onChange={event => setDistraction(event.target.value)} placeholder="Capture a distraction without leaving focus mode" />
        </label>
      </section>
    </main>
  )
}
