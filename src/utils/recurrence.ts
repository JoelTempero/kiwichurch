import type { EventRecurrence } from '@/types'

export interface RecurrenceLabel {
  value: EventRecurrence
  label: string
  description: string
}

export const RECURRENCE_OPTIONS: RecurrenceLabel[] = [
  { value: 'none', label: 'Does not repeat', description: 'A one-off event' },
  { value: 'weekly', label: 'Every week', description: 'Same day each week' },
  { value: 'fortnightly', label: 'Every 2 weeks', description: 'Same day every fortnight' },
  { value: 'monthly', label: 'Every month', description: 'Same date each month' },
]

export function recurrenceLabel(value?: EventRecurrence): string {
  const opt = RECURRENCE_OPTIONS.find((o) => o.value === value)
  return opt ? opt.label : 'Does not repeat'
}

// Returns YYYY-MM-DD for each occurrence in the series, starting with `startDate`.
// `count` is total occurrences in the series (including the start).
//
// Date arithmetic uses setDate(+N) on a cloned Date rather than millisecond
// addition. Millisecond addition silently drifts an hour across a daylight-
// saving boundary (NZ shifts at 2am last Sun Sep / first Sun Apr) and the
// resulting Date's `getDate()` lands on the previous day. setDate avoids that
// because the calendar field is what we advance, not the wall-clock offset.
export function generateRecurrenceDates(
  startDate: string,
  recurrence: EventRecurrence,
  count: number,
): string[] {
  if (recurrence === 'none' || count < 2) return [startDate]
  const start = parseISODate(startDate)
  if (!start) return [startDate]

  const result: string[] = []
  for (let i = 0; i < count; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate())
    if (recurrence === 'weekly') {
      d.setDate(d.getDate() + i * 7)
    } else if (recurrence === 'fortnightly') {
      d.setDate(d.getDate() + i * 14)
    } else if (recurrence === 'monthly') {
      d.setMonth(d.getMonth() + i)
    }
    result.push(toISODate(d))
  }
  return result
}

function parseISODate(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
  if (!m) return null
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
}

function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function makeSeriesId(): string {
  return `series_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}
