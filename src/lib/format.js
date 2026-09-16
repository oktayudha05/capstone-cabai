export function formatPercent(value) {
  return value.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}

export function formatClock(ts) {
  return new Date(ts).toLocaleTimeString('id-ID', { hour12: false })
}

export function clampPercent(value) {
  return Math.min(100, Math.max(0, value))
}

// One vocabulary for a relay, shared by the tile, the event log, and the strip,
// so the same state never reads two different ways on one screen.
export const ACTUATOR_LABELS = {
  fan: 'Kipas',
  pump: 'Pompa air',
}

export const STATE_LABELS = {
  on: 'menyala',
  off: 'mati',
}

export function formatState(state) {
  return STATE_LABELS[state] ?? 'belum ada data'
}

export function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms < 0) return '0 detik'

  const totalSeconds = Math.floor(ms / 1000)
  if (totalSeconds < 60) return `${totalSeconds} detik`

  const minutes = Math.floor(totalSeconds / 60)
  if (minutes < 60) return `${minutes} menit`

  const hours = Math.floor(minutes / 60)
  return `${hours} jam ${minutes % 60} menit`
}
