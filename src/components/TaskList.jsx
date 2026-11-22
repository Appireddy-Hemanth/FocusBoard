import { Plus } from 'lucide-react'
import TaskCard from './TaskCard'
import TaskControls from './TaskControls'
import EmptyState from './EmptyState'

export default function TaskList({
  tasks,
  search,
  onSearch,
  statusTab,
  onStatusTab,
  priority,
  onPriority,
  category,
  onCategory,
  categories,
  dueFilter,
  onDueFilter,
  sortBy,
  onSortBy,
  selectedIds,
  onToggleSelected,
  onSelectAll,
  onBulkDelete,
  onAdd,
  onEdit,
  onDelete,
  onUpdateStatus,
  onUpdatePriority,
}) {
  return (
    <section className="tasks-section" id="tasks">
      <div className="tasks-heading"><h2>My Tasks</h2><button type="button" className="text-add" onClick={onAdd}><Plus size={18} />Add new</button></div>
      <TaskControls
        search={search}
        onSearch={onSearch}
        statusTab={statusTab}
        onStatusTab={onStatusTab}
        priority={priority}
        onPriority={onPriority}
        category={category}
        onCategory={onCategory}
        categories={categories}
        dueFilter={dueFilter}
        onDueFilter={onDueFilter}
        sortBy={sortBy}
        onSortBy={onSortBy}
      />
      {selectedIds.length > 0 && (
        <div className="bulk-actions" role="toolbar" aria-label="Bulk task actions">
          <label>
            <input type="checkbox" checked={tasks.length > 0 && tasks.every(task => selectedIds.includes(task.id))} onChange={() => onSelectAll(tasks)} />
            Select all
          </label>
          <span>{selectedIds.length} selected</span>
          <button type="button" onClick={onBulkDelete} className="danger">Delete selected</button>
        </div>
      )}
      <div className="task-table">
        <div className="table-header"><span>Task</span><span>Status</span><span>Priority</span><span>Due date</span><span /></div>
        {tasks.map(task => <TaskCard key={task.id} task={task} selected={selectedIds.includes(task.id)} onSelect={onToggleSelected} onUpdateStatus={onUpdateStatus} onEdit={onEdit} onDelete={onDelete} onUpdatePriority={onUpdatePriority} />)}
        {tasks.length === 0 && <EmptyState />}
      </div>
    </section>
  )
}
