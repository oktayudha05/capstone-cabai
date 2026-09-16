const ON_STATES = new Set(['on', '1', 'true', 'nyala', 'active'])
const OFF_STATES = new Set(['off', '0', 'false', 'mati', 'inactive'])

// ESP32 side may publish JSON or a bare scalar. Accept both so a firmware
// change does not break the dashboard.
export function parseSensorPayload(raw) {
  const text = String(raw ?? '').trim()
  if (!text) return null

  if (text.startsWith('{')) {
    try {
      const parsed = JSON.parse(text)
      const value = Number(parsed.value ?? parsed.moisture ?? parsed.humidity)
      if (!Number.isFinite(value)) return null
      return { value, ts: Number(parsed.ts) || null }
    } catch {
      return null
    }
  }

  const value = Number(text)
  return Number.isFinite(value) ? { value, ts: null } : null
}

export function parseActuatorPayload(raw) {
  const text = String(raw ?? '').trim().toLowerCase()
  if (!text) return null

  if (text.startsWith('{')) {
    try {
      const parsed = JSON.parse(text)
      return buildState(String(parsed.state ?? parsed.value ?? ''), parsed.ts)
    } catch {
      return null
    }
  }

  return buildState(text, null)
}

function buildState(state, ts) {
  if (ON_STATES.has(state)) return { state: 'on', ts: Number(ts) || null }
  if (OFF_STATES.has(state)) return { state: 'off', ts: Number(ts) || null }
  return null
}
