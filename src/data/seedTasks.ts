import type { Task } from '../types'

function task(partial: Partial<Task> & Pick<Task, 'title' | 'meter'>): Task {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    completedAt: null,
    dread: false,
    isRecurring: false,
    ...partial,
  }
}

/**
 * Starter content so Kaya is useful in the first minute. All editable/removable
 * later — this just means the user never stares at an empty list.
 */
export function seedTasks(): Task[] {
  return [
    // Focus
    task({ title: 'Clear inbox for 10 min', meter: 'focus', energy: 'low' }),
    task({ title: 'Prep for your next meeting', meter: 'focus', energy: 'medium' }),
    task({ title: 'Update notes/CRM after calls', meter: 'focus', energy: 'low' }),
    task({ title: 'One deep-work block on your most important project', meter: 'focus', energy: 'high' }),
    task({ title: 'Follow up on one open thread', meter: 'focus', energy: 'medium' }),

    // Body — recurring self-care defaults
    task({ title: 'Drink a glass of water', meter: 'body', energy: 'low', isRecurring: true, recurringKey: 'water' }),
    task({ title: 'Eat breakfast', meter: 'body', energy: 'low', isRecurring: true, recurringKey: 'breakfast' }),
    task({ title: 'Eat lunch', meter: 'body', energy: 'low', isRecurring: true, recurringKey: 'lunch' }),
    task({ title: 'Eat dinner', meter: 'body', energy: 'low', isRecurring: true, recurringKey: 'dinner' }),
    task({ title: 'Take a short movement break', meter: 'body', energy: 'low', isRecurring: true, recurringKey: 'movement' }),
    task({ title: 'Wind down for bed', meter: 'body', energy: 'low', isRecurring: true, recurringKey: 'windDown' }),

    // Nest
    task({ title: 'Do the dishes', meter: 'nest', energy: 'low' }),
    task({ title: '5-minute tidy', meter: 'nest', energy: 'low' }),
    task({ title: 'Start a load of laundry', meter: 'nest', energy: 'medium' }),
    task({ title: 'Take out the trash', meter: 'nest', energy: 'low' }),
    task({ title: 'Grab groceries', meter: 'nest', energy: 'medium' }),

    // Heart
    task({ title: "Text a friend you haven't talked to in a while", meter: 'heart', energy: 'low' }),
    task({ title: "Reply to a message you've been sitting on", meter: 'heart', energy: 'low' }),
    task({ title: 'Make a plan for the weekend', meter: 'heart', energy: 'medium' }),
  ]
}
