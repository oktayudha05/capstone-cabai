import { describe, expect, it } from 'vitest'
import { HISTORY_LIMIT, emptyFeed, feedReducer } from './feedReducer.js'

function apply(events) {
  return events.reduce(feedReducer, emptyFeed)
}

function sample(ts, soil, air) {
  return [
    { kind: 'sensor', field: 'soilMoisture', value: soil, ts },
    { kind: 'sensor', field: 'airHumidity', value: air, ts },
  ]
}

describe('feedReducer', () => {
  it('merges readings that share a timestamp into one history row', () => {
    const state = apply(sample(1000, 62, 71))
    expect(state.sensors).toEqual({ soilMoisture: 62, airHumidity: 71 })
    expect(state.history).toEqual([{ ts: 1000, soilMoisture: 62, airHumidity: 71 }])
  })

  it('merges readings from the same tick that arrive a few ms apart', () => {
    const state = apply([
      { kind: 'sensor', field: 'soilMoisture', value: 62, ts: 1000 },
      { kind: 'sensor', field: 'airHumidity', value: 71, ts: 1040 },
    ])
    expect(state.history).toEqual([{ ts: 1000, soilMoisture: 62, airHumidity: 71 }])
  })

  it('keeps readings from different ticks in separate rows', () => {
    const state = apply([
      { kind: 'sensor', field: 'soilMoisture', value: 62, ts: 1000 },
      { kind: 'sensor', field: 'airHumidity', value: 71, ts: 2000 },
    ])
    expect(state.history).toHaveLength(2)
    expect(state.history[1]).toEqual({ ts: 2000, airHumidity: 71 })
  })

  it('does not overwrite a reading already present in the row', () => {
    const state = apply([
      { kind: 'sensor', field: 'soilMoisture', value: 62, ts: 1000 },
      { kind: 'sensor', field: 'soilMoisture', value: 61, ts: 1100 },
    ])
    expect(state.history).toHaveLength(2)
    expect(state.history[0].soilMoisture).toBe(62)
    expect(state.history[1].soilMoisture).toBe(61)
  })

  it('pushes a new row for a later timestamp', () => {
    const state = apply([...sample(1000, 62, 71), ...sample(2000, 61, 72)])
    expect(state.history).toHaveLength(2)
    expect(state.history[1]).toEqual({ ts: 2000, soilMoisture: 61, airHumidity: 72 })
  })

  it('caps the history at the limit', () => {
    const events = Array.from({ length: HISTORY_LIMIT + 40 }, (_, index) => sample(index * 1000, 60, 70)).flat()
    const state = apply(events)
    expect(state.history).toHaveLength(HISTORY_LIMIT)
    expect(state.history.at(-1).ts).toBe((HISTORY_LIMIT + 39) * 1000)
  })

  it('tracks actuator and device events', () => {
    const state = apply([
      { kind: 'actuator', field: 'pump', state: 'on', ts: 1000 },
      { kind: 'actuator', field: 'fan', state: 'off', ts: 1000 },
      { kind: 'device', state: 'online', ts: 1000 },
    ])
    expect(state.actuators).toEqual({ pump: 'on', fan: 'off' })
    expect(state.deviceOnline).toBe(true)
  })

  it('keeps the first seen time of an actuator and moves it on change', () => {
    const opened = apply([{ kind: 'actuator', field: 'pump', state: 'on', ts: 5000 }])
    expect(opened.actuatorSince.pump).toBe(5000)

    const repeated = feedReducer(opened, { kind: 'actuator', field: 'pump', state: 'on', ts: 9000 })
    expect(repeated.actuatorSince.pump).toBe(5000)

    const flipped = feedReducer(repeated, { kind: 'actuator', field: 'pump', state: 'off', ts: 12000 })
    expect(flipped.actuatorSince.pump).toBe(12000)
  })

  it('logs a switching event only after a state change, not the first report', () => {
    const first = apply([{ kind: 'actuator', field: 'pump', state: 'on', ts: 1000 }])
    expect(first.events).toHaveLength(0)

    const same = feedReducer(first, { kind: 'actuator', field: 'pump', state: 'on', ts: 2000 })
    expect(same.events).toHaveLength(0)

    const flipped = feedReducer(same, { kind: 'actuator', field: 'pump', state: 'off', ts: 3000 })
    expect(flipped.events).toEqual([{ field: 'pump', state: 'off', ts: 3000 }])
  })

  it('caps the event log', () => {
    let state = apply([{ kind: 'actuator', field: 'pump', state: 'on', ts: 0 }])
    for (let index = 1; index <= 80; index += 1) {
      state = feedReducer(state, {
        kind: 'actuator',
        field: 'pump',
        state: index % 2 === 0 ? 'on' : 'off',
        ts: index * 1000,
      })
    }
    expect(state.events).toHaveLength(60)
  })

  it('records when each sensor was last read', () => {
    const state = apply(sample(1000, 62, 71))
    expect(state.sensorSince).toEqual({ soilMoisture: 1000, airHumidity: 1000 })
  })

  it('ignores unknown events', () => {
    expect(feedReducer(emptyFeed, { kind: 'telemetry' })).toBe(emptyFeed)
  })
})
