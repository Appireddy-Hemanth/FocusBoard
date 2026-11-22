import { usePersistentState } from '../hooks/usePersistentState'
import { useTaskContext } from '../context/useTaskContext'

export default function InboxView({ onConvert }) {
  const { categories, projects } = useTaskContext()
  const [items, setItems] = usePersistentState('focusboard_inbox_v1', [], value => Array.isArray(value))
  const [draft, setDraft] = usePersistentState('focusboard_inbox_draft_v1', {
    title: '',
    note: '',
    dueDate: '',
    category: 'Product',
    priority: 'Medium',
    projectId: '',
  })

  const addItem = event => {
    event.preventDefault()
    if (!draft.title.trim()) return
    setItems(current => [{
      id: globalThis.crypto?.randomUUID?.() || `inbox-${Date.now()}`,
      ...draft,
      title: draft.title.trim(),
      processed: false,
      createdAt: new Date().toISOString(),
    }, ...current])
    setDraft({ title: '', note: '', dueDate: '', category: 'Product', priority: 'Medium', projectId: '' })
  }

  const convertItem = item => {
    onConvert({
      title: item.title,
      description: item.note,
      dueDate: item.dueDate,
      category: item.category,
      priority: item.priority,
      projectId: item.projectId,
      status: 'To do',
      subtasks: [],
      recurrence: 'None',
    })
    setItems(current => current.map(record =>
      record.id === item.id ? { ...record, processed: true } : record,
    ))
  }

  return (
    <main className="main view-main" id="inbox">
      <header className="view-header"><div><p className="eyebrow">Capture</p><h1>Quick Inbox</h1></div></header>
      <section className="inbox-layout">
        <form className="inbox-form" onSubmit={addItem}>
          <h2>Capture an idea</h2>
          <label>Title<input value={draft.title} onChange={event => setDraft(current => ({ ...current, title: event.target.value }))} aria-label="Inbox title" /></label>
          <label>Note<textarea value={draft.note} onChange={event => setDraft(current => ({ ...current, note: event.target.value }))} /></label>
          <div className="form-grid">
            <label>Due date<input type="date" value={draft.dueDate} onChange={event => setDraft(current => ({ ...current, dueDate: event.target.value }))} /></label>
            <label>Priority
              <select value={draft.priority} onChange={event => setDraft(current => ({ ...current, priority: event.target.value }))}>
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
            </label>
            <label>Category
              <select value={draft.category} onChange={event => setDraft(current => ({ ...current, category: event.target.value }))}>
                {categories.map(category => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label>Project
              <select value={draft.projectId} onChange={event => setDraft(current => ({ ...current, projectId: event.target.value }))}>
                <option value="">Unassigned</option>
                {projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}
              </select>
            </label>
          </div>
          <button type="submit" className="create-button">Capture</button>
        </form>
        <div className="inbox-list">
          {items.map(item => (
            <article className={`inbox-item ${item.processed ? 'processed' : ''}`} key={item.id}>
              <div><h2>{item.title}</h2>{item.note && <p>{item.note}</p>}<small>{item.category} · {item.priority}{item.dueDate ? ` · ${item.dueDate}` : ''}</small></div>
              <div>
                {!item.processed && <button type="button" onClick={() => convertItem(item)}>Convert to task</button>}
                <button type="button" onClick={() => setItems(current => current.map(record => record.id === item.id ? { ...record, processed: !record.processed } : record))}>
                  {item.processed ? 'Mark unprocessed' : 'Mark processed'}
                </button>
              </div>
            </article>
          ))}
          {items.length === 0 && <div className="empty-state"><strong>No captured items</strong><p>Add an idea to clear it from your mind.</p></div>}
        </div>
      </section>
    </main>
  )
}
