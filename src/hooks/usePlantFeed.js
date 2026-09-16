import { useEffect, useReducer, useRef, useState } from 'react'
import { emptyFeed, feedReducer } from '../lib/feedReducer.js'
import { connectMqtt } from '../lib/mqttClient.js'
import { createSimulator } from '../lib/simulator.js'

const DATA_SOURCE = import.meta.env?.VITE_DATA_SOURCE === 'mqtt' ? 'mqtt' : 'dummy'
const TICK_MS = 1000
const THEME_KEY = 'cabai-theme'
const RANGE_KEY = 'cabai-range'

export const RANGES = [
  { id: '1m', label: '1 menit', windowMs: 60_000 },
  { id: '5m', label: '5 menit', windowMs: 300_000 },
  { id: 'all', label: 'Seluruh sesi', windowMs: Infinity },
]

export function usePlantFeed() {
  const [feed, dispatch] = useReducer(feedReducer, emptyFeed)
  const [connection, setConnection] = useState(initialConnection)
  const [theme, setTheme] = useState(readStoredTheme)
  const [range, setRange] = useState(readStoredRange)
  const [paused, setPaused] = useState(false)
  const pausedRef = useRef(false)

  useEffect(() => {
    pausedRef.current = paused
  }, [paused])

  useEffect(() => {
    if (DATA_SOURCE === 'dummy') {
      const simulator = createSimulator({ intervalMs: TICK_MS })
      simulator.start((events) => {
        if (pausedRef.current) return
        events.forEach(dispatch)
      })
      return () => simulator.stop()
    }

    const url = import.meta.env.VITE_MQTT_URL
    if (!url) return undefined

    // Event close dan reconnect ikut terpicu saat koneksi gagal, dan tanpa
    // penjagaan ini keduanya menimpa state error sampai pesannya hilang dari UI.
    // Hanya 'connected' yang boleh menghapus error, supaya panel tidak terkunci
    // permanen saat broker akhirnya berhasil disambung.
    const applyStatus = (next) =>
      setConnection((current) => (current.state === 'error' && next.state !== 'connected' ? current : next))

    return connectMqtt({
      url,
      username: import.meta.env.VITE_MQTT_USERNAME,
      password: import.meta.env.VITE_MQTT_PASSWORD,
      onEvent: (event) => {
        if (pausedRef.current) return
        dispatch(event)
      },
      onStatus: applyStatus,
    })
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      // Private mode blocks localStorage; the toggle still works for this session.
    }
  }, [theme])

  useEffect(() => {
    try {
      localStorage.setItem(RANGE_KEY, range)
    } catch {
      // Same as above.
    }
  }, [range])

  return {
    feed,
    connection,
    source: DATA_SOURCE,
    theme,
    toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    range,
    setRange,
    paused,
    togglePaused: () => setPaused((current) => !current),
  }
}

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    // Ignore and fall through to the system preference.
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function readStoredRange() {
  try {
    const stored = localStorage.getItem(RANGE_KEY)
    if (RANGES.some((entry) => entry.id === stored)) return stored
  } catch {
    // Ignore and fall through to the default.
  }
  return '5m'
}

function initialConnection() {
  if (DATA_SOURCE === 'dummy') {
    return { state: 'simulator', message: 'data dummy lokal, perangkat belum terhubung' }
  }

  const url = import.meta.env.VITE_MQTT_URL
  return url
    ? { state: 'connecting', message: `menyambung ke ${url}`, retrying: true, hint: 'broker' }
    : {
        state: 'error',
        message: 'VITE_MQTT_URL belum diisi di file .env',
        retrying: false,
        hint: 'config',
      }
}
