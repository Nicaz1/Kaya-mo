import type { Friend } from '../types'

/**
 * We can't guess who the user's friends are, so this starts empty — the
 * Friends screen shows a friendly empty state inviting them to add one.
 * Unlike tasks, there's no safe-to-assume default here.
 */
export function seedFriends(): Friend[] {
  return []
}
