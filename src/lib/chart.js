const PLOT_WIDTH = 320
const PLOT_HEIGHT = 120
const PAD = 4

// A gap wider than this means the feed paused or the device went quiet. The
// line breaks there instead of drawing a straight segment across missing time,
// which would read as real readings that never happened.
const GAP_FACTOR = 3
const GAP_FLOOR_MS = 5000

export function filterByRange(samples, windowMs, now = Date.now()) {
  if (windowMs === Infinity) return samples
  return samples.filter((sample) => now - sample.ts <= windowMs)
}

export function seriesOf(samples, field, limit = Infinity) {
  const values = samples.map((sample) => sample[field]).filter((value) => typeof value === 'number')
  return limit === Infinity ? values : values.slice(-limit)
}

export function medianInterval(samples) {
  const gaps = []
  for (let index = 1; index < samples.length; index += 1) {
    gaps.push(samples[index].ts - samples[index - 1].ts)
  }
  if (gaps.length === 0) return 0
  gaps.sort((a, b) => a - b)
  // Lower-middle, not the average of the two middles: with an even count the
  // upper middle is usually the outlier itself, and taking it would raise the
  // gap threshold until the outlier no longer counts as a gap.
  return gaps[Math.floor((gaps.length - 1) / 2)]
}

export function xOf(index, count) {
  if (count <= 1) return PLOT_WIDTH / 2
  return PAD + (index / (count - 1)) * (PLOT_WIDTH - PAD * 2)
}

export function yOf(value) {
  return PLOT_HEIGHT - PAD - (Math.min(100, Math.max(0, value)) / 100) * (PLOT_HEIGHT - PAD * 2)
}

export function buildPath(samples, field) {
  const points = samples
    .map((sample, index) => ({ index, ts: sample.ts, value: sample[field] }))
    .filter((point) => typeof point.value === 'number')

  if (points.length < 2) return ''

  const baseline = medianInterval(samples)
  const gapLimit = Math.max(GAP_FLOOR_MS, baseline * GAP_FACTOR)

  return points
    .map((point, position) => {
      const x = xOf(point.index, samples.length).toFixed(1)
      const y = yOf(point.value).toFixed(1)
      const previous = points[position - 1]
      const broken = previous && point.ts - previous.ts > gapLimit
      return `${position === 0 || broken ? 'M' : 'L'}${x},${y}`
    })
    .join(' ')
}

// Shared by the chart and its nearest-point lookup, so a tap can never land on
// a coordinate the drawn line does not use.
export function nearestSample(samples, plotX) {
  if (samples.length === 0) return null

  let best = null
  let bestDistance = Infinity

  samples.forEach((sample, index) => {
    const distance = Math.abs(xOf(index, samples.length) - plotX)
    if (distance < bestDistance) {
      bestDistance = distance
      best = { sample, index }
    }
  })

  return best
}

export function pointerToPlotX(clientX, rect) {
  const ratio = (clientX - rect.left) / rect.width
  return Math.min(PLOT_WIDTH, Math.max(0, ratio * PLOT_WIDTH))
}

export const CHART = { PLOT_WIDTH, PLOT_HEIGHT, PAD }
