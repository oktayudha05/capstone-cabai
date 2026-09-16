import { formatClock, formatDuration, formatState, ACTUATOR_LABELS } from '../lib/format.js'

export function EventLog({ events, now }) {
  const recent = [...events].reverse()

  return (
    <section className="tile tile--events" aria-labelledby="tile-events">
      <div className="tile__head">
        <h2 className="tile__heading" id="tile-events">
          Kejadian aktuator
        </h2>
        <p className="tile__note">{recent.length} dari maksimum 60</p>
      </div>

      {recent.length === 0 ? (
        <p className="placeholder">Belum ada perubahan relay sejak halaman dibuka.</p>
      ) : (
        <ol className="events">
          {recent.map((event) => (
            <li className="events__item" key={`${event.field}-${event.ts}`}>
              <span className="events__time">{formatClock(event.ts)}</span>
              <span className="events__what">
                {ACTUATOR_LABELS[event.field] ?? event.field}{' '}
                <span className={event.state === 'on' ? 'events__state events__state--on' : 'events__state'}>
                  {formatState(event.state)}
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}

      <p className="tile__note">
        {now ? `Sekarang ${formatClock(now)}. ` : ''}
        Perubahan relay yang dilaporkan perangkat. Yang terbaru di atas.
      </p>
    </section>
  )
}

export function UpTime({ since, now }) {
  if (!since || !now) return null
  return <span>Berjalan {formatDuration(now - since)}</span>
}
