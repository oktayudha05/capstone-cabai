export const HISTORY_LIMIT = 300

export const emptyFeed = {
  sensors: { soilMoisture: null, airHumidity: null },
  sensorSince: { soilMoisture: null, airHumidity: null },
  actuators: { fan: null, pump: null },
  actuatorSince: { fan: null, pump: null },
  deviceOnline: null,
  lastUpdated: null,
  history: [],
  events: [],
}

export function feedReducer(state, event) {
  switch (event.kind) {
    case 'sensor':
      return {
        ...state,
        sensors: { ...state.sensors, [event.field]: event.value },
        sensorSince: { ...state.sensorSince, [event.field]: event.ts },
        history: mergeHistory(state.history, event),
        lastUpdated: event.ts,
      }
    case 'actuator': {
      const previous = state.actuators[event.field]
      const changed = previous !== event.state

      return {
        ...state,
        actuators: { ...state.actuators, [event.field]: event.state },
        actuatorSince: changed ? { ...state.actuatorSince, [event.field]: event.ts } : state.actuatorSince,
        // The first report of a relay is the baseline, not a switching event.
        events:
          changed && previous !== null
            ? [...state.events, { field: event.field, state: event.state, ts: event.ts }].slice(-60)
            : state.events,
        lastUpdated: event.ts,
      }
    }
    case 'device':
      return { ...state, deviceOnline: event.state === 'online', lastUpdated: event.ts }
    default:
      return state
  }
}

// Firmware may send both sensor topics with the same ts (one row per device
// tick), or as bare scalars a few ms apart (one row per message). Both should
// land in one row, otherwise the history window halves and the chart shows two
// points per second. The window is short so two genuinely separate ticks stay
// separate.
const MERGE_WINDOW_MS = 400

function mergeHistory(history, event) {
  const last = history[history.length - 1]
  const sameTick = last && Math.abs(event.ts - last.ts) <= MERGE_WINDOW_MS

  if (sameTick && last[event.field] === undefined) {
    return [...history.slice(0, -1), { ...last, [event.field]: event.value }]
  }

  return [...history, { ts: event.ts, [event.field]: event.value }].slice(-HISTORY_LIMIT)
}
