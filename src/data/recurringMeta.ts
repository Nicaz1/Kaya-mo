import type { RecurringKey } from '../types'

export const RECURRING_META: Record<RecurringKey, { emoji: string; label: string }> = {
  water: { emoji: '💧', label: 'Water' },
  breakfast: { emoji: '🍳', label: 'Breakfast' },
  lunch: { emoji: '🥗', label: 'Lunch' },
  dinner: { emoji: '🍽️', label: 'Dinner' },
  meds: { emoji: '💊', label: 'Meds' },
  movement: { emoji: '🚶', label: 'Move' },
  windDown: { emoji: '🌙', label: 'Wind down' },
}

export const RECURRING_ORDER: RecurringKey[] = ['water', 'breakfast', 'lunch', 'dinner', 'movement', 'windDown', 'meds']
