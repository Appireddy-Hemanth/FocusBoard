import { useRef, useState } from 'react'
import { Download, Upload, Trash2, RotateCcw } from 'lucide-react'
import { useTaskContext } from '../context/useTaskContext'
import DeleteConfirmModal from '../components/DeleteConfirmModal'

const REQUIRED_FIELDS = ['id', 'title', 'description', 'category', 'status', 'priority', 'dueDate']

export default function SettingsView() {
  const {
    tasks,
    dispatch,
    deletedTasks,
    restoreTask,
    clearTrash,
    theme,
    setTheme,
    categories,
    setCategories,
    dashboardWidgets,
    setDashboardWidgets,
  } = useTaskContext()
  const [categoryDraft, setCategoryDraft] = useState('')
  const [message, setMessage] = useState('')
  const [confirmClearTrash, setConfirmClearTrash] = useState(false)
  const fileRef = useRef(null)

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ tasks, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'focusboard-backup.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const exportCsv = () => {
    const escape = value => `"${String(value ?? '').replaceAll('"', '""')}"`
    const header = ['ID', 'Title', 'Description', 'Category', 'Status', 'Priority', 'Due Date', 'Created At', 'Updated At']
    const rows = tasks.map(task => [
      task.id,
      task.title,
      task.description,
      task.category,
      task.status,
      task.priority,
      task.dueDate,
      task.createdAt,
      task.updatedAt,
    ])
    const csv = [header, ...rows].map(row => row.map(escape).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'focusboard-tasks.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const importJson = event => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        const importedTasks = Array.isArray(parsed) ? parsed : parsed.tasks
        if (!Array.isArray(importedTasks)) throw new Error('The backup does not contain a task array.')

        const validStatuses = ['To do', 'In progress', 'Completed']
        const validPriorities = ['Low', 'Medium', 'High']
        const existingIds = new Set(tasks.map(task => task.id))
        const seenIds = new Set()
        const validTasks = []

        for (const task of importedTasks) {
          if (!task || REQUIRED_FIELDS.some(field => typeof task[field] !== 'string')) {
            throw new Error('One or more tasks is missing required fields.')
          }
          if (!validStatuses.includes(task.status) || !validPriorities.includes(task.priority)) {
            throw new Error('One or more tasks has an invalid status or priority.')
          }
          if (existingIds.has(task.id) || seenIds.has(task.id)) continue
          seenIds.add(task.id)
          validTasks.push({
            ...task,
            subtasks: Array.isArray(task.subtasks) ? task.subtasks : [],
            createdAt: task.createdAt || new Date().toISOString().slice(0, 10),
            updatedAt: task.updatedAt || new Date().toISOString().slice(0, 10),
          })
        }

        if (!validTasks.length) {
          setMessage('No new tasks were imported because the IDs already exist.')
          return
        }
        validTasks.forEach(task => dispatch({ type: 'ADD_TASK', payload: task }))
        setMessage(`Imported ${validTasks.length} tasks. Duplicate IDs were skipped.`)
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Could not import that backup.')
      } finally {
        event.target.value = ''
      }
    }
    reader.readAsText(file)
  }

  const addCategory = () => {
    const category = categoryDraft.trim()
    if (!category) return
    setCategories(current => [...new Set([...current, category])])
    setCategoryDraft('')
  }

  return (
    <main className="main view-main" id="settings">
      <header className="view-header">
        <div><p className="eyebrow">Personalization</p><h1>Settings</h1></div>
      </header>
      <section className="settings-grid">
        <article className="settings-card">
          <h2>Appearance</h2>
          <div className="theme-options" role="radiogroup" aria-label="Theme">
            <button type="button" role="radio" aria-checked={theme === 'light'} className={theme === 'light' ? 'active' : ''} onClick={() => setTheme('light')}>Light</button>
            <button type="button" role="radio" aria-checked={theme === 'dark'} className={theme === 'dark' ? 'active' : ''} onClick={() => setTheme('dark')}>Dark</button>
          </div>
          <h3 className="widget-heading">Dashboard widgets</h3>
          <div className="widget-options">
            {[
              ['weekly', 'Weekly productivity'],
              ['priority', 'Priority distribution'],
              ['recent', 'Recently updated'],
            ].map(([key, label]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={Boolean(dashboardWidgets[key])}
                  onChange={() => setDashboardWidgets(current => ({ ...current, [key]: !current[key] }))}
                />
                {label}
              </label>
            ))}
          </div>
        </article>

        <article className="settings-card">
          <h2>Categories</h2>
          <div className="category-add">
            <input value={categoryDraft} onChange={event => setCategoryDraft(event.target.value)} placeholder="New category" aria-label="New category" />
            <button type="button" onClick={addCategory}>Add</button>
          </div>
          <div className="category-list">
            {categories.map(category => <span key={category}>{category}</span>)}
          </div>
        </article>

        <article className="settings-card">
          <h2>Data backup</h2>
          <div className="backup-actions">
            <button type="button" onClick={exportCsv}><Download size={17} />Export CSV</button>
            <button type="button" onClick={exportJson}><Download size={17} />Export JSON</button>
            <button type="button" onClick={() => fileRef.current?.click()}><Upload size={17} />Import JSON</button>
            <input ref={fileRef} type="file" accept="application/json,.json" onChange={importJson} hidden />
          </div>
          {message && <p className="settings-message" role="status">{message}</p>}
        </article>

        <article className="settings-card">
          <h2>Recently deleted</h2>
          <div className="trash-list">
            {deletedTasks.map(task => (
              <div key={task.id}>
                <span><strong>{task.title}</strong><small>{task.category} · {task.priority}</small></span>
                <button type="button" onClick={() => restoreTask(task.id)} aria-label={`Restore ${task.title}`}><RotateCcw size={16} />Restore</button>
              </div>
            ))}
            {deletedTasks.length === 0 && <p>No recently deleted tasks.</p>}
          </div>
          {deletedTasks.length > 0 && (
            <button type="button" className="clear-trash" onClick={() => setConfirmClearTrash(true)}><Trash2 size={16} />Clear trash</button>
          )}
        </article>
      </section>
      {confirmClearTrash && (
        <DeleteConfirmModal
          permanent
          task={{ title: `${deletedTasks.length} deleted tasks` }}
          onClose={() => setConfirmClearTrash(false)}
          onConfirm={() => {
            clearTrash()
            setConfirmClearTrash(false)
          }}
        />
      )}
    </main>
  )
}
