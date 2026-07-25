export interface NotificationPrefs {
  email: boolean
  push: boolean
  medication: boolean
  appointment: boolean
  careTeam: boolean
  dailySummary: boolean
}

export interface PrivacyPrefs {
  shareWithTeam: boolean
  showActivity: boolean
  analytics: boolean
}

export interface AccessibilityPrefs {
  reduceMotion: boolean
  largeText: boolean
  highContrast: boolean
}

export interface CarePrefs {
  reminderLeadMinutes: number
  quietStart: string
  quietEnd: string
  emergencyPhone: string
}

export interface SettingsState {
  notifications: NotificationPrefs
  privacy: PrivacyPrefs
  accessibility: AccessibilityPrefs
  care: CarePrefs
}

export const defaultSettings: SettingsState = {
  notifications: {
    email: true,
    push: true,
    medication: true,
    appointment: false,
    careTeam: true,
    dailySummary: false,
  },
  privacy: {
    shareWithTeam: true,
    showActivity: true,
    analytics: false,
  },
  accessibility: {
    reduceMotion: false,
    largeText: false,
    highContrast: false,
  },
  care: {
    reminderLeadMinutes: 30,
    quietStart: '22:00',
    quietEnd: '07:00',
    emergencyPhone: '+1 (555) 432-8765',
  },
}

/** Left-hand sections, in order. `end` marks the index-equivalent tab. */
export const SETTINGS_SECTIONS = [
  { path: 'account', label: 'Account' },
  { path: 'notifications', label: 'Notifications' },
  { path: 'privacy', label: 'Privacy' },
  { path: 'accessibility', label: 'Accessibility' },
  { path: 'care-preferences', label: 'Care Preferences' },
  { path: 'about', label: 'About' },
] as const

/** Data-driven rows for the Notifications section, matching the design. */
export const NOTIFICATION_OPTIONS: {
  key: keyof NotificationPrefs
  label: string
  description: string
}[] = [
  {
    key: 'email',
    label: 'Email notifications',
    description: 'Receive daily logs, reports, and team changes via email.',
  },
  {
    key: 'push',
    label: 'Push notifications',
    description: 'Instant mobile / desktop pop-ups for critical events.',
  },
  {
    key: 'medication',
    label: 'Medication reminders',
    description: 'Alerts when scheduled medications are due or missed.',
  },
  {
    key: 'appointment',
    label: 'Appointment reminders',
    description: 'Reminders 24 hours and 1 hour before scheduled doctor visits.',
  },
  {
    key: 'careTeam',
    label: 'Care team updates',
    description: 'Notifications when tasks are completed by other members.',
  },
  {
    key: 'dailySummary',
    label: 'Daily summary email',
    description: "A synthesized review of the day's care tasks every evening at 8 PM.",
  },
]

export const PRIVACY_OPTIONS: {
  key: keyof PrivacyPrefs
  label: string
  description: string
}[] = [
  {
    key: 'shareWithTeam',
    label: 'Share care log with team',
    description: 'Let care team members see the daily task and medication log.',
  },
  {
    key: 'showActivity',
    label: 'Show my activity',
    description: 'Display when you complete tasks in the team’s recent activity.',
  },
  {
    key: 'analytics',
    label: 'Usage analytics',
    description: 'Share anonymous usage data to help improve CareConnect.',
  },
]

export const ACCESSIBILITY_OPTIONS: {
  key: keyof AccessibilityPrefs
  label: string
  description: string
}[] = [
  {
    key: 'reduceMotion',
    label: 'Reduce motion',
    description: 'Minimise animations and transitions across the app.',
  },
  {
    key: 'largeText',
    label: 'Larger text',
    description: 'Increase the base text size for easier reading.',
  },
  {
    key: 'highContrast',
    label: 'High contrast',
    description: 'Strengthen borders and text against the background.',
  },
]

export const REMINDER_LEAD_OPTIONS = [
  { value: 10, label: '10 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 120, label: '2 hours before' },
]

/** Same permissive check used elsewhere, adapted for phone digits. */
export function isPlausiblePhone(value: string): boolean {
  const digits = value.replace(/[^\d]/g, '')
  return digits.length >= 7 && digits.length <= 15
}
