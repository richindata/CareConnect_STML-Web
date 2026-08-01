import { describe, expect, it } from 'vitest'
import { formatLongDate, greetingFor, initialsOf } from './dashboardData'

describe('dashboardData helpers', () => {
  it('builds initials from a display name', () => {
    expect(initialsOf('Sarah Jenkins')).toBe('SJ')
    expect(initialsOf('Eleanor')).toBe('E')
    expect(initialsOf('  ')).toBe('')
  })

  it('picks a greeting from the time of day', () => {
    expect(greetingFor(new Date(2026, 0, 1, 8))).toBe('Good morning')
    expect(greetingFor(new Date(2026, 0, 1, 15))).toBe('Good afternoon')
    expect(greetingFor(new Date(2026, 0, 1, 20))).toBe('Good evening')
  })

  it('formats a long date label', () => {
    expect(formatLongDate(new Date(2026, 6, 26))).toMatch(/July/)
  })
})
