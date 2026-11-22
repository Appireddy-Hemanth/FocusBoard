import { CalendarDays, Check, CheckSquare } from 'lucide-react'
import { useTaskContext } from '../context/useTaskContext'
import StatCard from './StatCard'

export default function StatsOverview() {
  const {
    totalCount,
    inProgressCount,
    completedCount,
    completionPercentage,
    pendingCount,
    overdueCount,
  } = useTaskContext()

  return (
    <section className="stats-grid" aria-label="Task overview">
      <StatCard
        tone="purple"
        icon={<CheckSquare size={20} />}
        label="Total tasks"
        value={totalCount}
      />
      <StatCard
        tone="blue"
        icon={<CalendarDays size={20} />}
        label="In progress"
        value={inProgressCount}
      />
      <StatCard
        tone="green"
        icon={<Check size={20} />}
        label="Completed"
        value={completedCount}
      />
      <StatCard
        label="Completion"
        value={completionPercentage}
        progress
      />
      <StatCard tone="purple" icon={<CheckSquare size={20} />} label="Pending" value={pendingCount} />
      <StatCard tone="blue" icon={<CalendarDays size={20} />} label="Overdue" value={overdueCount} />
    </section>
  )
}
