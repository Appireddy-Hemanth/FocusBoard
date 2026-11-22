export const FOCUS_SESSIONS_STORAGE_KEY = 'focusboard_focus_sessions_v1'

export function createFocusSessionId() {
  return globalThis.crypto?.randomUUID?.()
    || `focus-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function readFocusSessions(storage = globalThis.localStorage) {
  try {
    const parsed = JSON.parse(storage.getItem(FOCUS_SESSIONS_STORAGE_KEY) || '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter(session =>
      session &&
      typeof session.id === 'string' &&
      typeof session.completedAt === 'string' &&
      Number.isFinite(Number(session.minutes)) &&
      Number(session.minutes) >= 0,
    )
  } catch {
    return []
  }
}

export function recordFocusSession(session, storage = globalThis.localStorage) {
  if (
    !session ||
    typeof session.id !== 'string' ||
    !session.id ||
    !Number.isFinite(Number(session.minutes)) ||
    Number(session.minutes) < 0 ||
    Number.isNaN(Date.parse(session.completedAt))
  ) {
    throw new TypeError('A focus session requires an ID, completion date, and non-negative duration.')
  }

  const sessions = readFocusSessions(storage)
  if (sessions.some(record => record.id === session.id)) return false

  storage.setItem(
    FOCUS_SESSIONS_STORAGE_KEY,
    JSON.stringify([...sessions, { ...session, minutes: Number(session.minutes) }].slice(-500)),
  )
  return true
}
