import {
  LayoutDashboard,
  CheckSquare,
  CalendarDays,
  StickyNote,
  Settings,
  Columns3,
  Timer,
  FolderKanban,
  Repeat,
  Sparkles,
  BarChart3,
  Trophy,
} from 'lucide-react'

export default function Sidebar({ activeView = 'dashboard', onNavigate }) {
  const navigate = view => onNavigate?.(view)
  const navItem = (view, label, icon) => (
    <button
      type="button"
      className={`nav-item ${activeView === view ? 'active' : ''}`}
      onClick={() => navigate(view)}
      aria-current={activeView === view ? 'page' : undefined}
      title={label}
    >
      {icon}{label}
    </button>
  )
  return (
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><span /><span /></div><strong>FocusBoard</strong></div>
      <nav aria-label="Primary navigation">
        {navItem('dashboard', 'Dashboard', <LayoutDashboard />)}
        {navItem('tasks', 'My Tasks', <CheckSquare />)}
        {navItem('projects', 'Projects', <FolderKanban />)}
        {navItem('kanban', 'Kanban', <Columns3 />)}
        {navItem('calendar', 'Calendar', <CalendarDays />)}
        {navItem('habits', 'Habit Tracker', <Repeat />)}
        {navItem('focus', 'Focus Timer', <Timer />)}
        {navItem('assistant', 'AI Assistant', <Sparkles />)}
        {navItem('analytics', 'Analytics', <BarChart3 />)}
        {navItem('achievements', 'Achievements', <Trophy />)}
        {navItem('notes', 'Focus Notes', <StickyNote />)}
        {navItem('eisenhower', 'Priority Matrix', <Columns3 />)}
        {navItem('goals', 'Goals', <Trophy />)}
        {navItem('inbox', 'Quick Inbox', <CheckSquare />)}
        {navItem('mood', 'Mood & Energy', <Repeat />)}
        {navItem('deep-work', 'Deep Work', <Timer />)}
        {navItem('weekly-review', 'Weekly Review', <BarChart3 />)}
        {navItem('workload', 'Workload', <BarChart3 />)}
      </nav>
      <div className="sidebar-bottom">
        <button type="button" className={`nav-item ${activeView === 'settings' ? 'active' : ''}`} onClick={() => navigate('settings')} aria-current={activeView === 'settings' ? 'page' : undefined}>
          <Settings />Settings
        </button>
        <div className="profile"><div className="avatar">AT</div><div><strong>Alex Taylor</strong><span>alex@focus.co</span></div></div>
      </div>
    </aside>
  )
}
