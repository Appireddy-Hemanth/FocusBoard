import {
  LayoutDashboard,
  CheckSquare,
  Columns3,
  CalendarDays,
  Settings,
  FolderKanban,
  Repeat,
  Timer,
  Sparkles,
  BarChart3,
  Trophy,
  StickyNote,
} from 'lucide-react'

export default function MobileNavigation({ activeView = 'dashboard', onNavigate }) {
  const item = (view, label, Icon) => (
    <button
      type="button"
      className={`mobile-nav-item ${activeView === view ? 'active' : ''}`}
      onClick={() => onNavigate?.(view)}
      aria-current={activeView === view ? 'page' : undefined}
      aria-label={label}
      title={label}
    >
      <Icon size={20} /><span>{label}</span>
    </button>
  )
  return (
    <nav className="mobile-navigation" aria-label="Mobile navigation">
      {item('dashboard', 'Dashboard', LayoutDashboard)}
      {item('tasks', 'Tasks', CheckSquare)}
      {item('kanban', 'Kanban', Columns3)}
      {item('calendar', 'Calendar', CalendarDays)}
      {item('projects', 'Projects', FolderKanban)}
      {item('habits', 'Habits', Repeat)}
      {item('focus', 'Focus', Timer)}
      {item('assistant', 'Assistant', Sparkles)}
      {item('analytics', 'Analytics', BarChart3)}
      {item('achievements', 'Achievements', Trophy)}
      {item('notes', 'Notes', StickyNote)}
      {item('settings', 'Settings', Settings)}
      {item('eisenhower', 'Matrix', Columns3)}
      {item('goals', 'Goals', Trophy)}
      {item('inbox', 'Inbox', CheckSquare)}
      {item('mood', 'Mood', Repeat)}
      {item('deep-work', 'Deep Work', Timer)}
      {item('weekly-review', 'Review', BarChart3)}
      {item('workload', 'Workload', BarChart3)}
    </nav>
  )
}
