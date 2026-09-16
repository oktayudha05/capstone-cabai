const PREFIX = (import.meta.env?.VITE_MQTT_TOPIC_PREFIX || 'capstone/cabai').replace(/\/+$/, '')

export const TOPIC_PREFIX = PREFIX

export const TOPICS = {
  soilMoisture: `${PREFIX}/sensor/soil-moisture`,
  airHumidity: `${PREFIX}/sensor/air-humidity`,
  fan: `${PREFIX}/actuator/fan`,
  pump: `${PREFIX}/actuator/pump`,
  deviceStatus: `${PREFIX}/status`,
}

export const SUBSCRIPTIONS = Object.values(TOPICS)
