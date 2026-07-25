export interface Conversation {
  id: string
  name: string
  /** Short role badge shown in the thread header. */
  role: string
  topic: string
  preview: string
  /** Human label for the last activity, e.g. "10:15 AM", "Yesterday", "Oct 12". */
  updatedLabel: string
  unread: boolean
}

export interface Message {
  id: string
  conversationId: string
  /** "them" is the other party; "me" is the signed-in caregiver. */
  from: 'them' | 'me'
  senderName: string
  text: string
  timeLabel: string
}

export interface MailState {
  conversations: Conversation[]
  messages: Message[]
}

/** "9:45 AM"-style label for a freshly sent message. */
export function nowLabel(date = new Date()): string {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date)
}

export const mailSeed: MailState = {
  conversations: [
    {
      id: 'c-martinez',
      name: 'Dr. Martinez',
      role: 'Primary Care Physician',
      topic: 'Medication Adjustment Update',
      preview: 'Please reduce the Metformin dosage as discussed.',
      updatedLabel: '10:15 AM',
      unread: true,
    },
    {
      id: 'c-jenny',
      name: 'Nurse Jenny',
      role: 'Registered Nurse',
      topic: 'PT Progress Notes',
      preview: 'Eleanor did wonderfully during the stretching…',
      updatedLabel: 'Yesterday',
      unread: false,
    },
    {
      id: 'c-michael',
      name: 'Brother Michael',
      role: 'Family',
      topic: 'Weekend Schedule Coverage',
      preview: 'Hey Sarah, I can take the Saturday morning…',
      updatedLabel: 'Oct 12',
      unread: false,
    },
    {
      id: 'c-agency',
      name: 'Home Care Agency',
      role: 'Agency',
      topic: 'Care log report',
      preview: 'Weekly summary of daily visits has been posted.',
      updatedLabel: 'Oct 10',
      unread: false,
    },
    {
      id: 'c-pharmacy',
      name: 'Pharmacy',
      role: 'Pharmacy',
      topic: 'Refill is Ready',
      preview: 'Amlodipine refill is ready for pickup…',
      updatedLabel: 'Oct 8',
      unread: false,
    },
  ],
  messages: [
    {
      id: 'm-1',
      conversationId: 'c-martinez',
      from: 'them',
      senderName: 'Dr. Martinez',
      text: "Hi Sarah, following up on our visit today. Based on Eleanor's blood sugar readings, let's reduce Metformin from 500mg twice daily to once daily.",
      timeLabel: '09:30 AM',
    },
    {
      id: 'm-2',
      conversationId: 'c-martinez',
      from: 'me',
      senderName: 'You',
      text: "Understood, Dr. Martinez. I've updated the CareConnect scheduler and medication tracker. We will start the once-daily routine tonight.",
      timeLabel: '09:45 AM',
    },
    {
      id: 'm-3',
      conversationId: 'c-martinez',
      from: 'them',
      senderName: 'Dr. Martinez',
      text: "Perfect. Let's monitor her energy levels for the next week and message me if she experiences any sudden dizziness. Thank you!",
      timeLabel: '10:15 AM',
    },
    {
      id: 'm-4',
      conversationId: 'c-jenny',
      from: 'them',
      senderName: 'Nurse Jenny',
      text: 'Eleanor did wonderfully during the stretching session today. Her range of motion is improving steadily.',
      timeLabel: 'Yesterday',
    },
    {
      id: 'm-5',
      conversationId: 'c-michael',
      from: 'them',
      senderName: 'Brother Michael',
      text: 'Hey Sarah, I can take the Saturday morning shift this weekend so you can rest. Let me know.',
      timeLabel: 'Oct 12',
    },
    {
      id: 'm-6',
      conversationId: 'c-agency',
      from: 'them',
      senderName: 'Home Care Agency',
      text: 'The weekly summary of daily visits has been posted to the care log for your review.',
      timeLabel: 'Oct 10',
    },
    {
      id: 'm-7',
      conversationId: 'c-pharmacy',
      from: 'them',
      senderName: 'Pharmacy',
      text: 'Amlodipine refill is ready for pickup at your pharmacy. We are open until 8 PM.',
      timeLabel: 'Oct 8',
    },
  ],
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
