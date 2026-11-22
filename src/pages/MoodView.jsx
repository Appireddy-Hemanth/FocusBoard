import { usePersistentState } from '../hooks/usePersistentState'

export default function MoodView() {
  const [checkins, setCheckins] = usePersistentState('focusboard_mood_v1', [], value => Array.isArray(value))
  const [draft, setDraft] = usePersistentState('focusboard_mood_draft_v1', {
    mood: 'Good',
    energy: 3,
    note: '',
  })

  const saveCheckin = event => {
    event.preventDefault()
    const date = new Date().toISOString().slice(0, 10)
    setCheckins(current => [
      ...current.filter(checkin => checkin.date !== date),
      { id: `checkin-${date}`, date, mood: draft.mood, energy: Number(draft.energy), note: draft.note.trim() },
    ].sort((a, b) => b.date.localeCompare(a.date)))
  }

  return (
    <main className="main view-main" id="mood">
      <header className="view-header"><div><p className="eyebrow">Wellbeing</p><h1>Mood & Energy</h1></div></header>
      <section className="mood-layout">
        <form className="mood-form" onSubmit={saveCheckin}>
          <h2>Daily check-in</h2>
          <label>Mood
            <select value={draft.mood} onChange={event => setDraft(current => ({ ...current, mood: event.target.value }))}>
              <option>Great</option><option>Good</option><option>Okay</option><option>Low</option><option>Stressed</option>
            </select>
          </label>
          <label>Energy: {draft.energy}/5
            <input type="range" min="1" max="5" value={draft.energy} onChange={event => setDraft(current => ({ ...current, energy: Number(event.target.value) }))} />
          </label>
          <label>Note<textarea value={draft.note} onChange={event => setDraft(current => ({ ...current, note: event.target.value }))} /></label>
          <button type="submit" className="create-button">Save check-in</button>
          <p className="mood-disclaimer">Mood and energy are personal tracking signals, not medical conclusions.</p>
        </form>
        <div className="mood-history">
          {checkins.map(checkin => (
            <article key={checkin.id}>
              <div><strong>{checkin.mood}</strong><small>{checkin.date}</small></div>
              <span>{checkin.energy}/5 energy</span>
              {checkin.note && <p>{checkin.note}</p>}
              <button type="button" onClick={() => setCheckins(current => current.filter(item => item.id !== checkin.id))}>Delete</button>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
