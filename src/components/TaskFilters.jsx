import { Filter, Search } from 'lucide-react'

export default function TaskFilters({
  search,
  onSearch,
  priority,
  onPriority,
  category = 'All',
  onCategory,
  categories = [],
  dueFilter = 'All',
  onDueFilter,
  sortBy = 'Updated',
  onSortBy,
}) {
  return (
    <div className="task-toolbar">
      <label className="search-box">
        <Search size={18} aria-hidden="true" />
        <span className="sr-only">Search tasks by title</span>
        <input
          value={search}
          onChange={event => onSearch(event.target.value)}
          placeholder="Search tasks..."
          aria-label="Search tasks"
        />
      </label>
      <label className="priority-filter">
        <Filter size={17} aria-hidden="true" />
        <span className="sr-only">Filter by priority</span>
        <select
          value={priority}
          onChange={event => onPriority(event.target.value)}
          aria-label="Filter by priority"
        >
          <option>All</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </label>
      <label className="advanced-filter">
        <span className="sr-only">Filter by category</span>
        <select value={category} onChange={event => onCategory?.(event.target.value)} aria-label="Filter by category">
          <option>All</option>
          {categories.map(item => <option key={item}>{item}</option>)}
        </select>
      </label>
      <label className="advanced-filter">
        <span className="sr-only">Filter by due date</span>
        <select value={dueFilter} onChange={event => onDueFilter?.(event.target.value)} aria-label="Filter by due date">
          <option>All</option>
          <option>Today</option>
          <option>Upcoming</option>
          <option>Overdue</option>
          <option>No date</option>
        </select>
      </label>
      <label className="advanced-filter">
        <span className="sr-only">Sort tasks</span>
        <select value={sortBy} onChange={event => onSortBy?.(event.target.value)} aria-label="Sort tasks">
          <option>Updated</option>
          <option>Priority</option>
          <option>Due date</option>
          <option>Created</option>
        </select>
      </label>
    </div>
  )
}
