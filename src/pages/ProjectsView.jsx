import { useState } from 'react'
import { FolderKanban, Plus, Trash2 } from 'lucide-react'
import { useTaskContext } from '../context/useTaskContext'
import DeleteConfirmModal from '../components/DeleteConfirmModal'

export default function ProjectsView({ onEditTask }) {
  const { tasks, projects, setProjects, dispatch } = useTaskContext()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const saveProjects = next => {
    setProjects(next)
  }

  const addProject = event => {
    event.preventDefault()
    const title = name.trim()
    if (!title) {
      setError('Please enter a project name.')
      return
    }
    setError('')
    saveProjects([...projects, {
      id: globalThis.crypto?.randomUUID?.() || `project-${Date.now()}`,
      name: title,
      description: description.trim(),
      targetDate,
      createdAt: new Date().toISOString(),
    }])
    setName('')
    setDescription('')
    setTargetDate('')
  }

  const removeProject = id => {
    tasks.filter(task => task.projectId === id).forEach(task =>
      dispatch({
        type: 'UPDATE_TASK',
        payload: { id: task.id, changes: { projectId: '', updatedAt: new Date().toISOString().slice(0, 10) } },
      }),
    )
    saveProjects(projects.filter(project => project.id !== id))
  }

  return (
    <main className="main view-main" id="projects">
      <header className="view-header">
        <div><p className="eyebrow">Workspace</p><h1>Projects</h1></div>
      </header>
      <section className="project-layout">
        <form className="project-form" onSubmit={addProject}>
          <h2>Create project</h2>
          <label htmlFor="project-name">Name</label>
          <input
            id="project-name"
            value={name}
            onChange={event => { setName(event.target.value); if (error) setError('') }}
            placeholder="Project name"
            aria-required="true"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'project-name-error' : undefined}
          />
          {error && <small id="project-name-error" className="form-error" role="alert">{error}</small>}
          <label htmlFor="project-description">Description</label>
          <textarea id="project-description" value={description} onChange={event => setDescription(event.target.value)} placeholder="What are you building?" />
          <label htmlFor="project-target-date">Target date</label>
          <input id="project-target-date" type="date" value={targetDate} onChange={event => setTargetDate(event.target.value)} />
          <button type="submit" className="create-button"><Plus size={17} />Create project</button>
        </form>

        <div className="project-grid">
          {projects.map(project => {
            const projectTasks = tasks.filter(task => task.projectId === project.id)
            const completed = projectTasks.filter(task => task.status === 'Completed').length
            const percentage = projectTasks.length ? Math.round(completed / projectTasks.length * 100) : 0
            const overdueTasks = projectTasks.filter(task =>
              task.status !== 'Completed' && task.dueDate && task.dueDate < new Date().toISOString().slice(0, 10),
            ).length
            const workload = projectTasks.filter(task => task.status !== 'Completed')
              .reduce((sum, task) => sum + (Number(task.estimatedMinutes) || 0), 0)
            const overdueProject = project.targetDate && project.targetDate < new Date().toISOString().slice(0, 10)
            const health = overdueTasks > 0 || overdueProject ? 'At risk' : percentage >= 75 ? 'Healthy' : 'On track'
            return (
              <article className="project-card" key={project.id}>
                <div className="project-card-header">
                  <span className="project-icon"><FolderKanban size={18} /></span>
                  <button type="button" onClick={() => setDeleteTarget(project)} aria-label={`Delete project ${project.name}`} title={`Delete ${project.name}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
                <h2>{project.name}</h2>
                <p>{project.description || 'No description yet.'}</p>
                {project.targetDate && <small>Target: {project.targetDate}{overdueProject ? ' · Overdue' : ''}</small>}
                <div className="project-health"><strong>{health}</strong><span>{overdueTasks} overdue · {workload} min planned</span></div>
                <div className="project-progress-row">
                  <span>{completed}/{projectTasks.length} completed</span><strong>{percentage}%</strong>
                </div>
                <div className="project-progress"><span style={{ width: `${percentage}%` }} /></div>
                <div className="project-task-list">
                  {projectTasks.slice(0, 4).map(task => (
                    <button type="button" key={task.id} onClick={() => onEditTask(task)}>
                      <span>{task.title}</span><small>{task.status}</small>
                    </button>
                  ))}
                  {projectTasks.length === 0 && <p className="project-empty">No matching tasks yet.</p>}
                </div>
              </article>
            )
          })}
          {projects.length === 0 && (
            <article className="project-empty-card">
              <FolderKanban size={28} />
              <h2>No projects yet</h2>
              <p>Create a project to organize related tasks.</p>
            </article>
          )}
        </div>
      </section>
      {deleteTarget && (
        <DeleteConfirmModal
          task={{ title: `project "${deleteTarget.name}"` }}
          permanent
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => {
            removeProject(deleteTarget.id)
            setDeleteTarget(null)
          }}
        />
      )}
    </main>
  )
}
