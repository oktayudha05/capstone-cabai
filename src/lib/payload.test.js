import { describe, expect, it } from 'vitest'
import { parseActuatorPayload, parseSensorPayload } from './payload.js'

describe('parseSensorPayload', () => {
  it('reads a bare number', () => {
    expect(parseSensorPayload('63.5')).toEqual({ value: 63.5, ts: null })
  })

  it('reads JSON with value and ts', () => {
    expect(parseSensorPayload('{"value": 61.2, "ts": 1737000000000}')).toEqual({ value: 61.2, ts: 1737000000000 })
  })

  it('accepts the moisture and humidity aliases', () => {
    expect(parseSensorPayload('{"moisture": 44}')?.value).toBe(44)
    expect(parseSensorPayload('{"humidity": 71}')?.value).toBe(71)
  })

  it('rejects empty, non numeric and malformed payloads', () => {
    expect(parseSensorPayload('')).toBeNull()
    expect(parseSensorPayload(undefined)).toBeNull()
    expect(parseSensorPayload('kering')).toBeNull()
    expect(parseSensorPayload('{"value": "basah"}')).toBeNull()
    expect(parseSensorPayload('{"value": 12')).toBeNull()
  })
})

describe('parseActuatorPayload', () => {
  it('normalizes the on states', () => {
    ;['on', 'ON', '1', 'true', 'nyala'].forEach((raw) => {
      expect(parseActuatorPayload(raw)?.state).toBe('on')
    })
  })

  it('normalizes the off states', () => {
    ;['off', 'OFF', '0', 'false', 'mati'].forEach((raw) => {
      expect(parseActuatorPayload(raw)?.state).toBe('off')
    })
  })

  it('reads JSON state and ts', () => {
    expect(parseActuatorPayload('{"state": "on", "ts": 1737000000000}')).toEqual({ state: 'on', ts: 1737000000000 })
  })

  it('rejects unknown states and malformed JSON', () => {
    expect(parseActuatorPayload('standby')).toBeNull()
    expect(parseActuatorPayload('')).toBeNull()
    expect(parseActuatorPayload('{"state":')).toBeNull()
  })
})
