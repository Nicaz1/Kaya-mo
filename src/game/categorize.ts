import type { MeterKind } from '../types'

const KEYWORDS: Record<MeterKind, string[]> = {
  // Checked first — personal/body language tends to be more specific than work jargon.
  body: [
    'water',
    'drink',
    'meal',
    'breakfast',
    'lunch',
    'dinner',
    'snack',
    'meds',
    'medication',
    'workout',
    'walk',
    'stretch',
    'sleep',
    'nap',
    'doctor',
    'dentist',
    'appointment',
    'gym',
  ],
  heart: ['call', 'text', 'message', 'reply', 'friend', 'hang out', 'catch up', 'plan a', 'dm ', 'birthday'],
  nest: ['laundry', 'dish', 'clean', 'tidy', 'trash', 'grocer', 'vacuum', 'declutter', 'chore', 'mail'],
  focus: [
    'email',
    'inbox',
    'deck',
    'follow up',
    'follow-up',
    'meeting',
    'report',
    'project',
    'crm',
    'presentation',
    'slides',
    'invoice',
    'ticket',
    'standup',
  ],
}

const CHECK_ORDER: MeterKind[] = ['body', 'heart', 'nest', 'focus']

/**
 * Pure: guesses which meter a one-line quick-capture note belongs to by
 * keyword match. Always returns a best guess — the user can move it later,
 * so a wrong guess costs one tap, not a blocked capture.
 */
export function categorizeTask(title: string): MeterKind {
  const lower = title.toLowerCase()
  for (const meter of CHECK_ORDER) {
    if (KEYWORDS[meter].some((keyword) => lower.includes(keyword))) {
      return meter
    }
  }
  return 'focus'
}
