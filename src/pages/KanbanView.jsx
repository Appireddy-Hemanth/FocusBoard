import { useState } from 'react'
import { useTaskContext } from '../context/useTaskContext'

const COLUMNS = ['To do', 'In progress', 'Completed']

export default function KanbanView({ onEditTask, onAddTask }) {
  const { tasks, updateStatus } = useTaskContext()
  const [dragOver, setDragOver] = useState('')

  const dropTask = (event, status) => {
    event.preventDefault()
    const id = event.dataTransfer.getData('text/task-id')
    if (id) updateStatus(id, status)
    setDragOver('')
  }

  return (
    <main className="main view-main" id="kanban">
      <header className="view-header">
        <div><p className="eyebrow">Task workflow</p><h1>Kanban Board</h1></div>
        <button type="button" className="add-button" onClick={onAddTask}>+ Create Task</button>
      </header>
      <section className="kanban-board" aria-label="Kanban task board">
        {COLUMNS.map(status => {
          const columnTasks = tasks.filter(task => task.status === status)
          return (
            <section
              key={status}
              className={`kanban-column ${dragOver === status ? 'drag-over' : ''}`}
              onDragOver={event => { event.preventDefault(); setDragOver(status) }}
              onDragLeave={() => setDragOver(current => current === status ? '' : current)}
              onDrop={event => dropTask(event, status)}
              aria-label={`${status} tasks`}
            >
              <header className="kanban-column-header">
                <h2>{status}</h2><span>{columnTasks.length}</span>
              </header>
              <div className="kanban-cards">
                {columnTasks.map(task => (
                  <article
                    key={task.id}
                    className="kanban-card"
                    draggable
                    onDragStart={event => event.dataTransfer.setData('text/task-id', task.id)}
                  >
                    <div className="kanban-card-top">
                      <span className={`priority-badge ${task.priority.toLowerCase()}`}>{task.priority}</span>
                      <span className="kanban-category">{task.category}</span>
                    </div>
                    <button
                      type="button"
                      className="kanban-card-edit"
                      onClick={() => onEditTask(task)}
                      aria-label={`Edit ${task.title}`}
                    >
                      <h3>{task.title}</h3>
                      {task.description && <p>{task.description}</p>}
                      <time dateTime={task.dueDate}>Due {task.dueDate || 'No date'}</time>
                    </button>
                  </article>
                ))}
                {columnTasks.length === 0 && <div className="kanban-empty">Drop tasks here</div>}
              </div>
            </section>
          )
        })}
      </section>
    </main>
  )
}
