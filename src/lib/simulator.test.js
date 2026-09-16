import { describe, expect, it } from 'vitest'
import { createSimulator } from './simulator.js'

const FIXED_RANDOM = () => 0.5

function collect(ticks) {
  const simulator = createSimulator({ random: FIXED_RANDOM })
  return Array.from({ length: ticks }, () => simulator.step())
}

describe('createSimulator', () => {
  it('emits both sensors and both actuators every tick', () => {
    const [events] = collect(1)
    expect(events.map((event) => event.field)).toEqual(['soilMoisture', 'airHumidity', 'pump', 'fan'])
    expect(events.every((event) => typeof event.ts === 'number')).toBe(true)
  })

  it('stamps both sensor readings with the same timestamp', () => {
    const [events] = collect(1)
    const [soil, air] = events
    expect(soil.ts).toBe(air.ts)
  })

  it('keeps readings inside a plausible range over a long run', () => {
    const events = collect(2000).flat()
    const sensors = events.filter((event) => event.kind === 'sensor')

    const soil = sensors.filter((event) => event.field === 'soilMoisture').map((event) => event.value)
    const air = sensors.filter((event) => event.field === 'airHumidity').map((event) => event.value)

    expect(Math.min(...soil)).toBeGreaterThanOrEqual(20)
    expect(Math.max(...soil)).toBeLessThanOrEqual(95)
    expect(Math.min(...air)).toBeGreaterThanOrEqual(45)
    expect(Math.max(...air)).toBeLessThanOrEqual(95)
  })

  it('cycles the pump instead of leaving it stuck', () => {
    const states = new Set(
      collect(2000)
        .flat()
        .filter((event) => event.field === 'pump')
        .map((event) => event.state),
    )
    expect(states).toEqual(new Set(['on', 'off']))
  })

  it('starts and stops the interval timer', () => {
    let ticks = 0
    const simulator = createSimulator({ intervalMs: 5 })

    simulator.start(() => {
      ticks += 1
    })
    expect(ticks).toBe(1)

    simulator.stop()
    const afterStop = ticks
    expect(afterStop).toBe(1)
  })
})
