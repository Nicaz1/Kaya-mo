import { moodForMeter } from '../game/meters'
import type { Meters, MeterKind } from '../types'

const LOW_LINES: Record<MeterKind, string> = {
  focus: 'My brain feels foggy. One tiny work thing would help.',
  body: "I'm parched... want to drink a glass of water with me?",
  nest: "It's a little messy in here. A 5-minute tidy would feel so good.",
  heart: "I miss someone. Maybe send a quick text?",
}

const GREAT_LINES: Record<MeterKind, string> = {
  focus: 'My brain feels so clear right now!',
  body: 'I feel strong and taken care of.',
  nest: 'This space feels cozy and calm.',
  heart: 'I feel so loved and connected.',
}

const NEUTRAL_LINE = "Hi! I'm glad you're here."

/** Pure: picks a line of dialogue from the pet based on the current meters. */
export function getPetLine(meters: Meters): string {
  const entries = Object.entries(meters) as [MeterKind, number][]
  const [lowestKind, lowestValue] = entries.reduce((a, b) => (b[1] < a[1] ? b : a))
  if (moodForMeter(lowestValue) === 'droopy' || moodForMeter(lowestValue) === 'low') {
    return LOW_LINES[lowestKind]
  }
  const [highestKind, highestValue] = entries.reduce((a, b) => (b[1] > a[1] ? b : a))
  if (moodForMeter(highestValue) === 'great' && highestValue >= 85) {
    return GREAT_LINES[highestKind]
  }
  return NEUTRAL_LINE
}

/** What Kaya says when you tap/pet it — pure delight, unrelated to meters. */
const PETTED_LINES = ['Hehe, that tickles!', 'Aww, thank you!', "You're the best!", 'Yay, pets!', '💛💛💛', 'More of that please!']

/** Pure: picks a random petted quip. Injectable random for tests. */
export function getPettedLine(random: () => number = Math.random): string {
  const index = Math.floor(random() * PETTED_LINES.length)
  return PETTED_LINES[index]
}
