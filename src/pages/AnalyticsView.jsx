import { useTaskContext } from '../context/useTaskContext'
import { useState } from 'react'

export default function AnalyticsView() {
  const {
    tasks,
    totalCount,
    completedCount,
    inProgressCount,
    pendingCount,
    overdueCount,
    completionPercentage,
    priorityDistribution,
  } = useTaskContext()
  const [period, setPeriod] = useState('30')

  const [periodAnchor] = useState(() => new Date())
  const periodStart = new Date(periodAnchor)
  if (period === '7') periodStart.setDate(periodStart.getDate() - 7)
  if (period === '30') periodStart.setDate(periodStart.getDate() - 30)
  if (period === '90') periodStart.setDate(periodStart.getDate() - 90)
  const periodKey = period === 'all' ? '' : `${periodStart.getFullYear()}-${String(periodStart.getMonth() + 1).padStart(2, '0')}-${String(periodStart.getDate()).padStart(2, '0')}`
  const periodTasks = period === 'all'
    ? tasks
    : tasks.filter(task => (task.updatedAt || '') >= periodKey)
  const periodCompleted = periodTasks.filter(task => task.status === 'Completed')
  const periodEstimatedMinutes = periodTasks.reduce(
    (sum, task) => sum + (Number(task.estimatedMinutes) || 0),
    0,
  )
  const periodActualMinutes = periodTasks.reduce(
    (sum, task) => sum + (Number(task.actualMinutes) || 0),
    0,
  )
  const estimationAccuracy = periodEstimatedMinutes
    ? Math.round((1 - Math.abs(periodEstimatedMinutes - periodActualMinutes) / periodEstimatedMinutes) * 100)
    : 0

  const focusSessions = (() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('focusboard_focus_sessions_v1') || '[]')
      if (!Array.isArray(parsed)) return 0
      return period === 'all'
        ? parsed.length
        : parsed.filter(record => (record.completedAt || '').slice(0, 10) >= periodKey).length
    } catch {
      return 0
    }
  })()

  const focusMinutes = (() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('focusboard_focus_sessions_v1') || '[]')
      if (!Array.isArray(parsed)) return 0
      const filtered = period === 'all'
        ? parsed
        : parsed.filter(record => (record.completedAt || '').slice(0, 10) >= periodKey)
      return filtered.reduce((sum, record) => sum + (Number(record.minutes) || 0), 0)
    } catch {
      return 0
    }
  })()

  const heatmap = Array.from({ length: 35 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (34 - index))
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const count = tasks.filter(task =>
      task.status === 'Completed' && (task.updatedAt || '').slice(0, 10) === key,
    ).length
    return { key, count }
  })

  const categoryCounts = [...new Set(tasks.map(task => task.category))].map(category => ({
    category,
    count: tasks.filter(task => task.category === category).length,
  }))
  const maxCategory = Math.max(1, ...categoryCounts.map(item => item.count))

  return (
    <main className="main view-main" id="analytics">
      <header className="view-header">
        <div><p className="eyebrow">Performance</p><h1>Analytics</h1></div>
        <label className="analytics-period">Period
          <select value={period} onChange={event => setPeriod(event.target.value)}>
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
            <option value="all">All time</option>
          </select>
        </label>
      </header>
      <section className="analytics-grid">
        <article className="analytics-card analytics-summary">
          <span>Completion rate</span>
          <strong>{completionPercentage}%</strong>
          <div className="analytics-progress"><span style={{ width: `${completionPercentage}%` }} /></div>
        </article>
        {[
          ['Total', totalCount],
          ['Pending', pendingCount],
          ['In progress', inProgressCount],
          ['Completed', completedCount],
          ['Overdue', overdueCount],
        ].map(([label, count]) => (
          <article className="analytics-card analytics-count" key={label}>
            <span>{label}</span><strong>{count}</strong>
          </article>
        ))}
        <article className="analytics-card analytics-count">
          <span>Completed in period</span><strong>{periodCompleted.length}</strong>
        </article>
        <article className="analytics-card analytics-count">
          <span>Focus sessions</span><strong>{focusSessions}</strong>
        </article>
        <article className="analytics-card analytics-count">
          <span>Focus time</span><strong>{focusMinutes} min</strong>
        </article>
        <article className="analytics-card analytics-count">
          <span>Estimated time</span><strong>{periodEstimatedMinutes} min</strong>
        </article>
        <article className="analytics-card analytics-count">
          <span>Actual time</span><strong>{periodActualMinutes} min</strong>
        </article>
        <article className="analytics-card analytics-count">
          <span>Estimation accuracy</span><strong>{estimationAccuracy}%</strong>
        </article>
        <article className="analytics-card category-chart">
          <h2>Tasks by category</h2>
          <div>
            {categoryCounts.map(item => (
              <div className="category-chart-row" key={item.category}>
                <span>{item.category}</span>
                <div><span style={{ width: `${item.count / maxCategory * 100}%` }} /></div>
                <strong>{item.count}</strong>
              </div>
            ))}
          </div>
        </article>
        <article className="analytics-card priority-chart">
          <h2>Priority balance</h2>
          {Object.entries(priorityDistribution).map(([priority, count]) => (
            <div className="priority-chart-row" key={priority}>
              <span className={`priority-dot ${priority.toLowerCase()}`} />
              <span>{priority}</span>
              <strong>{count}</strong>
            </div>
          ))}
        </article>
        <article className="analytics-card productivity-heatmap">
          <h2>Productivity heatmap</h2>
          <div
            className="heatmap-grid"
            role="img"
            aria-label={`35-day productivity heatmap: ${heatmap.map(day => `${day.key} ${day.count}`).join(', ')}`}
          >
            {heatmap.map(day => (
              <span
                key={day.key}
                className={`heatmap-day level-${Math.min(4, day.count)}`}
                title={`${day.key}: ${day.count} completed`}
                aria-label={`${day.key}: ${day.count} completed`}
              />
            ))}
          </div>
        </article>
      </section>
    </main>
  )
}
