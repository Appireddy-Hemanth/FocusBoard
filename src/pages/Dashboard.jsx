import Header from '../components/Header'
import StatsOverview from '../components/StatsOverview'
import FocusNotesCarousel from '../components/FocusNotesCarousel'
import TaskList from '../components/TaskList'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import AdvancedStats from '../components/AdvancedStats'
import { useState } from 'react'
import { useTaskContext } from '../context/useTaskContext'

export default function Dashboard({
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
    filteredTasks,
    dispatch,
    categoryFilter,
    setCategoryFilter,
    dueFilter,
    setDueFilter,
    sortBy,
    setSortBy,
    selectedIds,
    setSelectedIds,
    categories,
    trashTasks,
    tasks,
  } = useTaskContext()
  const toggleSelected = id => {
    setSelectedIds(current => current.includes(id)
      ? current.filter(item => item !== id)
      : [...current, id])
  }
  const selectAll = tasks => {
    setSelectedIds(current => tasks.every(task => current.includes(task.id))
      ? current.filter(id => !tasks.some(task => task.id === id))
      : [...new Set([...current, ...tasks.map(task => task.id)])])
  }

  return (
    <>
      <main className="main" id="main-content">
        <Header
          onAdd={onAddTask}
          search={searchQuery}
          onSearch={setSearchQuery}
        />
        <StatsOverview />
        <AdvancedStats onEditTask={onEditTask} />
        <FocusNotesCarousel />
        <TaskList
          tasks={filteredTasks}
          search={searchQuery}
          onSearch={setSearchQuery}
          statusTab={statusFilter}
          onStatusTab={setStatusFilter}
          priority={priorityFilter}
          onPriority={setPriorityFilter}
          onAdd={onAddTask}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
          onUpdateStatus={(id, status) => {
            if (status === 'Completed') {
              const target = tasks.find(task => task.id === id)
              const blocked = (target?.dependencyIds || []).some(dependencyId =>
                tasks.find(task => task.id === dependencyId)?.status !== 'Completed',
              )
              if (blocked) return
            }
            dispatch({ type: 'UPDATE_STATUS', payload: { id, status } })
          }}
          onUpdatePriority={(id, priority) => dispatch({
            type: 'UPDATE_TASK',
            payload: { id, changes: { priority, updatedAt: new Date().toISOString().slice(0, 10) } },
          })}
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
