import { useState } from 'react'
import { useTaskContext } from '../context/useTaskContext'

export default function WeeklyReviewView() {
  const { tasks, activity } = useTaskContext()
  const [weekAgo] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 7)
    return date
  })

  const completed = tasks.filter(task =>
    task.status === 'Completed' &&
    (task.updatedAt || '') >= weekAgo.toISOString().slice(0, 10),
  )
  const overdue = tasks.filter(task =>
    task.status !== 'Completed' &&
    task.dueDate &&
    task.dueDate < new Date().toISOString().slice(0, 10),
  )
  const focusSessions = activity.filter(item =>
    item.message?.includes('Pomodoro') || item.message?.includes('Deep Work'),
  )

  return (
    <main className="main view-main" id="weekly-review">
      <header className="view-header"><div><p className="eyebrow">Last 7 days</p><h1>Weekly Productivity Review</h1></div></header>
      <section className="weekly-review-grid">
        <article className="review-card"><span>Completed</span><strong>{completed.length}</strong></article>
        <article className="review-card"><span>Overdue</span><strong>{overdue.length}</strong></article>
        <article className="review-card"><span>Focus sessions</span><strong>{focusSessions.length}</strong></article>
        <article className="review-card wide">
          <h2>Recommendations</h2>
          <ul>
            {overdue.length > 0 && <li>Resolve {overdue.length} overdue task{overdue.length === 1 ? '' : 's'} before adding new work.</li>}
            {completed.length >= 5
              ? <li>Maintain your current momentum with one planned focus block per day.</li>
              : <li>Set smaller daily completion targets to build a more consistent weekly pace.</li>}
            {focusSessions.length === 0
              ? <li>Schedule at least one 25-minute focus session this week.</li>
              : <li>You completed {focusSessions.length} focus session{focusSessions.length === 1 ? '' : 's'}; preserve that rhythm.</li>}
          </ul>
        </article>
      </section>
    </main>
  )
}
