import { useEffect, useRef, useState } from 'react'
import { Bell, Plus, Search } from 'lucide-react'
import { useTaskContext } from '../context/useTaskContext'

export default function Header({ onAdd, search, onSearch }) {
  const { tasks, overdueCount } = useTaskContext()
  const [open, setOpen] = useState(false)
  const [clearedSignature, setClearedSignature] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('focusboard_notifications_cleared') || '[]')
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })
  const panelRef = useRef(null)
  const notificationCandidates = [
    overdueCount > 0
      ? { id: 'overdue', title: `${overdueCount} overdue task${overdueCount === 1 ? '' : 's'}`, detail: 'Review deadlines and update task status.' }
      : null,
    tasks.filter(task => task.status === 'In progress').length > 0
      ? { id: 'progress', title: 'Active work in progress', detail: `${tasks.filter(task => task.status === 'In progress').length} task${tasks.filter(task => task.status === 'In progress').length === 1 ? '' : 's'} need attention.` }
      : null,
  ].filter(Boolean)
  const notifications = notificationCandidates.filter(notification =>
    !clearedSignature.includes(`${notification.title}|${notification.detail}`),
  )

  const clearNotifications = () => {
    const next = notificationCandidates.map(notification =>
      `${notification.title}|${notification.detail}`,
    )
    setClearedSignature(next)
    try {
      localStorage.setItem('focusboard_notifications_cleared', JSON.stringify(next))
    } catch {
      // Clear state remains valid for the current session.
    }
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const closeOnOutsideClick = event => {
      if (!panelRef.current?.contains(event.target)) setOpen(false)
    }
    const closeOnEscape = event => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <header className="topbar">
      <div className="header-greeting"><p className="eyebrow">Monday, November 21</p><h1>Good morning, Alex</h1></div>
      <label className="header-search">
        <Search size={18} aria-hidden="true" />
        <span className="sr-only">Search tasks</span>
        <input
          value={search}
          onChange={event => onSearch(event.target.value)}
          placeholder="Search tasks..."
          aria-label="Search tasks"
        />
      </label>
      <div className="header-actions" ref={panelRef}>
        <button
          type="button"
          className="icon-button"
          aria-label="Notifications"
          aria-expanded={open}
          aria-haspopup="dialog"
          title="Notifications"
          onClick={() => setOpen(current => !current)}
        >
          <Bell size={19} />
          {notifications.length > 0 && <span className="notification-dot" />}
        </button>
        {open && (
          <section className="notification-panel" role="dialog" aria-label="Notifications">
            <header>
              <strong>Notifications</strong>
              <span>{notifications.length}</span>
              {notifications.length > 0 && (
                <button type="button" className="notification-clear" onClick={clearNotifications}>
                  Clear all
                </button>
              )}
            </header>
            {notifications.map(notification => (
              <article key={notification.id}>
                <strong>{notification.title}</strong>
                <p>{notification.detail}</p>
              </article>
            ))}
            {notifications.length === 0 && <p className="notification-empty">You are all caught up.</p>}
          </section>
        )}
        <button type="button" className="add-button" onClick={onAdd} aria-label="Create Task" title="Create Task"><Plus size={18} /><span>Create Task</span></button>
      </div>
    </header>
  )
}
