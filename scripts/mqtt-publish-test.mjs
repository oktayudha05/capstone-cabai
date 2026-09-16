// Publish dummy readings to HiveMQ public broker for integration testing.
// Usage: node scripts/mqtt-publish-test.mjs [seconds]
import mqtt from 'mqtt'

const SECONDS = Number(process.argv[2] || 15)
const PREFIX = process.env.MQTT_PREFIX || 'capstone/cabai'
const client = mqtt.connect('mqtt://broker.hivemq.com:1883', { clientId: `cabai-test-${Date.now()}` })

let soil = 62
let air = 74
let ticks = 0

client.on('connect', () => {
  console.log(`connected, publishing to ${PREFIX}/* for ${SECONDS}s`)
  client.publish(`${PREFIX}/status`, 'online', { retain: true, qos: 1 })

  const timer = setInterval(() => {
    soil = Math.max(40, soil - 0.6)
    air = Math.min(90, air + 0.3)
    client.publish(`${PREFIX}/sensor/soil-moisture`, soil.toFixed(1), { retain: true })
    client.publish(`${PREFIX}/sensor/air-humidity`, air.toFixed(1), { retain: true })
    client.publish(`${PREFIX}/actuator/pump`, soil < 55 ? 'on' : 'off', { retain: true })
    client.publish(`${PREFIX}/actuator/fan`, air > 80 ? 'on' : 'off', { retain: true })
    ticks += 1
    if (ticks >= SECONDS) {
      clearInterval(timer)
      client.end(false, {}, () => process.exit(0))
    }
  }, 1000)
})

client.on('error', (error) => {
  console.error('mqtt error:', error.message)
  process.exit(1)
})
