export default function TaskTabs({ statusTab, onStatusTab }) {
  const statuses = ['All', 'To do', 'In progress', 'Completed']

  return (
    <div className="tabs" role="tablist" aria-label="Filter tasks by status">
      {statuses.map(tab => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={statusTab === tab}
          className={statusTab === tab ? 'active' : ''}
          onClick={() => onStatusTab(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
