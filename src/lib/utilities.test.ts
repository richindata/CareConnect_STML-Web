import { describe, expect, it, beforeEach, vi } from 'vitest'
import { isPlausibleEmail } from './validation'
import { createId, readStored, writeStored } from './storage'
import {
  accountExists,
  clearSession,
  createAccount,
  normaliseEmail,
  normaliseRecoveryCode,
  readSession,
  resetPassword,
  verifyCredentials,
  writeSession,
} from './auth'
import {
  dateKey,
  formatTime,
  longDate,
  minutesOfDay,
  seedTasks,
  shortWeekday,
  todayKey,
  weekOf,
} from './myDay'
import {
  dosesForDay,
  isDoseTaken,
  seedMedications,
  summariseDoses,
  timesForFrequency,
  toggleDoseLog,
} from './meds'
import { initialsOf, nowLabel } from './mail'
import { isDoneToday, orderReminders, seedReminders, summarise } from './reminders'
import { toneForRole } from './careTeam'
import { isPlausiblePhone } from './settings'
import { generateReply, type AssistantContext } from './assistant'

describe('validation', () => {
  it('accepts plausible emails and rejects obvious typos', () => {
    expect(isPlausibleEmail('sarah@example.com')).toBe(true)
    expect(isPlausibleEmail('  a@b.co  ')).toBe(true)
    expect(isPlausibleEmail('not-an-email')).toBe(false)
    expect(isPlausibleEmail('missing@domain')).toBe(false)
  })
})

describe('storage', () => {
  beforeEach(() => localStorage.clear())

  it('round-trips JSON values and falls back on corrupt data', () => {
    writeStored('k', { ok: true })
    expect(readStored('k', { ok: false })).toEqual({ ok: true })
    expect(readStored('missing', 42)).toBe(42)

    localStorage.setItem('bad', '{not-json')
    expect(readStored('bad', 'fallback')).toBe('fallback')
  })

  it('swallows write failures when storage is unavailable', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    expect(() => writeStored('k', 1)).not.toThrow()
    spy.mockRestore()
  })

  it('creates prefixed ids', () => {
    expect(createId('task')).toMatch(/^task_/)
    expect(createId()).toMatch(/^id_/)
  })
})

describe('auth', () => {
  beforeEach(() => localStorage.clear())

  it('normalises emails and recovery codes', () => {
    expect(normaliseEmail('  Sarah@Example.COM ')).toBe('sarah@example.com')
    expect(normaliseRecoveryCode('ab12-cd34-ef56')).toBe('AB12CD34EF56')
  })

  it('creates accounts, detects duplicates, and verifies credentials', async () => {
    const created = await createAccount({
      fullName: 'Sarah Jenkins',
      email: 'sarah@example.com',
      password: 'correct-horse',
      caringFor: 'Eleanor',
    })
    expect(created.ok).toBe(true)
    expect(accountExists('SARAH@example.com')).toBe(true)

    const duplicate = await createAccount({
      fullName: 'Other',
      email: 'sarah@example.com',
      password: 'correct-horse',
    })
    expect(duplicate).toEqual({ ok: false, reason: 'email-taken' })

    const good = await verifyCredentials('sarah@example.com', 'correct-horse')
    expect(good.ok).toBe(true)
    if (good.ok) expect(good.user.fullName).toBe('Sarah Jenkins')

    const bad = await verifyCredentials('sarah@example.com', 'wrong')
    expect(bad).toEqual({ ok: false, reason: 'invalid-credentials' })
  })

  it('resets passwords with a recovery code and retires the old code', async () => {
    const created = await createAccount({
      fullName: 'Sarah',
      email: 'reset@example.com',
      password: 'old-password',
    })
    expect(created.ok).toBe(true)
    if (!created.ok) return

    const reset = await resetPassword('reset@example.com', created.recoveryCode, 'new-password')
    expect(reset.ok).toBe(true)

    const signedIn = await verifyCredentials('reset@example.com', 'new-password')
    expect(signedIn.ok).toBe(true)

    const replay = await resetPassword('reset@example.com', created.recoveryCode, 'another')
    expect(replay).toEqual({ ok: false, reason: 'invalid-recovery' })
  })

  it('reads, writes, and clears the session', () => {
    expect(readSession()).toBeNull()
    writeSession({ email: 'a@b.co', fullName: 'A' })
    expect(readSession()?.fullName).toBe('A')
    clearSession()
    expect(readSession()).toBeNull()

    localStorage.setItem('careconnect.session.v1', '{bad')
    expect(readSession()).toBeNull()
  })

  it('swallows corrupt account JSON and empty writes', async () => {
    localStorage.setItem('careconnect.accounts.v1', '{not-json')
    expect(accountExists('anyone@example.com')).toBe(false)

    const created = await createAccount({
      fullName: 'A',
      email: 'a@example.com',
      password: 'password1',
    })
    expect(created.ok).toBe(true)

    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    writeSession({ email: 'a@example.com', fullName: 'A' })
    clearSession()
    spy.mockRestore()
  })
})

