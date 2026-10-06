import type { MeterKind } from '../types'

export const METER_META: Record<MeterKind, { label: string; emoji: string; barClass: string }> = {
  focus: { label: 'Focus', emoji: '🧠', barClass: 'bg-focus' },
  body: { label: 'Body', emoji: '💧', barClass: 'bg-body' },
  nest: { label: 'Nest', emoji: '🏡', barClass: 'bg-nest' },
  heart: { label: 'Heart', emoji: '💛', barClass: 'bg-heart' },
}

export const METER_ORDER: MeterKind[] = ['focus', 'body', 'nest', 'heart']
