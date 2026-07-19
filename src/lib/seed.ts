import type { AppData } from './types'

/**
 * First-run content. A blank app is disorienting for the people CareConnect is
 * built for, so a plausible day is seeded and can be reset from Settings.
 */
export const seedData: AppData = {
  reminders: [
    {
      id: 'rem_morning_meds',
      title: 'Take morning tablets',
      time: '08:00',
      kind: 'medication',
      notes: 'Blue pill and white pill, with breakfast and a full glass of water.',
      completedOn: [],
    },
    {
      id: 'rem_breakfast',
      title: 'Eat breakfast',
      time: '08:30',
      kind: 'meal',
      completedOn: [],
    },
    {
      id: 'rem_walk',
      title: 'Short walk around the garden',
      time: '10:30',
      kind: 'activity',
      notes: 'Wear the blue jacket if it looks cold.',
      completedOn: [],
    },
    {
      id: 'rem_lunch',
      title: 'Lunch',
      time: '12:30',
      kind: 'meal',
      completedOn: [],
    },
    {
      id: 'rem_call_daughter',
      title: 'Video call with Priya',
      time: '16:00',
      kind: 'activity',
      notes: 'Priya calls you — the tablet will ring. Press the big green button.',
      completedOn: [],
    },
    {
      id: 'rem_evening_meds',
      title: 'Take evening tablets',
      time: '20:00',
      kind: 'medication',
      notes: 'One yellow pill, after dinner.',
      completedOn: [],
    },
  ],
  routine: [
    { id: 'ro_1', title: 'Wake up and open the curtains', part: 'morning' },
    {
      id: 'ro_2',
      title: 'Wash and get dressed',
      part: 'morning',
      detail: "Today's clothes are laid out on the chair by the window.",
    },
    { id: 'ro_3', title: 'Breakfast and morning tablets', part: 'morning' },
    { id: 'ro_4', title: 'Walk, radio, or the crossword', part: 'afternoon' },
    { id: 'ro_5', title: 'Lunch at the kitchen table', part: 'afternoon' },
    { id: 'ro_6', title: 'Rest or a nap in the armchair', part: 'afternoon' },
    { id: 'ro_7', title: 'Dinner and evening tablets', part: 'evening' },
    { id: 'ro_8', title: 'Television, then bed around 10pm', part: 'evening' },
  ],
  people: [
    {
      id: 'per_priya',
      name: 'Priya Raman',
      relationship: 'Daughter — main carer',
      phone: '+1-555-0142',
      isEmergencyContact: true,
    },
    {
      id: 'per_dev',
      name: 'Dev Raman',
      relationship: 'Son',
      phone: '+1-555-0177',
      isEmergencyContact: false,
    },
    {
      id: 'per_nurse',
      name: 'Nurse Ellen Boateng',
      relationship: 'Community nurse — visits Tuesdays',
      phone: '+1-555-0190',
      isEmergencyContact: false,
    },
    {
      id: 'per_gp',
      name: 'Dr. Alan Whitfield',
      relationship: 'Family doctor',
      phone: '+1-555-0110',
      isEmergencyContact: false,
    },
  ],
  notes: [
    {
      id: 'note_1',
      body: 'The spare front door key is in the blue bowl on the hall table.',
      createdAt: '2026-07-14T09:15:00.000Z',
    },
    {
      id: 'note_2',
      body: 'Priya visits on Saturday afternoon and is bringing the grandchildren.',
      createdAt: '2026-07-16T18:40:00.000Z',
    },
  ],
}
