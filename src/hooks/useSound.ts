import { useCallback } from 'react'
import { useAppState } from '../state/store'

// A single shared AudioContext for the whole app — created lazily on first
// use (browsers require a user gesture before audio can play anyway).
let sharedContext: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!sharedContext) sharedContext = new Ctor()
  return sharedContext
}

export type SoundKind = 'complete' | 'levelUp' | 'defeat'

// Short, quiet little melodies — no asset files, just sine-wave blips.
const SOUND_NOTES: Record<SoundKind, number[]> = {
  complete: [660, 880],
  levelUp: [660, 880, 1100],
  defeat: [880, 1100, 1320],
}

const NOTE_GAP_S = 0.09
const NOTE_LENGTH_S = 0.14
const PEAK_GAIN = 0.15

export function useSound() {
  const state = useAppState()

  const play = useCallback(
    (kind: SoundKind) => {
      if (!state.settings.soundOn) return
      const ctx = getContext()
      if (!ctx) return
      if (ctx.state === 'suspended') ctx.resume()

      const notes = SOUND_NOTES[kind]
      const start = ctx.currentTime
      notes.forEach((freq, i) => {
        const noteStart = start + i * NOTE_GAP_S
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.0001, noteStart)
        gain.gain.exponentialRampToValueAtTime(PEAK_GAIN, noteStart + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + NOTE_LENGTH_S)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(noteStart)
        osc.stop(noteStart + NOTE_LENGTH_S)
      })
    },
    [state.settings.soundOn],
  )

  return { play }
}
