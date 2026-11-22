import { useTaskContext } from '../context/useTaskContext'

export default function AdvancedStats({ onEditTask }) {
  const {
    weeklyProductivity,
    priorityDistribution,
    recentlyUpdatedTasks,
    dashboardWidgets,
  } = useTaskContext()

  const maxCount = Math.max(1, ...weeklyProductivity.map(day => day.count))

  return (
    <section className="advanced-stats" aria-label="Productivity insights">
      {dashboardWidgets.weekly && (
      <article className="insight-card weekly-card">
        <div className="insight-heading">
          <div>
            <span>Weekly productivity</span>
            <strong>Completed tasks</strong>
          </div>
        </div>
        <div className="weekly-chart" role="img" aria-label={`Completed tasks by day: ${weeklyProductivity.map(day => `${day.label} ${day.count}`).join(', ')}`}>
          {weeklyProductivity.map(day => (
            <div className="weekly-column" key={day.label}>
              <div className="weekly-bar-track">
                <div
                  className="weekly-bar"
                  style={{ height: `${Math.max(8, (day.count / maxCount) * 100)}%` }}
                  title={`${day.count} completed`}
                />
              </div>
              <span>{day.label}</span>
            </div>
          ))}
        </div>
      </article>
      )}

      {dashboardWidgets.priority && (
      <article className="insight-card priority-card">
        <div className="insight-heading">
          <div>
            <span>Priority distribution</span>
            <strong>Current tasks</strong>
          </div>
        </div>
        <div className="priority-bars">
          {Object.entries(priorityDistribution).map(([priority, count]) => (
            <div className="priority-bar-row" key={priority}>
              <span>{priority}</span>
              <div className="priority-bar-track">
                <div className={`priority-bar ${priority.toLowerCase()}`} style={{ width: `${count ? Math.max(8, count * 12) : 0}%` }} />
              </div>
              <strong>{count}</strong>
            </div>
          ))}
        </div>
      </article>
      )}

      {dashboardWidgets.recent && (
      <article className="insight-card recent-card">
        <div className="insight-heading">
          <div>
            <span>Recently updated</span>
            <strong>Latest activity</strong>
          </div>
        </div>
        <div className="recent-list">
          {recentlyUpdatedTasks.map(task => (
            <button type="button" key={task.id} onClick={() => onEditTask(task)}>
              <span className={`recent-dot ${task.status.toLowerCase().replaceAll(' ', '-')}`} />
              <span className="recent-task-copy">
                <strong>{task.title}</strong>
                <small>{task.status} · {task.priority}</small>
              </span>
            </button>
          ))}
        </div>
      </article>
      )}
    </section>
  )
}
