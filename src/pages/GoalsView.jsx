import { useState } from 'react'
import { usePersistentState } from '../hooks/usePersistentState'
import { useTaskContext } from '../context/useTaskContext'

export default function GoalsView({ onEditTask }) {
  const { tasks, projects } = useTaskContext()
  const [goals, setGoals] = usePersistentState(
    'focusboard_goals_v1',
    [],
    value => Array.isArray(value),
  )
  const [draft, setDraft] = usePersistentState(
    'focusboard_goal_draft_v1',
    { name: '', description: '', targetDate: '', projectId: '', taskId: '' },
  )

  const createGoal = event => {
    event.preventDefault()
    if (!draft.name.trim() || !draft.targetDate) return
    setGoals(current => [...current, {
      id: globalThis.crypto?.randomUUID?.() || `goal-${Date.now()}`,
      ...draft,
      name: draft.name.trim(),
      milestones: [],
      createdAt: new Date().toISOString(),
    }])
    setDraft({ name: '', description: '', targetDate: '', projectId: '', taskId: '' })
  }

  const addMilestone = (goalId, title) => {
    if (!title.trim()) return
    setGoals(current => current.map(goal => goal.id === goalId
      ? { ...goal, milestones: [...(goal.milestones || []), { id: `milestone-${Date.now()}`, title: title.trim(), completed: false }] }
      : goal))
  }

  const toggleMilestone = (goalId, milestoneId) => {
    setGoals(current => current.map(goal => goal.id === goalId
      ? {
          ...goal,
          milestones: (goal.milestones || []).map(milestone =>
            milestone.id === milestoneId ? { ...milestone, completed: !milestone.completed } : milestone,
          ),
        }
      : goal))
  }

  const [today] = useState(() => new Date().toISOString().slice(0, 10))

  return (
    <main className="main view-main" id="goals">
      <header className="view-header"><div><p className="eyebrow">Outcomes</p><h1>Goals & Milestones</h1></div></header>
      <section className="goal-layout">
        <form className="goal-form" onSubmit={createGoal}>
          <h2>Create goal</h2>
          <label>Goal name<input value={draft.name} onChange={event => setDraft(current => ({ ...current, name: event.target.value }))} /></label>
          <label>Description<textarea value={draft.description} onChange={event => setDraft(current => ({ ...current, description: event.target.value }))} /></label>
          <label>Target date<input type="date" value={draft.targetDate} onChange={event => setDraft(current => ({ ...current, targetDate: event.target.value }))} /></label>
          <label>Project
            <select value={draft.projectId} onChange={event => setDraft(current => ({ ...current, projectId: event.target.value }))}>
              <option value="">None</option>
              {projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
          </label>
          <label>Linked task
            <select value={draft.taskId} onChange={event => setDraft(current => ({ ...current, taskId: event.target.value }))}>
              <option value="">None</option>
              {tasks.map(task => <option key={task.id} value={task.id}>{task.title}</option>)}
            </select>
          </label>
          <button type="submit" className="create-button">Create goal</button>
        </form>
        <div className="goal-grid">
          {goals.map(goal => {
            const milestones = goal.milestones || []
            const completed = milestones.filter(milestone => milestone.completed).length
            const progress = milestones.length ? Math.round(completed / milestones.length * 100) : 0
            const overdue = goal.targetDate < today
            return (
              <article className={`goal-card ${overdue ? 'overdue' : ''}`} key={goal.id}>
                <h2>{goal.name}</h2>
                <p>{goal.description || 'No description.'}</p>
                <small>Target: {goal.targetDate}{overdue ? ' · Overdue' : ''}</small>
                <div className="goal-progress"><span style={{ width: `${progress}%` }} /></div>
                <strong>{completed}/{milestones.length} milestones · {progress}%</strong>
                {milestones.map(milestone => (
                  <label key={milestone.id}>
                    <input type="checkbox" checked={milestone.completed} onChange={() => toggleMilestone(goal.id, milestone.id)} />
                    {milestone.title}
                  </label>
                ))}
                <MilestoneAdder onAdd={title => addMilestone(goal.id, title)} />
                {goal.taskId && <button type="button" onClick={() => onEditTask(tasks.find(task => task.id === goal.taskId))}>Open linked task</button>}
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}

function MilestoneAdder({ onAdd }) {
  const [title, setTitle] = useState('')
  return (
    <form onSubmit={event => { event.preventDefault(); onAdd(title); setTitle('') }}>
      <input value={title} onChange={event => setTitle(event.target.value)} placeholder="Add milestone" aria-label="Add milestone" />
      <button type="submit">Add</button>
    </form>
  )
}
