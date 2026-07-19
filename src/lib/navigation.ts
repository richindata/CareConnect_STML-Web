export interface NavItem {
  to: string
  label: string
  /** Decorative — always paired with the visible label. */
  icon: string
  /** Second key in the "g then key" jump shortcut. */
  shortcut: string
  end?: boolean
}

export const navItems: NavItem[] = [
  { to: '/', label: 'Today', icon: '☀️', shortcut: 't', end: true },
  { to: '/reminders', label: 'Reminders', icon: '⏰', shortcut: 'r' },
  { to: '/routine', label: 'Routine', icon: '🗓️', shortcut: 'd' },
  { to: '/people', label: 'People', icon: '👥', shortcut: 'p' },
  { to: '/notes', label: 'Notes', icon: '📝', shortcut: 'n' },
  { to: '/settings', label: 'Settings', icon: '⚙️', shortcut: 's' },
]
