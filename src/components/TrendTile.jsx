import { useEffect, useMemo, useRef, useState } from 'react'
import { CHART, buildPath, nearestSample, pointerToPlotX } from '../lib/chart.js'
import { formatClock, formatPercent } from '../lib/format.js'

const { PLOT_WIDTH, PLOT_HEIGHT, PAD } = CHART

function Readout({ point, label }) {
  if (!point) return null

  return (
    <div className="readout">
      <p className="readout__time">{formatClock(point.ts)}</p>
      <dl className="readout__values">
        {point.soilMoisture !== undefined ? (
          <div>
            <dt>
              <span className="legend__swatch legend__swatch--soil" aria-hidden="true" />
              Tanah
            </dt>
            <dd>{formatPercent(point.soilMoisture)}%</dd>
          </div>
        ) : null}
        {point.airHumidity !== undefined ? (
          <div>
            <dt>
              <span className="legend__swatch legend__swatch--air" aria-hidden="true" />
              Udara
            </dt>
            <dd>{formatPercent(point.airHumidity)}%</dd>
          </div>
        ) : null}
      </dl>
      <p className="tile__note">{label}</p>
    </div>
  )
}

export function TrendTile({ samples, liveSample, rangeLabel }) {
  const [inspected, setInspected] = useState(null)
  const svgRef = useRef(null)

  const soil = useMemo(() => buildPath(samples, 'soilMoisture'), [samples])
  const air = useMemo(() => buildPath(samples, 'airHumidity'), [samples])
  const hasLine = Boolean(soil || air)

  const first = samples[0]
  const last = samples[samples.length - 1]
  // Sesi pendek membuat label jam:menit di kedua ujung identik, jadi label
  // menampilkan detik selama rentangnya masih di bawah satu menit.
  const shortSpan = first && last ? last.ts - first.ts < 60_000 : false
  const stamp = shortSpan ? formatClock : (ts) => formatClock(ts).slice(0, 5)

  // The newest sample arrives after the tap, and a readout that silently jumps
  // to new data is worse than one that holds still, so the tapped sample wins.
  const shown = inspected ?? liveSample ?? null

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return undefined

    const handlePointer = (event) => {
      const rect = svg.getBoundingClientRect()
      const hit = nearestSample(samples, pointerToPlotX(event.clientX, rect))
      setInspected(hit ? hit.sample : null)
    }
    const handleLeave = () => setInspected(null)
    const handleKey = (event) => {
      if (samples.length === 0) return

      const current = shown ? samples.findIndex((sample) => sample.ts === shown.ts) : samples.length - 1
      let next = null

      if (event.key === 'ArrowLeft') next = Math.max(0, current - 1)
      else if (event.key === 'ArrowRight') next = Math.min(samples.length - 1, current + 1)
      else if (event.key === 'Home') next = 0
      else if (event.key === 'End') next = samples.length - 1
      else if (event.key === 'Escape') {
        setInspected(null)
        return
      } else return

      event.preventDefault()
      setInspected(samples[next])
    }

    svg.addEventListener('pointerdown', handlePointer)
    svg.addEventListener('pointermove', handlePointer)
    svg.addEventListener('pointerleave', handleLeave)
    svg.addEventListener('pointerup', handleLeave)
    svg.addEventListener('keydown', handleKey)

    return () => {
      svg.removeEventListener('pointerdown', handlePointer)
      svg.removeEventListener('pointermove', handlePointer)
      svg.removeEventListener('pointerleave', handleLeave)
      svg.removeEventListener('pointerup', handleLeave)
      svg.removeEventListener('keydown', handleKey)
    }
  }, [samples, shown])

  const markerIndex = shown ? samples.findIndex((sample) => sample.ts === shown.ts) : -1

  return (
    <section className="tile tile--trend" aria-labelledby="tile-trend">
      <div className="tile__head">
        <h2 className="tile__heading" id="tile-trend">
          Riwayat sesi ini
        </h2>
        <p className="tile__note">
          {rangeLabel}, {samples.length} sampel dari maksimum 300
        </p>
      </div>

      <div className="trend">
        {hasLine ? (
          <div className="chart">
            <div className="chart__axis" aria-hidden="true">
              <span>100%</span>
              <span>50%</span>
              <span>0%</span>
            </div>
            <svg
              className="chart__plot"
              ref={svgRef}
              viewBox={`0 0 ${PLOT_WIDTH} ${PLOT_HEIGHT}`}
              preserveAspectRatio="none"
              role="img"
              tabIndex="0"
              aria-label={`Grafik kelembapan tanah dan udara, ${samples.length} sampel. Gunakan tombol panah untuk membaca titik.`}
            >
              <title>Kelembapan tanah dan udara, {samples.length} sampel terakhir</title>
              {[0, 25, 50, 75, 100].map((level) => (
                <line
                  key={level}
                  x1="0"
                  y1={(PLOT_HEIGHT - PAD - (level / 100) * (PLOT_HEIGHT - PAD * 2)).toFixed(1)}
                  x2={PLOT_WIDTH}
                  y2={(PLOT_HEIGHT - PAD - (level / 100) * (PLOT_HEIGHT - PAD * 2)).toFixed(1)}
                  className={level === 50 ? 'chart__grid chart__grid--mid' : 'chart__grid'}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              <path className="chart__line chart__line--soil" d={soil} vectorEffect="non-scaling-stroke" />
              <path className="chart__line chart__line--air" d={air} vectorEffect="non-scaling-stroke" />
              {markerIndex >= 0 ? (
                <line
                  className="chart__cursor"
                  x1={(PAD + (markerIndex / Math.max(1, samples.length - 1)) * (PLOT_WIDTH - PAD * 2)).toFixed(1)}
                  y1="0"
                  x2={(PAD + (markerIndex / Math.max(1, samples.length - 1)) * (PLOT_WIDTH - PAD * 2)).toFixed(1)}
                  y2={PLOT_HEIGHT}
                  vectorEffect="non-scaling-stroke"
                />
              ) : null}
            </svg>
            <div className="chart__times">
              <span>{first ? stamp(first.ts) : ''}</span>
              <span>{last ? stamp(last.ts) : ''}</span>
            </div>
          </div>
        ) : (
          <p className="placeholder">grafik terisi setelah dua pembacaan masuk</p>
        )}

        <div className="readout__slot" aria-live="polite">
          <Readout point={shown} label={inspected ? 'titik yang dipilih' : 'pembacaan terakhir'} />
        </div>
      </div>

      <div className="legend">
        <span className="legend__item">
          <span className="legend__swatch legend__swatch--soil" aria-hidden="true" />
          Kelembapan tanah
        </span>
        <span className="legend__item">
          <span className="legend__swatch legend__swatch--air" aria-hidden="true" />
          Kelembapan udara
        </span>
        <span className="legend__hint">Sentuh atau arahkan kursor ke grafik untuk membaca nilai per titik.</span>
      </div>
    </section>
  )
}
