import { formatClock } from '../lib/format.js'

export function StatusStrip({ connection, source, deviceOnline, lastUpdated, now }) {
  return (
    <footer className="strip">
      <span className="strip__group">
        Sumber: <span className="strip__value">{source === 'dummy' ? 'simulasi lokal' : 'broker MQTT'}</span>
      </span>
      <span className="strip__group">
        Koneksi: <span className="strip__value">{connection.state}</span>
      </span>
      <span className="strip__group">
        Perangkat:{' '}
        <span className="strip__value">
          {deviceOnline === null ? 'belum melapor' : deviceOnline ? 'online' : 'offline'}
        </span>
      </span>
      <span className="strip__group">
        Data terakhir: <span className="strip__value">{lastUpdated ? formatClock(lastUpdated) : 'belum ada'}</span>
      </span>
      <span className="strip__group">
        Jam: <span className="strip__value">{now ? formatClock(now) : 'belum jalan'}</span>
      </span>
    </footer>
  )
}
