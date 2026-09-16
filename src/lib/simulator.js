// Dummy device. These numbers drive the simulator's own on/off decisions only,
// standing in for the microcontroller until the real one is wired up.
// They are not agronomic thresholds and are never shown as such in the UI.
const DUMMY_DEVICE = {
  soilDry: 55,
  soilWet: 70,
  airHumid: 80,
  airDry: 70,
}

const SOIL_DRAIN_PER_TICK = [0.18, 0.3]
const PUMP_REFILL_PER_TICK = 0.85
const SOIL_NOISE = 0.4
const AIR_NOISE = 0.8

export function createSimulator({ intervalMs = 1000, random = Math.random } = {}) {
  let soil = 62
  let air = 71
  let pump = 'off'
  let fan = 'off'
  let timer = null

  function step() {
    const ts = Date.now()

    const drain = SOIL_DRAIN_PER_TICK[0] + random() * (SOIL_DRAIN_PER_TICK[1] - SOIL_DRAIN_PER_TICK[0])
    const soilDrift = pump === 'on' ? PUMP_REFILL_PER_TICK : -drain
    soil = clamp(soil + soilDrift + (random() - 0.5) * SOIL_NOISE, 20, 95)
    air = clamp(air + (random() - 0.5) * AIR_NOISE, 45, 95)

    if (pump === 'off' && soil < DUMMY_DEVICE.soilDry) pump = 'on'
    else if (pump === 'on' && soil > DUMMY_DEVICE.soilWet) pump = 'off'

    if (fan === 'off' && air > DUMMY_DEVICE.airHumid) fan = 'on'
    else if (fan === 'on' && air < DUMMY_DEVICE.airDry) fan = 'off'

    return [
      { kind: 'sensor', field: 'soilMoisture', value: round1(soil), ts },
      { kind: 'sensor', field: 'airHumidity', value: round1(air), ts },
      { kind: 'actuator', field: 'pump', state: pump, ts },
      { kind: 'actuator', field: 'fan', state: fan, ts },
    ]
  }

  return {
    step,
    start(onEvents) {
      if (timer) return
      onEvents(step())
      timer = setInterval(() => onEvents(step()), intervalMs)
    },
    stop() {
      clearInterval(timer)
      timer = null
    },
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function round1(value) {
  return Math.round(value * 10) / 10
}
