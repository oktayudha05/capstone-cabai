import { useEffect, useState } from 'react'
import { ActuatorTile } from './components/ActuatorTile.jsx'
import { ControlBar, FrozenBanner } from './components/Controls.jsx'
import { EventLog } from './components/EventLog.jsx'
import { SensorTile } from './components/SensorTile.jsx'
import { StatusStrip } from './components/StatusStrip.jsx'
import { TrendTile } from './components/TrendTile.jsx'
import { usePlantFeed, RANGES } from './hooks/usePlantFeed.js'
import { filterByRange, seriesOf } from './lib/chart.js'

const SPARK_WINDOW = 60

// One clock drives every duration and "now" label on screen, so the tiles never
// disagree about what time it is. Ticks only while the feed is live.
function useClock(paused) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (paused) return undefined
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [paused])

  return now
}

export default function App() {
  const { feed, connection, source, theme, toggleTheme, range, setRange, paused, togglePaused } = usePlantFeed()
  const now = useClock(paused)

  const rangeEntry = RANGES.find((entry) => entry.id === range) ?? RANGES[1]
  const visible = filterByRange(feed.history, rangeEntry.windowMs, now)
  const latestSample = visible.length > 0 ? visible[visible.length - 1] : null
  const sinceWindow = seriesOf(filterByRange(feed.history, SPARK_WINDOW * 1000, now), 'soilMoisture')

  return (
    <div className={`shell${paused ? ' shell--paused' : ''}`}>
      <header className="topbar">
        <div className="topbar__inner">
          <h1 className="topbar__title">Pemantauan Cabai</h1>
          <ControlBar
            paused={paused}
            onTogglePaused={togglePaused}
            range={range}
            onRangeChange={setRange}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        </div>
      </header>

      <FrozenBanner paused={paused} lastUpdated={feed.lastUpdated} onResume={togglePaused} />

      <main className="main">
        {connection.state === 'error' ? (
          <section className="panel" aria-labelledby="panel-error">
            <h2 className="panel__heading" id="panel-error">
              Sambungan ke broker gagal
            </h2>
            <p>{connection.message}</p>
            {connection.hint === 'config' ? (
              <ul className="panel__list">
                <li>
                  Isi <code>VITE_MQTT_URL</code> di berkas <code>.env</code>, lalu jalankan ulang <code>npm run dev</code>.
                </li>
                <li>
                  Untuk memakai data dummy tanpa broker, set <code>VITE_DATA_SOURCE=dummy</code>.
                </li>
              </ul>
            ) : (
              <ul className="panel__list">
                <li>Periksa apakah alamat broker bisa dijangkau dari jaringan ini.</li>
                <li>
                  Periksa apakah <code>VITE_MQTT_URL</code> memakai skema WebSocket (<code>ws://</code> atau{' '}
                  <code>wss://</code>), bukan <code>mqtt://</code>.
                </li>
                <li>
                  Untuk memakai data dummy tanpa broker, set <code>VITE_DATA_SOURCE=dummy</code>.
                </li>
              </ul>
            )}
            {connection.retrying ? <p>Klien mencoba menyambung ulang tiap tiga detik.</p> : null}
            <button type="button" className="control control--primary" onClick={() => window.location.reload()}>
              Muat ulang halaman
            </button>
          </section>
        ) : (
          <div className="grid">
            <SensorTile
              variant="soil"
              label="Kelembapan tanah"
              question="Ambang batas penyiraman belum ditetapkan."
              value={feed.sensors.soilMoisture}
              series={sinceWindow.length > 0 ? sinceWindow : seriesOf(visible, 'soilMoisture', SPARK_WINDOW)}
              since={feed.sensorSince.soilMoisture}
              highlight
            />

            <SensorTile
              variant="air"
              label="Kelembapan udara"
              question="Ambang batas pengipasan belum ditetapkan."
              value={feed.sensors.airHumidity}
              series={seriesOf(visible, 'airHumidity', SPARK_WINDOW)}
              since={feed.sensorSince.airHumidity}
            />

            <ActuatorTile
              variant="fan"
              label="Kipas"
              state={feed.actuators.fan}
              since={feed.actuatorSince.fan}
              now={now}
              note="Relay dikendalikan mikrokontroler."
            />

            <ActuatorTile
              variant="pump"
              label="Pompa air"
              state={feed.actuators.pump}
              since={feed.actuatorSince.pump}
              now={now}
              note="Relay dikendalikan mikrokontroler."
            />

            <TrendTile samples={visible} liveSample={latestSample} rangeLabel={rangeEntry.label} />

            <EventLog events={feed.events} now={now} />
          </div>
        )}
      </main>

      <StatusStrip
        connection={connection}
        source={source}
        deviceOnline={feed.deviceOnline}
        lastUpdated={feed.lastUpdated}
        now={now}
      />
    </div>
  )
}
