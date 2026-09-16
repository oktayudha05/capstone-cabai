import { formatClock, formatPercent } from '../lib/format.js'

export function SensorTile({ variant, label, question, value, series, since, highlight = false }) {
  const classes = ['tile', `tile--${variant}`]
  if (highlight) classes.push('tile--highlight')

  const min = series.length > 0 ? Math.min(...series) : null
  const max = series.length > 0 ? Math.max(...series) : null

  return (
    <section className={classes.join(' ')} aria-labelledby={`tile-${variant}`}>
      <div className="tile__head">
        <h2 className="tile__heading" id={`tile-${variant}`}>
          {label}
        </h2>
        {since ? <p className="tile__note">masuk {formatClock(since)}</p> : null}
      </div>

      {value === null ? (
        <p className="placeholder">belum ada pembacaan</p>
      ) : (
        <p className={highlight ? 'metric metric--primary' : 'metric'}>
          <span className="metric__value">{formatPercent(value)}</span>
          <span className="metric__unit">%RH</span>
        </p>
      )}

      {/* Bukan lencana status, ini bacaan: ditulis sebagai angka supaya bentuknya
          menyampaikan "ini data", bukan "ini hiasan". */}
      {series.length > 0 ? (
        <dl className="readings">
          <div>
            <dt>Terendah</dt>
            <dd>{formatPercent(min)}%</dd>
          </div>
          <div>
            <dt>Tertinggi</dt>
            <dd>{formatPercent(max)}%</dd>
          </div>
          <div>
            <dt>Bacaan</dt>
            <dd>{series.length}</dd>
          </div>
        </dl>
      ) : null}

      <p className="tile__note">{question}</p>
    </section>
  )
}
