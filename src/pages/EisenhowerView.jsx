import { useTaskContext } from '../context/useTaskContext'

const QUADRANTS = [
  'Urgent and Important',
  'Important but Not Urgent',
  'Urgent but Not Important',
  'Neither Urgent nor Important',
]

export default function EisenhowerView({ onEditTask }) {
  const { tasks, dispatch } = useTaskContext()

  const moveTask = (taskId, quadrant) => {
    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        id: taskId,
        changes: {
          eisenhower: quadrant,
          priority: quadrant === 'Urgent and Important' || quadrant === 'Urgent but Not Important'
            ? 'High'
            : quadrant === 'Important but Not Urgent'
              ? 'Medium'
              : 'Low',
          updatedAt: new Date().toISOString().slice(0, 10),
        },
      },
    })
  }

  return (
    <main className="main view-main" id="eisenhower">
      <header className="view-header">
        <div><p className="eyebrow">Priority planning</p><h1>Eisenhower Matrix</h1></div>
      </header>
      <section className="eisenhower-grid" aria-label="Eisenhower priority matrix">
        {QUADRANTS.map(quadrant => (
          <article className="eisenhower-quadrant" key={quadrant}>
            <header><h2>{quadrant}</h2></header>
            <div className="eisenhower-tasks">
              {tasks
                .filter(task => (task.eisenhower || 'Important but Not Urgent') === quadrant)
                .map(task => (
                  <article className="eisenhower-card" key={task.id}>
                    <button type="button" onClick={() => onEditTask(task)}>
                      <strong>{task.title}</strong>
                      <small>{task.status} · {task.priority}</small>
                    </button>
                    <label>
                      <span>Move to</span>
                      <select value={quadrant} onChange={event => moveTask(task.id, event.target.value)}>
                        {QUADRANTS.map(option => <option key={option}>{option}</option>)}
                      </select>
                    </label>
                  </article>
                ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
