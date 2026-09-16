import { formatClock } from '../lib/format.js'
import { RANGES } from '../hooks/usePlantFeed.js'

export function ControlBar({ paused, onTogglePaused, range, onRangeChange, theme, onToggleTheme }) {
  return (
    <div className="controls">
      <button
        type="button"
        className={paused ? 'control control--primary' : 'control'}
        aria-pressed={paused}
        onClick={onTogglePaused}
      >
        Tahan
      </button>

      <div className="control-group" role="group" aria-label="Rentang waktu grafik">
        {RANGES.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className="control"
            aria-pressed={range === entry.id}
            onClick={() => onRangeChange(entry.id)}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className="control-group" role="group" aria-label="Tema tampilan">
        <button
          type="button"
          className="control"
          aria-pressed={theme === 'light'}
          onClick={() => theme !== 'light' && onToggleTheme()}
        >
          Terang
        </button>
        <button
          type="button"
          className="control"
          aria-pressed={theme === 'dark'}
          onClick={() => theme !== 'dark' && onToggleTheme()}
        >
          Gelap
        </button>
      </div>
    </div>
  )
}

export function FrozenBanner({ paused, lastUpdated, onResume }) {
  if (!paused) return null

  return (
    <p className="frozen" role="status">
      <span className="frozen__badge">Dijeda</span>
      <span className="frozen__text">
        Pembacaan dibekukan{lastUpdated ? ` pada ${formatClock(lastUpdated)}` : ''}. Angka tidak diperbarui sampai
        dilanjutkan.
      </span>
      <button type="button" className="control control--quiet" onClick={onResume}>
        Lanjutkan
      </button>
    </p>
  )
}
