import type { Event } from '@/types'

function toGCalDate(date: string, time: string): string {
  return date.replace(/-/g, '') + 'T' + time.replace(':', '') + '00'
}

function addHour(date: string, time: string): string {
  const [h, m] = time.split(':').map(Number)
  const newH = h + 1
  if (newH >= 24) {
    const d = new Date(date)
    d.setDate(d.getDate() + 1)
    const nextDate = d.toISOString().slice(0, 10)
    return toGCalDate(nextDate, `${String(newH - 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }
  return toGCalDate(date, `${String(newH).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
}

export function buildGoogleCalendarUrl(event: Event): string {
  const start = toGCalDate(event.date, event.time)
  const end = event.endTime
    ? toGCalDate(event.date, event.endTime)
    : addHour(event.date, event.time)

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${start}/${end}`,
  })

  if (event.description) params.set('details', event.description)
  if (event.location) params.set('location', event.location)

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
