import { beforeEach, describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { calculateNextOccurrence } from '../utils/recurrence'
import {
  calculateStreak,
  countRecentDays,
  getHabitProgress,
  getHabitTargetPerWeek,
  isHabitDue,
} from '../utils/habitUtils'
import { getLevelProgress } from '../utils/gamification'
import { useGamification } from '../hooks/useGamification'

beforeEach(() => window.localStorage.clear())

describe('recurrence utility', () => {
  it('calculates daily, weekly, and monthly next occurrences', () => {
    expect(calculateNextOccurrence({ recurrence: 'Daily', dueDate: '2026-11-22' }, '2026-11-22')).toBe('2026-11-23')
    expect(calculateNextOccurrence({ recurrence: 'Weekly', dueDate: '2026-11-22' }, '2026-11-22')).toBe('2026-11-29')
    expect(calculateNextOccurrence({ recurrence: 'Monthly', dueDate: '2026-01-31' }, '2026-01-31')).toBe('2026-02-28')
  })
})

describe('habit calculations', () => {
  it('calculates current and longest streaks', () => {
    const result = calculateStreak(['2026-11-20', '2026-11-21', '2026-11-22'], {}, '2026-11-22')
    expect(result.current).toBe(3)
    expect(result.longest).toBe(3)
  })

  it('keeps weekday streaks across weekends but breaks after a missed scheduled day', () => {
    const habit = { frequency: 'Weekdays', startDate: '2026-11-16' }
    expect(calculateStreak(
      ['2026-11-19', '2026-11-20', '2026-11-23'],
      habit,
      '2026-11-23',
    )).toEqual({ current: 3, longest: 3 })
    expect(calculateStreak(
      ['2026-11-19', '2026-11-20'],
      habit,
      '2026-11-24',
    ).current).toBe(0)
  })

  it('tracks weekly and custom frequency targets and progress', () => {
    const weekly = { frequency: 'Weekly', selectedWeekdays: [1, 3], startDate: '2026-11-02' }
    expect(getHabitTargetPerWeek(weekly)).toBe(2)
    expect(isHabitDue(weekly, '2026-11-23')).toBe(true)
    expect(isHabitDue(weekly, '2026-11-24')).toBe(false)
    expect(calculateStreak(
      ['2026-11-09', '2026-11-11', '2026-11-16', '2026-11-18', '2026-11-23', '2026-11-25'],
      weekly,
      '2026-11-25',
    )).toEqual({ current: 3, longest: 3 })

    const custom = { frequency: 'Custom', targetPerWeek: 3 }
    expect(getHabitTargetPerWeek(custom)).toBe(3)
    expect(getHabitProgress(
      ['2026-11-18', '2026-11-20', '2026-11-22'],
      custom,
      '2026-11-22',
    )).toMatchObject({
      weekCount: 3,
      weekTarget: 3,
      weekPercentage: 100,
      monthCount: 3,
      monthTarget: 13,
    })
  })

  it('counts completion dates within a range', () => {
    const localToday = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
    expect(countRecentDays([localToday, localToday], 7, localToday)).toBe(1)
  })
})

describe('gamification levels', () => {
  it('calculates levels and next-level progress', () => {
    expect(getLevelProgress(0)).toMatchObject({ level: 1, name: 'Beginner' })
    expect(getLevelProgress(150)).toMatchObject({ level: 2, name: 'Focus Explorer' })
  })
})

describe('gamification reward de-duplication', () => {
  it('awards task XP once for a completion transition', () => {
    const pending = [{ id: 'task-x', title: 'XP task', status: 'To do', priority: 'High', dueDate: '2099-01-01', updatedAt: '2026-11-22' }]
    const { result, rerender } = renderHook(({ tasks }) => useGamification(tasks), {
      initialProps: { tasks: pending },
    })

    const completed = [{ ...pending[0], status: 'Completed' }]
    rerender({ tasks: completed })
    expect(result.current.xp).toBe(25)

    act(() => rerender({ tasks: [{ ...completed[0] }] }))
    expect(result.current.xp).toBe(25)
  })
})
