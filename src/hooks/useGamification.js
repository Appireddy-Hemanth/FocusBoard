import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  getLevelProgress,
  loadGamification,
  saveGamification,
} from '../utils/gamification'

export function useGamification(tasks) {
  const [state, setState] = useState(loadGamification)
  const previousTasksRef = useRef(tasks)

  const unlockAchievement = useCallback(id => {
    setState(current => current.unlockedAchievements.includes(id)
      ? current
      : {
          ...current,
          unlockedAchievements: [...current.unlockedAchievements, id],
        })
  }, [])

  const awardXp = useCallback((eventId, amount, reason) => {
    let awarded = false
    setState(current => {
      if (current.earnedEvents.includes(eventId)) return current
      awarded = true
      return {
        ...current,
        xp: current.xp + amount,
        earnedEvents: [...current.earnedEvents, eventId],
        lastReward: { amount, reason, at: new Date().toISOString() },
      }
    })
    return awarded
  }, [])

  useEffect(() => {
    saveGamification(state)
  }, [state])

  useEffect(() => {
    const previous = previousTasksRef.current
    for (const task of tasks) {
      const before = previous.find(item => item.id === task.id)
      if (!before || before.status === 'Completed' || task.status !== 'Completed') continue

      const localToday = (() => {
        const date = new Date()
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      })()
      const baseXp = task.priority === 'High' ? 20 : 10
      const deadlineBonus = task.dueDate && task.dueDate >= localToday ? 5 : 0
      const eventId = `task:${task.id}:completed:${task.updatedAt || localToday}`
      awardXp(eventId, baseXp + deadlineBonus, `${task.title} completed`)
    }
    const completedCount = tasks.filter(item => item.status === 'Completed').length
    const idsToUnlock = []
    if (completedCount >= 1) idsToUnlock.push('first-task-completed')
    if (completedCount >= 5) idsToUnlock.push('five-tasks-completed')
    if (completedCount >= 10) idsToUnlock.push('ten-tasks-completed')
    if (tasks.length > 0 && completedCount === tasks.length) idsToUnlock.push('productivity-champion')
    if (idsToUnlock.length) {
      queueMicrotask(() => {
        idsToUnlock.forEach(id => unlockAchievement(id))
      })
    }
    previousTasksRef.current = tasks
  }, [tasks, awardXp, unlockAchievement])

  const awardHabitCompletion = useCallback((habitId, dateKey) => {
    awardXp(`habit:${habitId}:${dateKey}`, 5, 'Daily habit completed')
  }, [awardXp])

  const awardFocusSession = useCallback(() => {
    const now = new Date()
    const dateKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    awardXp(`focus:${dateKey}:${now.getTime()}`, 5, 'Focus session completed')
  }, [awardXp])


  const level = useMemo(() => getLevelProgress(state.xp), [state.xp])

  return useMemo(() => ({
    xp: state.xp,
    earnedEvents: state.earnedEvents,
    unlockedAchievements: state.unlockedAchievements,
    lastReward: state.lastReward,
    level,
    awardHabitCompletion,
    awardFocusSession,
    unlockAchievement,
  }), [state, level, awardHabitCompletion, awardFocusSession, unlockAchievement])
}
