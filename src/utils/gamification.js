export const GAMIFICATION_STORAGE_KEY = 'focusboard_gamification_v1'

export const LEVELS = [
  { level: 1, name: 'Beginner', minXp: 0 },
  { level: 2, name: 'Focus Explorer', minXp: 100 },
  { level: 3, name: 'Productivity Builder', minXp: 250 },
  { level: 4, name: 'Task Master', minXp: 500 },
  { level: 5, name: 'Focus Champion', minXp: 800 },
]

export function getLevelProgress(totalXp) {
  let current = LEVELS[0]
  let next = LEVELS[1] || null
  for (let index = LEVELS.length - 1; index >= 0; index -= 1) {
    if (totalXp >= LEVELS[index].minXp) {
      current = LEVELS[index]
      next = LEVELS[index + 1] || null
      break
    }
  }
  const progress = next
    ? Math.round(((totalXp - current.minXp) / (next.minXp - current.minXp)) * 100)
    : 100
  return {
    level: current.level,
    name: current.name,
    progress: Math.min(100, Math.max(0, progress)),
    currentMin: current.minXp,
    nextMin: next?.minXp || null,
  }
}

export function loadGamification() {
  try {
    const parsed = JSON.parse(localStorage.getItem(GAMIFICATION_STORAGE_KEY) || 'null')
    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid gamification state')
    return {
      xp: Number.isFinite(parsed.xp) ? parsed.xp : 0,
      earnedEvents: Array.isArray(parsed.earnedEvents) ? parsed.earnedEvents : [],
      unlockedAchievements: Array.isArray(parsed.unlockedAchievements)
        ? parsed.unlockedAchievements
        : [],
    }
  } catch {
    return { xp: 0, earnedEvents: [], unlockedAchievements: [] }
  }
}

export function saveGamification(state) {
  try {
    localStorage.setItem(GAMIFICATION_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Keep gamification in memory if storage is unavailable.
  }
}
