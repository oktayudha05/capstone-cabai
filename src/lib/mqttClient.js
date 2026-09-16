import mqtt from 'mqtt'
import { SUBSCRIPTIONS, TOPICS } from './topics.js'
import { parseActuatorPayload, parseSensorPayload } from './payload.js'

const SENSOR_FIELD_BY_TOPIC = {
  [TOPICS.soilMoisture]: 'soilMoisture',
  [TOPICS.airHumidity]: 'airHumidity',
}

const ACTUATOR_FIELD_BY_TOPIC = {
  [TOPICS.fan]: 'fan',
  [TOPICS.pump]: 'pump',
}

export function connectMqtt({ url, username, password, onEvent, onStatus }) {
  const client = mqtt.connect(url, {
    clientId: `dash-cabai-${Math.random().toString(16).slice(2, 10)}`,
    username: username || undefined,
    password: password || undefined,
    clean: true,
    reconnectPeriod: 3000,
    connectTimeout: 8000,
  })

  // Klien mqtt.js hanya memancarkan 'close' dan 'reconnect' saat sambungan
  // pertama gagal, tanpa 'error', jadi status error tidak bisa bergantung pada
  // event itu. Patokannya: sudah pernah tersambung atau belum.
  let everConnected = false

  client.on('connect', () => {
    everConnected = true
    onStatus({ state: 'connected', message: `terhubung ke ${url}`, retrying: true })
    client.subscribe(SUBSCRIPTIONS, { qos: 0 }, (error) => {
      if (error) onStatus({ state: 'error', message: `subscribe gagal: ${error.message}`, retrying: true })
    })
  })

  client.on('error', (error) => onStatus({ state: 'error', message: error.message, retrying: true, hint: 'broker' }))

  client.on('close', () =>
    everConnected
      ? onStatus({ state: 'connecting', message: 'koneksi tertutup, menyambung ulang', retrying: true, hint: 'broker' })
      : onStatus({
          state: 'error',
          message: `tidak bisa menyambung ke ${url}`,
          retrying: true,
          hint: 'broker',
        }),
  )

  client.on('message', (topic, buffer) => {
    const raw = buffer.toString()

    if (topic === TOPICS.deviceStatus) {
      const state = raw.trim().toLowerCase() === 'online' ? 'online' : 'offline'
      onEvent({ kind: 'device', state, ts: Date.now() })
      return
    }

    const sensorField = SENSOR_FIELD_BY_TOPIC[topic]
    if (sensorField) {
      const parsed = parseSensorPayload(raw)
      if (parsed) onEvent({ kind: 'sensor', field: sensorField, value: parsed.value, ts: parsed.ts || Date.now() })
      return
    }

    const actuatorField = ACTUATOR_FIELD_BY_TOPIC[topic]
    if (actuatorField) {
      const parsed = parseActuatorPayload(raw)
      if (parsed) onEvent({ kind: 'actuator', field: actuatorField, state: parsed.state, ts: parsed.ts || Date.now() })
    }
  })

  return () => client.end(true)
}
