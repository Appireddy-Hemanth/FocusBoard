import TaskFilters from './TaskFilters'
import TaskTabs from './TaskTabs'

export default function TaskControls({
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
}) {
  return (
    <div className="task-controls">
      <TaskFilters
        search={search}
        onSearch={onSearch}
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
      <TaskTabs statusTab={statusTab} onStatusTab={onStatusTab} />
    </div>
  )
}
