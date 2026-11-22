import { useState } from 'react'
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import { TaskProvider } from './context/TaskContext.jsx'
import { useTaskContext } from './context/useTaskContext'
import TaskModal from './components/TaskModal'
import DeleteConfirmModal from './components/DeleteConfirmModal'
import Sidebar from './components/Sidebar'
import MobileNavigation from './components/MobileNavigation'
import KanbanView from './pages/KanbanView'
import CalendarView from './pages/CalendarView'
import ProductivityView from './pages/ProductivityView'
import SettingsView from './pages/SettingsView'
import MyTasksView from './pages/MyTasksView'
import ProjectsView from './pages/ProjectsView'
import HabitTrackerView from './pages/HabitTrackerView'
import AssistantView from './pages/AssistantView'
import AnalyticsView from './pages/AnalyticsView'
import AchievementsView from './pages/AchievementsView'
import EisenhowerView from './pages/EisenhowerView'
import GoalsView from './pages/GoalsView'
import InboxView from './pages/InboxView'
import MoodView from './pages/MoodView'
import DeepWorkView from './pages/DeepWorkView'
import WeeklyReviewView from './pages/WeeklyReviewView'
import WorkloadView from './pages/WorkloadView'
import './App.css'

function FocusBoardApp() {
  const { dispatch, trashTask, categories, projects, tasks } = useTaskContext()
  const [formTask, setFormTask] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const activeView = location.pathname === '/'
    ? 'dashboard'
    : location.pathname.slice(1).replace(/-.*/, '')

  const showToast = message => {
    setToast(message)
    window.setTimeout(() => setToast(current => current === message ? '' : current), 2600)
  }

  const openCreateModal = () => setFormTask({ isNew: true })
  const openCreateModalForDate = dueDate =>
    setFormTask({ isNew: true, dueDate, title: '', description: '', category: 'Product', status: 'To do', priority: 'Medium', subtasks: [] })
  const closeTaskModal = () => setFormTask(null)

  const saveTask = values => {
    const today = new Date().toISOString().slice(0, 10)
    if (formTask?.id) {
      dispatch({
        type: 'UPDATE_TASK',
        payload: { id: formTask.id, changes: { ...values, updatedAt: today } },
      })
    } else {
      dispatch({
        type: 'ADD_TASK',
        payload: {
          ...values,
          id: globalThis.crypto?.randomUUID?.() || `task-${Date.now()}`,
          createdAt: today,
          updatedAt: today,
        },
      })
    }
    setFormTask(null)
    showToast(formTask?.id ? 'Task updated' : 'Task created')
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    trashTask(deleteTarget.id)
    setDeleteTarget(null)
    showToast('Task moved to Recently Deleted')
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Sidebar activeView={activeView} onNavigate={view => navigate(view === 'dashboard' ? '/' : `/${view}`)} />
      <MobileNavigation activeView={activeView} onNavigate={view => navigate(view === 'dashboard' ? '/' : `/${view}`)} />
      <Routes>
        <Route path="/" element={<Dashboard onAddTask={openCreateModal} onEditTask={setFormTask} onDeleteTask={setDeleteTarget} />} />
        <Route path="/tasks" element={<MyTasksView onAddTask={openCreateModal} onEditTask={setFormTask} onDeleteTask={setDeleteTarget} />} />
        <Route path="/projects" element={<ProjectsView onEditTask={setFormTask} />} />
        <Route path="/kanban" element={<KanbanView onEditTask={setFormTask} onAddTask={openCreateModal} />} />
        <Route path="/calendar" element={<CalendarView onEditTask={setFormTask} onCreateDate={openCreateModalForDate} />} />
        <Route path="/habits" element={<HabitTrackerView />} />
        <Route path="/focus" element={<ProductivityView />} />
        <Route path="/assistant" element={<AssistantView onEditTask={setFormTask} />} />
        <Route path="/analytics" element={<AnalyticsView />} />
        <Route path="/achievements" element={<AchievementsView />} />
        <Route path="/settings" element={<SettingsView />} />
        <Route path="/eisenhower" element={<EisenhowerView onEditTask={setFormTask} />} />
        <Route path="/goals" element={<GoalsView onEditTask={setFormTask} />} />
        <Route path="/inbox" element={<InboxView onConvert={values => {
          dispatch({
            type: 'ADD_TASK',
            payload: {
              ...values,
              id: globalThis.crypto?.randomUUID?.() || `task-${Date.now()}`,
              createdAt: new Date().toISOString().slice(0, 10),
              updatedAt: new Date().toISOString().slice(0, 10),
            },
          })
        }} />} />
        <Route path="/mood" element={<MoodView />} />
        <Route path="/deep-work" element={<DeepWorkView onExit={() => navigate('/focus')} />} />
        <Route path="/weekly-review" element={<WeeklyReviewView />} />
        <Route path="/workload" element={<WorkloadView />} />
        <Route path="/notes" element={<Dashboard onAddTask={openCreateModal} onEditTask={setFormTask} onDeleteTask={setDeleteTarget} />} />
        <Route path="*" element={<main className="main view-main not-found"><p className="eyebrow">404</p><h1>Page not found</h1><button type="button" className="add-button" onClick={() => navigate('/')}>Return to dashboard</button></main>} />
      </Routes>
      {formTask && (
        <TaskModal
          task={formTask.isNew ? null : formTask}
          initialDueDate={formTask.isNew ? formTask.dueDate : undefined}
          categories={categories}
          projects={projects}
          tasks={tasks}
          onClose={closeTaskModal}
          onSave={saveTask}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          task={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <TaskProvider>
        <FocusBoardApp />
      </TaskProvider>
    </BrowserRouter>
  )
}
