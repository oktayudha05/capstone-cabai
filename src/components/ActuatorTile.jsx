import { useEffect, useRef, useState } from 'react'
import { formatClock, formatDuration, formatState } from '../lib/format.js'

const FLASH_MS = 900

export function ActuatorTile({ variant, label, state, since, note, now }) {
  const held = since && now ? formatDuration(now - since) : null
  const previous = useRef(state)
  const [flash, setFlash] = useState(false)

  // The relay flipping is the one moment this dashboard exists to show, so it
  // gets the only authored motion on the surface: a brief ring on the tile that
  // changed. The first report is the baseline, not a flip.
  useEffect(() => {
    if (previous.current === state) return undefined
    previous.current = state

    setFlash(true)
    const timer = setTimeout(() => setFlash(false), FLASH_MS)
    return () => clearTimeout(timer)
  }, [state])

  return (
    <section
      className={`tile tile--${variant}${flash ? ' tile--flip' : ''}`}
      aria-labelledby={`tile-${variant}`}
    >
      <div className="tile__head">
        <h2 className="tile__heading" id={`tile-${variant}`}>
          {label}
        </h2>
      </div>

      <p className="actuator">
        <span className="actuator__value">{formatState(state)}</span>
        <span className={`dot dot--${state === 'on' ? 'on' : 'off'}`} aria-hidden="true" />
      </p>

      <p className="tile__note">
        {state === null
          ? 'Perangkat belum melaporkan status relay.'
          : since
            ? `${formatState(state)} sejak ${formatClock(since)}, ${held}`
            : `${formatState(state)}, waktu perubahan tidak dilaporkan`}
      </p>

      <p className="tile__note">{note}</p>
    </section>
  )
}
