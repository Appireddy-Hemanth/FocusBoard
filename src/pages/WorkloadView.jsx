import { useState } from 'react'
import { useTaskContext } from '../context/useTaskContext'

export default function WorkloadView({ dailyCapacity = 240 }) {
  const { tasks } = useTaskContext()
  const [today] = useState(() => new Date())
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() + index)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const dayTasks = tasks.filter(task => task.status !== 'Completed' && task.dueDate === key)
    const minutes = dayTasks.reduce((sum, task) => sum + (Number(task.estimatedMinutes) || 0), 0)
    return { key, date, minutes, taskCount: dayTasks.length }
  })
  const overloaded = days.filter(day => day.minutes > dailyCapacity)
  const underutilized = days.filter(day => day.minutes > 0 && day.minutes < dailyCapacity * 0.5)
  const total = days.reduce((sum, day) => sum + day.minutes, 0)

  return (
    <main className="main view-main" id="workload">
      <header className="view-header"><div><p className="eyebrow">Capacity</p><h1>Workload Balance</h1></div></header>
      <section className="workload-summary">
        <article><span>Next 7 days</span><strong>{total} min</strong></article>
        <article><span>Daily capacity</span><strong>{dailyCapacity} min</strong></article>
        <article><span>Overloaded days</span><strong>{overloaded.length}</strong></article>
      </section>
      <section className="workload-grid">
        {days.map(day => (
          <article className={day.minutes > dailyCapacity ? 'overloaded' : day.minutes > 0 ? 'balanced' : 'available'} key={day.key}>
            <h2>{day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</h2>
            <strong>{day.minutes} min</strong>
            <small>{day.taskCount} tasks</small>
            <div className="workload-track"><span style={{ width: `${Math.min(100, day.minutes / dailyCapacity * 100)}%` }} /></div>
          </article>
        ))}
      </section>
      <section className="workload-recommendation">
        <h2>Redistribution recommendations</h2>
        {overloaded.length
          ? <p>Move lower-priority tasks from overloaded days to underutilized days.</p>
          : <p>No overloaded days are currently detected.</p>}
        {underutilized.length > 0 && <p>{underutilized.length} day(s) have capacity below 50%.</p>}
      </section>
    </main>
  )
}