describe('myDay helpers', () => {
  it('formats dates, times, and weeks', () => {
    const date = new Date(2026, 6, 26) // Sunday
    expect(dateKey(date)).toBe('2026-07-26')
    expect(todayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(weekOf(date)).toHaveLength(7)
    expect(shortWeekday(date)).toBeTruthy()
    expect(longDate('2026-07-26')).toMatch(/July/)
    expect(longDate('not-a-date')).toBe('')
    expect(minutesOfDay('08:30')).toBe(510)
    expect(formatTime('08:30')).toMatch(/8:30/)
    expect(seedTasks().length).toBeGreaterThan(0)
  })
})

describe('meds helpers', () => {
  it('derives frequencies, toggles doses, and summarises', () => {
    expect(timesForFrequency('twice')).toEqual(['08:00', '20:00'])
    expect(timesForFrequency('once')).toEqual(['08:00'])

    const meds = seedMedications()
    const morning = meds[0]
    expect(isDoseTaken(morning, '08:00')).toBe(true)

    const toggledOff = toggleDoseLog(morning, '08:00')
    expect(toggledOff.includes(`${todayKey()}|08:00`)).toBe(false)
    const toggledOn = toggleDoseLog({ ...morning, takenLog: toggledOff }, '08:00')
    expect(toggledOn.includes(`${todayKey()}|08:00`)).toBe(true)

    const summary = summariseDoses(meds)
    expect(summary.total).toBe(dosesForDay(meds).length)
    expect(summary.remaining).toBe(summary.total - summary.taken)
  })
})

describe('mail / reminders / careTeam / settings', () => {
  it('builds initials and time labels', () => {
    expect(initialsOf('Sarah Jenkins')).toBe('SJ')
    expect(initialsOf('  ')).toBe('')
    expect(nowLabel(new Date(2026, 0, 1, 9, 5))).toMatch(/9:05/)
  })

  it('orders and summarises reminders', () => {
    const reminders = seedReminders()
    expect(isDoneToday(reminders[0])).toBe(true)
    const ordered = orderReminders(reminders)
    expect(ordered.length).toBe(reminders.length)
    const summary = summarise(reminders)
    expect(summary.total).toBe(reminders.length)
    expect(summary.done + summary.remaining).toBe(summary.total)
  })

  it('maps roles to tones and validates phones', () => {
    expect(toneForRole('Primary Caregiver')).toBe('primary')
    expect(toneForRole('Registered Nurse')).toBe('nurse')
    expect(toneForRole('Family Member')).toBe('family')
    expect(toneForRole('Home Health Aide')).toBe('aide')
    expect(toneForRole('Geriatrician')).toBe('clinician')
    expect(isPlausiblePhone('+1 (555) 432-8765')).toBe(true)
    expect(isPlausiblePhone('123')).toBe(false)
  })
})

describe('assistant', () => {
  const ctx: AssistantContext = {
    subject: 'Eleanor',
    medications: seedMedications(),
    tasks: seedTasks(),
    team: [
      {
        id: '1',
        name: 'Sarah',
        role: 'Primary Caregiver',
        tone: 'primary',
        phone: '1',
        email: 'a@b.co',
        status: 'active',
        statusNote: 'now',
      },
    ],
  }

  it('answers medication, team, appointment, sleep, interaction, and fallback prompts', () => {
    expect(generateReply('what meds are due?', ctx).widget?.kind).toBe('meds')
    expect(generateReply('show care team schedule', ctx).widget?.kind).toBe('careTeam')
    expect(generateReply('upcoming appointments', ctx).widget?.kind).toBe('appointments')
    expect(generateReply('weekly health summary', ctx).widget?.kind).toBe('sleep')
    expect(generateReply('medication interactions', ctx).text).toMatch(/can't check|can’t check/i)
    expect(generateReply('hello there', ctx).text).toMatch(/demo assistant/i)
  })

  it('handles empty meds and empty team branches', () => {
    const empty: AssistantContext = { ...ctx, medications: [], team: [], tasks: [] }
    expect(generateReply('meds due today', empty).text).toMatch(/no medications/i)
    expect(generateReply('who is on the care team', empty).text).toMatch(/no one/i)
    expect(generateReply('doctor appointment', empty).text).toMatch(/could not find/i)
  })
})
