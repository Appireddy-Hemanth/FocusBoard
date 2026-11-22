import { useTaskContext } from '../context/useTaskContext'
import TaskList from '../components/TaskList'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import { useState } from 'react'

export default function MyTasksView({
  onAddTask,
  onEditTask,
  onDeleteTask,
}) {
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false)
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    categoryFilter,
    setCategoryFilter,
    dueFilter,
    setDueFilter,
    sortBy,
    setSortBy,
    categories,
    selectedIds,
    setSelectedIds,
    filteredTasks,
    dispatch,
    trashTasks,
  } = useTaskContext()

  const toggleSelected = id => setSelectedIds(current =>
    current.includes(id) ? current.filter(item => item !== id) : [...current, id],
  )

  const selectAll = tasks => setSelectedIds(current =>
    tasks.every(task => current.includes(task.id))
      ? current.filter(id => !tasks.some(task => task.id === id))
      : [...new Set([...current, ...tasks.map(task => task.id)])],
  )

  return (
    <>
      <main className="main view-main" id="tasks">
      <header className="view-header">
        <div><p className="eyebrow">Task workspace</p><h1>My Tasks</h1></div>
      </header>
      <TaskList
        tasks={filteredTasks}
        search={searchQuery}
        onSearch={setSearchQuery}
        statusTab={statusFilter}
        onStatusTab={setStatusFilter}
        priority={priorityFilter}
        onPriority={setPriorityFilter}
        category={categoryFilter}
        onCategory={setCategoryFilter}
        categories={categories}
        dueFilter={dueFilter}
        onDueFilter={setDueFilter}
        sortBy={sortBy}
        onSortBy={setSortBy}
        selectedIds={selectedIds}
        onToggleSelected={toggleSelected}
        onSelectAll={selectAll}
        onBulkDelete={() => setBulkDeleteConfirm(true)}
        onAdd={onAddTask}
        onEdit={onEditTask}
        onDelete={onDeleteTask}
        onUpdateStatus={(id, status) => dispatch({
          type: 'UPDATE_STATUS',
          payload: { id, status },
        })}
        onUpdatePriority={(id, priority) => dispatch({
          type: 'UPDATE_TASK',
          payload: { id, changes: { priority, updatedAt: new Date().toISOString().slice(0, 10) } },
        })}
      />
      </main>
      {bulkDeleteConfirm && (
        <DeleteConfirmModal
          task={{ title: `${selectedIds.length} selected tasks` }}
          onClose={() => setBulkDeleteConfirm(false)}
          onConfirm={() => {
            trashTasks(selectedIds)
            setSelectedIds([])
            setBulkDeleteConfirm(false)
          }}
        />
      )}
    </>
  )
}
