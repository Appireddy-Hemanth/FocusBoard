import { Award, CheckCircle2, Flame, Focus, Target, Trophy } from 'lucide-react'
import { useTaskContext } from '../context/useTaskContext'

export default function AchievementsView() {
  const { gamification } = useTaskContext()

  const achievements = [
    {
      id: 'first-task-completed',
      title: 'First Task Completed',
      description: 'Complete your first task',
      icon: <Target size={22} />,
    },
    {
      id: 'five-tasks-completed',
      title: 'Five Tasks Completed',
      description: 'Complete five tasks',
      icon: <Flame size={22} />,
    },
    {
      id: 'ten-tasks-completed',
      title: 'Ten Tasks Completed',
      description: 'Complete ten tasks',
      icon: <CheckCircle2 size={22} />,
    },
    {
      id: 'first-focus-session',
      title: 'First Focus Session',
      description: 'Complete a Pomodoro focus session',
      icon: <Focus size={22} />,
    },
    {
      id: 'seven-day-habit-streak',
      title: 'Seven-Day Habit Streak',
      description: 'Complete one habit for seven consecutive days',
      icon: <Flame size={22} />,
    },
    {
      id: 'productivity-champion',
      title: 'Productivity Champion',
      description: 'Complete every current task',
      icon: <Trophy size={22} />,
    },
  ]

  const unlocked = gamification.unlockedAchievements || []
  const level = gamification.level

  return (
    <main className="main view-main" id="achievements">
      <header className="view-header">
        <div><p className="eyebrow">Milestones</p><h1>Achievements</h1></div>
        <div className="achievement-score"><Award size={18} /><strong>{gamification.xp} XP</strong></div>
      </header>

      <section className="level-card">
        <div className="level-card-heading">
          <span className="level-badge">Level {level.level}</span>
          <div><strong>{level.name}</strong><small>{gamification.xp} XP earned</small></div>
        </div>
        <div className="level-progress-track" role="progressbar" aria-label={`Level ${level.level} progress`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={level.progress}>
          <span style={{ width: `${level.progress}%` }} />
        </div>
        <small>
          {level.nextMin
            ? `${Math.max(0, level.nextMin - gamification.xp)} XP until Level ${level.level + 1}`
            : 'Maximum level reached'}
        </small>
      </section>

      <section className="achievement-grid">
        {achievements.map(achievement => {
          const isUnlocked = unlocked.includes(achievement.id)
          return (
            <article className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`} key={achievement.id}>
              <span className="achievement-icon">{achievement.icon}</span>
              <h2>{achievement.title}</h2>
              <p>{achievement.description}</p>
              <small>{isUnlocked ? 'Unlocked' : 'Locked'}</small>
            </article>
          )
        })}
      </section>
    </main>
  )
}
