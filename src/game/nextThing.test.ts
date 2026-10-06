import { describe, expect, it } from 'vitest'
import type { Meters, Task } from '../types'
import { pickNextTask, timeOfDayFor } from './nextThing'

const NO_RANDOM = () => 0

function makeTask(partial: Partial<Task> & Pick<Task, 'title' | 'meter'>): Task {
  return {
    id: partial.title,
    createdAt: new Date().toISOString(),
    completedAt: null,
    dread: false,
    isRecurring: false,
    ...partial,
  }
}

const EVEN_METERS: Meters = { focus: 70, body: 70, nest: 70, heart: 70 }

describe('timeOfDayFor', () => {
  it.each([
    [6, 'morning'],
    [13, 'midday'],
    [19, 'evening'],
    [2, 'night'],
  ] as const)('hour %i is %s', (hour, expected) => {
    expect(timeOfDayFor(hour)).toBe(expected)
  })
})

describe('pickNextTask', () => {
  it('returns null when there are no open tasks', () => {
    expect(pickNextTask([], EVEN_METERS)).toBeNull()
  })

  it('ignores completed tasks', () => {
    const tasks = [makeTask({ title: 'done one', meter: 'focus', completedAt: new Date().toISOString() })]
    expect(pickNextTask(tasks, EVEN_METERS)).toBeNull()
  })

  it('favors the task whose meter is most starved', () => {
    const meters: Meters = { focus: 80, body: 20, nest: 80, heart: 80 }
    const tasks = [makeTask({ title: 'focus task', meter: 'focus' }), makeTask({ title: 'body task', meter: 'body' })]
    const picked = pickNextTask(tasks, meters, { random: NO_RANDOM, now: new Date(2024, 0, 1, 12) })
    expect(picked?.title).toBe('body task')
  })

  it('gives recurring body tasks a boost when body is overdue, all else equal', () => {
    const meters: Meters = { focus: 80, body: 40, nest: 80, heart: 80 }
    const tasks = [
      makeTask({ title: 'one-off body task', meter: 'body', isRecurring: false }),
      makeTask({ title: 'recurring body task', meter: 'body', isRecurring: true, recurringKey: 'water' }),
    ]
    const picked = pickNextTask(tasks, meters, { random: NO_RANDOM, now: new Date(2024, 0, 1, 12) })
    expect(picked?.title).toBe('recurring body task')
  })

  it('prefers the task matching current energy when meters and time-of-day are equal', () => {
    const tasks = [
      makeTask({ title: 'nest low-energy', meter: 'nest', energy: 'low' }),
      makeTask({ title: 'heart high-energy', meter: 'heart', energy: 'high' }),
    ]
    // Midday: nest and heart have equal time-of-day affinity, so energy match decides.
    const picked = pickNextTask(tasks, EVEN_METERS, { random: NO_RANDOM, energy: 'low', now: new Date(2024, 0, 1, 12) })
    expect(picked?.title).toBe('nest low-energy')
  })
})
