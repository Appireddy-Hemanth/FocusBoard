import { Check, Pencil, Trash2 } from 'lucide-react'

export default function TaskCard({ task, onUpdateStatus, onEdit, onDelete, onUpdatePriority, selected, onSelect }) {
  const date = new Date(`${task.dueDate}T12:00:00`)

  return (
    <article className="task-row">
      <div className="task-name">
        <input
          type="checkbox"
          checked={Boolean(selected)}
          onChange={() => onSelect(task.id)}
          aria-label={`Select ${task.title}`}
          className="task-select"
        />
        <button
          type="button"
          className={`task-check ${task.status === 'Completed' ? 'checked' : ''}`}
          aria-label={task.status === 'Completed' ? `Mark ${task.title} incomplete` : `Mark ${task.title} completed`}
          onClick={() => onUpdateStatus(task.id, task.status === 'Completed' ? 'To do' : 'Completed')}
        >{task.status === 'Completed' && <Check size={12} />}</button>
        <div>
          <strong>{task.title}</strong>
          <p>{task.description}</p>
          {Array.isArray(task.subtasks) && task.subtasks.length > 0 && (
            <small className="subtask-progress">
              {task.subtasks.filter(subtask => subtask.completed).length}/{task.subtasks.length} subtasks
            </small>
          )}
        </div>
      </div>
      <div>
        <select className={`status-select ${task.status.toLowerCase().replaceAll(' ', '-')}`} value={task.status} onChange={event => onUpdateStatus(task.id, event.target.value)} aria-label={`Status for ${task.title}`}>
          <option>To do</option><option>In progress</option><option>Completed</option>
        </select>
      </div>
      <div>
        <select
          className={`priority-select priority-badge ${task.priority.toLowerCase()}`}
          value={task.priority}
          onChange={event => onUpdatePriority(task.id, event.target.value)}
          aria-label={`Change priority for ${task.title}`}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>
      <time dateTime={task.dueDate}>{Number.isNaN(date.getTime()) ? 'No date' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</time>
      <div className="row-actions">
        <button type="button" className="row-action edit" onClick={() => onEdit(task)} aria-label={`Edit ${task.title}`} title={`Edit ${task.title}`}>
          <Pencil size={15} /><span>Edit</span>
        </button>
        <button type="button" className="row-action delete" onClick={() => onDelete(task)} aria-label={`Delete ${task.title}`} title={`Delete ${task.title}`}>
          <Trash2 size={15} /><span>Delete</span>
        </button>
      </div>
    </article>
  )
}
