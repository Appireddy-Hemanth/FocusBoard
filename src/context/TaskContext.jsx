import { useEffect, useMemo, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useTasks } from '../hooks/useTasks'
import { useGamification } from '../hooks/useGamification'
import { TaskContext } from './taskContext.js'

const STATUS_VALUES = ['To do', 'In progress', 'Completed']
const PRIORITY_VALUES = ['Low', 'Medium', 'High']

export function TaskProvider({ children }) {
  const taskState = useTasks()
  const { tasks } = taskState
  const gamification = useGamification(tasks)
  const [todayKey] = useState(() => new Date().toISOString().slice(0, 10))
  const [tomorrowKey] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 1)
    return date.toISOString().slice(0, 10)
  })
  const [weekKeys] = useState(() => {
    const keys = []
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date()
      date.setDate(date.getDate() - offset)
      keys.push({
        key: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      })
    }
    return keys
  })
  const [categoryFilter, setCategoryFilter] = useLocalStorage(
    'focusboard_category_filter_v1',
    'All',
    value => typeof value === 'string',
  )
  const [dueFilter, setDueFilter] = useLocalStorage(
    'focusboard_due_filter_v1',
    'All',
    value => ['All', 'Today', 'Upcoming', 'Overdue', 'No date'].includes(value),
  )
  const [sortBy, setSortBy] = useLocalStorage(
    'focusboard_sort_v1',
    'Updated',
    value => ['Updated', 'Priority', 'Due date', 'Created'].includes(value),
  )
  const [theme, setTheme] = useLocalStorage(
    'focusboard_theme_v1',
    'light',
    value => ['light', 'dark'].includes(value),
  )
  const [categories, setCategories] = useLocalStorage(
    'focusboard_categories_v1',
    ['Product', 'Design', 'Development', 'Engineering', 'Marketing', 'Research', 'Quality'],
    value => Array.isArray(value) && value.every(item => typeof item === 'string'),
  )
  const [dashboardWidgets, setDashboardWidgets] = useLocalStorage(
    'focusboard_dashboard_widgets_v1',
    { weekly: true, priority: true, recent: true },
    value => value && typeof value === 'object',
  )
  const [projects, setProjects] = useLocalStorage(
    'focusboard_projects_v1',
    [],
    value => Array.isArray(value) && value.every(project =>
      project && typeof project.id === 'string' && typeof project.name === 'string',
    ),
  )
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const [searchQuery, setSearchQuery] = useLocalStorage(
    'focusboard_search_v1',
    '',
    value => typeof value === 'string',
  )
  const [statusFilter, setStatusFilter] = useLocalStorage(
    'focusboard_status_filter_v1',
    'All',
    value => ['All', ...STATUS_VALUES].includes(value),
  )
  const [priorityFilter, setPriorityFilter] = useLocalStorage(
    'focusboard_priority_filter_v1',
    'All',
    value => ['All', ...PRIORITY_VALUES].includes(value),
  )

  const totalCount = useMemo(() => tasks.length, [tasks])
  const inProgressCount = useMemo(() => tasks.filter(task => task.status === 'In progress').length, [tasks])
  const completedCount = useMemo(() => tasks.filter(task => task.status === 'Completed').length, [tasks])
  const pendingCount = useMemo(() => tasks.filter(task => task.status === 'To do').length, [tasks])
  const overdueCount = useMemo(() => {
    return tasks.filter(task => {
      if (task.status === 'Completed' || !task.dueDate) return false
      return task.dueDate < todayKey
    }).length
  }, [tasks, todayKey])
  const completionPercentage = useMemo(
    () => totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100),
    [totalCount, completedCount],
  )
  const filteredTasks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    const filtered = tasks.filter(task => {
      const matchesSearch =
        task.title.toLowerCase().includes(normalizedQuery) ||
        task.description.toLowerCase().includes(normalizedQuery)
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter
      const matchesCategory = categoryFilter === 'All' || task.category === categoryFilter
      const matchesDue = dueFilter === 'All'
        || (dueFilter === 'Today' && task.dueDate === todayKey)
        || (dueFilter === 'Upcoming' && task.dueDate && task.dueDate >= tomorrowKey)
        || (dueFilter === 'Overdue' && task.dueDate && task.dueDate < todayKey && task.status !== 'Completed')
        || (dueFilter === 'No date' && !task.dueDate)
      return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesDue
    })

    const priorityRank = { High: 0, Medium: 1, Low: 2 }
    return [...filtered].sort((a, b) => {
      if (sortBy === 'Priority') return priorityRank[a.priority] - priorityRank[b.priority]
      if (sortBy === 'Due date') return (a.dueDate || '9999').localeCompare(b.dueDate || '9999')
      if (sortBy === 'Created') return (b.createdAt || '').localeCompare(a.createdAt || '')
      return (b.updatedAt || '').localeCompare(a.updatedAt || '')
    })
  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter, dueFilter, sortBy, todayKey, tomorrowKey])

  const priorityDistribution = useMemo(() => ({
    High: tasks.filter(task => task.priority === 'High').length,
    Medium: tasks.filter(task => task.priority === 'Medium').length,
    Low: tasks.filter(task => task.priority === 'Low').length,
  }), [tasks])

  const recentlyUpdatedTasks = useMemo(
    () => [...tasks].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')).slice(0, 5),
    [tasks],
  )

  const weeklyProductivity = useMemo(() => {
    return weekKeys.map(day => ({
      label: day.label,
      count: tasks.filter(task =>
        task.status === 'Completed' && (task.updatedAt || '').slice(0, 10) === day.key,
      ).length,
    }))
  }, [tasks, weekKeys])

  const value = useMemo(() => ({
    ...taskState,
    gamification,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    totalCount,
    inProgressCount,
    completedCount,
    completionPercentage,
    filteredTasks,
    pendingCount,
    overdueCount,
    categoryFilter,
    setCategoryFilter,
    dueFilter,
    setDueFilter,
    sortBy,
    setSortBy,
    selectedIds,
    setSelectedIds,
    theme,
    setTheme,
    categories,
    setCategories,
    dashboardWidgets,
    setDashboardWidgets,
    projects,
    setProjects,
    priorityDistribution,
    recentlyUpdatedTasks,
    weeklyProductivity,
  }), [
    taskState,
    gamification,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    totalCount,
    inProgressCount,
    completedCount,
    completionPercentage,
    filteredTasks,
    pendingCount,
    overdueCount,
    categoryFilter,
    setCategoryFilter,
    dueFilter,
    setDueFilter,
    sortBy,
    setSortBy,
    selectedIds,
    setSelectedIds,
    theme,
    setTheme,
    categories,
    setCategories,
    dashboardWidgets,
    setDashboardWidgets,
    projects,
    setProjects,
    priorityDistribution,
    recentlyUpdatedTasks,
    weeklyProductivity,
  ])

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>
}
