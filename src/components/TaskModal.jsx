import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

const CATEGORIES = [
  'Product',
  'Design',
  'Development',
  'Engineering',
  'Marketing',
  'Research',
  'Quality',
]

const EMPTY_TASK = {
  title: '',
  description: '',
  category: 'Product',
  status: 'To do',
  priority: 'Medium',
  dueDate: '',
  subtasks: [],
  recurrence: 'None',
  recurrenceWeekdays: [],
  projectId: '',
  estimatedMinutes: 30,
  actualMinutes: 0,
  eisenhower: 'Important but Not Urgent',
  dependencyIds: [],
}

export default function TaskModal({
  task = null,
  categories: customCategories = CATEGORIES,
  projects = [],
  tasks = [],
  initialDueDate,
  onClose,
  onSave,
}) {
  const isEditing = Boolean(task?.id)
  const [values, setValues] = useState(() =>
    task
      ? { ...task }
      : { ...EMPTY_TASK, dueDate: initialDueDate || new Date().toISOString().slice(0, 10) },
  )
  const [error, setError] = useState('')
  const [dueError, setDueError] = useState('')
  const [subtaskDraft, setSubtaskDraft] = useState('')
  const dialogRef = useRef(null)
  const titleRef = useRef(null)
  const dueDateRef = useRef(null)
  const previousFocusRef = useRef(null)

  useEffect(() => {
    previousFocusRef.current = document.activeElement
    const previousFocus = previousFocusRef.current
    titleRef.current?.focus()

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(
        dialogRef.current.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus?.()
    }
  }, [onClose])

  const updateField = (field, value) => {
    setValues(current => ({ ...current, [field]: value }))
    if (field === 'title' && error) setError('')
    if (field === 'dueDate' && dueError) setDueError('')
  }

  const addSubtask = () => {
      const title = subtaskDraft.trim()
      if (!title) return
      setValues(current => ({
        ...current,
        subtasks: [
          ...(Array.isArray(current.subtasks) ? current.subtasks : []),
          {
            id: globalThis.crypto?.randomUUID?.() || `subtask-${Date.now()}`,
            title,
            completed: false,
          },
        ],
      }))
      setSubtaskDraft('')
  }

  const toggleSubtask = id => {
      setValues(current => ({
        ...current,
        subtasks: (Array.isArray(current.subtasks) ? current.subtasks : []).map(subtask =>
          subtask.id === id ? { ...subtask, completed: !subtask.completed } : subtask,
        ),
      }))
  }

  const removeSubtask = id => {
      setValues(current => ({
        ...current,
        subtasks: (Array.isArray(current.subtasks) ? current.subtasks : []).filter(subtask => subtask.id !== id),
      }))
  }

  const submit = event => {
    event.preventDefault()
    const title = values.title.trim()
    if (!title) {
      setError('Please enter a task title.')
      titleRef.current?.focus()
      return
    }

    const hasCircularDependency = (taskId, visited = new Set()) => {
      if (visited.has(taskId)) return true
      visited.add(taskId)
      const candidate = tasks.find(task => task.id === taskId)
      if (!candidate) return false
      return (candidate.dependencyIds || []).some(dependencyId =>
        dependencyId === values.id || hasCircularDependency(dependencyId, visited),
      )
    }
    if ((values.dependencyIds || []).some(dependencyId => hasCircularDependency(dependencyId))) {
      setError('A circular dependency is not allowed.')
      titleRef.current?.focus()
      return
    }
    if (!values.dueDate) {
      dueDateRef.current?.focus()
      setDueError('Please enter a due date.')
      return
    }

    onSave({
      ...values,
      title,
      description: values.description.trim(),
    })
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={event => event.target === event.currentTarget && onClose()}
    >
      <section
        ref={dialogRef}
        className="task-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
      >
        <header className="modal-header">
          <div>
            <p>Task details</p>
            <h2 id="task-modal-title">{isEditing ? 'Edit task' : 'Create new task'}</h2>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close task modal">
            <X size={20} />
          </button>
        </header>

        <form onSubmit={submit} noValidate>
          <label htmlFor="task-title">
            Title <span aria-hidden="true">*</span>
          </label>
          <input
            ref={titleRef}
            id="task-title"
            value={values.title}
            onChange={event => updateField('title', event.target.value)}
            placeholder="What needs to be done?"
            aria-required="true"
            aria-label="Title"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'task-title-error' : undefined}
          />
          {error && (
            <small id="task-title-error" className="form-error" role="alert">
              {error}
            </small>
          )}

          <label htmlFor="task-description">Description</label>
          <textarea
            id="task-description"
            value={values.description}
            onChange={event => updateField('description', event.target.value)}
            placeholder="Add a description..."
            rows="4"
          />

          <div className="form-grid">
            <label htmlFor="task-category">Category</label>
            <label htmlFor="task-status">Status</label>
            <select
              id="task-category"
              value={values.category}
              onChange={event => updateField('category', event.target.value)}
            >
              {[...new Set([...CATEGORIES, ...customCategories])].map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              id="task-status"
              value={values.status}
              onChange={event => updateField('status', event.target.value)}
            >
              <option>To do</option>
              <option>In progress</option>
              <option>Completed</option>
            </select>
          </div>

          <div className="form-grid">
            <label htmlFor="task-priority">Priority</label>
            <label htmlFor="task-due-date">Due date</label>
            <select
              id="task-priority"
              value={values.priority}
              onChange={event => updateField('priority', event.target.value)}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
            <input
              id="task-due-date"
              ref={dueDateRef}
              type="date"
              aria-label="Due date"
              value={values.dueDate}
              onChange={event => updateField('dueDate', event.target.value)}
              aria-invalid={Boolean(dueError)}
              aria-describedby={dueError ? 'task-due-date-error' : undefined}
            />
            {dueError && (
              <small id="task-due-date-error" className="form-error" role="alert">
                {dueError}
              </small>
            )}
          </div>

          <div className="form-grid">
            <label htmlFor="task-project">Project</label>
            <select
              id="task-project"
              value={values.projectId || ''}
              onChange={event => updateField('projectId', event.target.value)}
            >
              <option value="">Unassigned</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          <div className="form-grid">
            <label htmlFor="task-estimated">Estimated minutes</label>
            <label htmlFor="task-actual">Actual minutes</label>
            <input
              id="task-estimated"
              type="number"
              min="0"
              max="1440"
              value={values.estimatedMinutes || 0}
              onChange={event => updateField('estimatedMinutes', Math.max(0, Number(event.target.value) || 0))}
            />
            <input
              id="task-actual"
              type="number"
              min="0"
              max="1440"
              value={values.actualMinutes || 0}
              onChange={event => updateField('actualMinutes', Math.max(0, Number(event.target.value) || 0))}
            />
          </div>

          <div className="form-grid">
            <label htmlFor="task-eisenhower">Priority matrix</label>
            <select
              id="task-eisenhower"
              value={values.eisenhower || 'Important but Not Urgent'}
              onChange={event => updateField('eisenhower', event.target.value)}
            >
              <option>Urgent and Important</option>
              <option>Important but Not Urgent</option>
              <option>Urgent but Not Important</option>
              <option>Neither Urgent nor Important</option>
            </select>
          </div>

          <fieldset className="dependency-selector">
            <legend>Dependencies</legend>
            {tasks.filter(candidate => candidate.id !== values.id).map(candidate => (
              <label key={candidate.id}>
                <input
                  type="checkbox"
                  checked={(values.dependencyIds || []).includes(candidate.id)}
                  onChange={event => setValues(current => ({
                    ...current,
                    dependencyIds: event.target.checked
                      ? [...new Set([...(current.dependencyIds || []), candidate.id])]
                      : (current.dependencyIds || []).filter(id => id !== candidate.id),
                  }))}
                />
                {candidate.title}
              </label>
            ))}
          </fieldset>

          <div className="form-grid recurrence-grid">
            <label htmlFor="task-recurrence">Recurrence</label>
            <select
              id="task-recurrence"
              value={values.recurrence || 'None'}
              onChange={event => updateField('recurrence', event.target.value)}
            >
              <option>None</option>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
            {values.recurrence === 'Weekly' && (
              <fieldset className="weekday-selector">
                <legend>Repeat on</legend>
                {[
                  ['Sun', 0],
                  ['Mon', 1],
                  ['Tue', 2],
                  ['Wed', 3],
                  ['Thu', 4],
                  ['Fri', 5],
                  ['Sat', 6],
                ].map(([label, day]) => (
                  <label key={day}>
                    <input
                      type="checkbox"
                      checked={(values.recurrenceWeekdays || []).includes(day)}
                      onChange={event => setValues(current => {
                        const selected = Array.isArray(current.recurrenceWeekdays)
                          ? current.recurrenceWeekdays
                          : []
                        return {
                          ...current,
                          recurrenceWeekdays: event.target.checked
                            ? [...selected, day]
                            : selected.filter(value => value !== day),
                        }
                      })}
                    />
                    {label}
                  </label>
                ))}
              </fieldset>
            )}
          </div>

          <fieldset className="subtask-editor">
            <legend>Subtasks</legend>
            <div className="subtask-add">
              <input
                value={subtaskDraft}
                onChange={event => setSubtaskDraft(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addSubtask()
                  }
                }}
                placeholder="Add a subtask"
                aria-label="New subtask"
              />
              <button type="button" onClick={addSubtask}>Add</button>
            </div>
            {(Array.isArray(values.subtasks) ? values.subtasks : []).map(subtask => (
              <label className="subtask-row" key={subtask.id}>
                <input
                  type="checkbox"
                  checked={Boolean(subtask.completed)}
                  onChange={() => toggleSubtask(subtask.id)}
                />
                <span className={subtask.completed ? 'completed' : ''}>{subtask.title}</span>
                <button type="button" onClick={() => removeSubtask(subtask.id)} aria-label={`Remove ${subtask.title}`}>
                  Remove
                </button>
              </label>
            ))}
          </fieldset>

          <footer className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="create-button">
              {isEditing ? 'Save changes' : 'Create task'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}
