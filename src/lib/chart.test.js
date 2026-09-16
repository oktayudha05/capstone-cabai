import { describe, expect, it } from 'vitest'
import { buildPath, filterByRange, medianInterval, nearestSample, pointerToPlotX, seriesOf } from './chart.js'

function samples(...pairs) {
  return pairs.map(([ts, soilMoisture, airHumidity]) => ({ ts, soilMoisture, airHumidity }))
}

describe('filterByRange', () => {
  const feed = samples([1000, 60, 70], [8000, 61, 71], [10_000, 62, 72])

  it('keeps only samples inside the window', () => {
    // now - ts <= 5000 keeps 8000 and 10000, drops 1000
    expect(filterByRange(feed, 5000, 10_000)).toHaveLength(2)
  })

  it('drops every sample older than the window', () => {
    expect(filterByRange(feed, 500, 10_000)).toHaveLength(1)
  })

  it('keeps everything for the whole-session range', () => {
    expect(filterByRange(feed, Infinity, 10_000)).toHaveLength(3)
  })
})

describe('seriesOf', () => {
  it('drops missing readings instead of treating them as zero', () => {
    const feed = [{ ts: 1, soilMoisture: 60 }, { ts: 2 }, { ts: 3, soilMoisture: 62 }]
    expect(seriesOf(feed, 'soilMoisture')).toEqual([60, 62])
  })

  it('caps the series to the limit, keeping the newest', () => {
    const feed = Array.from({ length: 10 }, (_, index) => ({ ts: index, soilMoisture: index }))
    expect(seriesOf(feed, 'soilMoisture', 3)).toEqual([7, 8, 9])
  })
})

describe('medianInterval', () => {
  it('returns the typical spacing, ignoring a single outlier', () => {
    expect(medianInterval(samples([0, 60, 70], [1000, 60, 70], [2000, 60, 70], [60_000, 60, 70]))).toBe(1000)
  })

  it('returns zero when there is nothing to compare', () => {
    expect(medianInterval(samples([0, 60, 70]))).toBe(0)
  })
})

describe('buildPath', () => {
  it('starts with a move command', () => {
    expect(buildPath(samples([0, 60, 70], [1000, 61, 71]), 'soilMoisture')).toMatch(/^M/)
  })

  it('needs two readings before drawing', () => {
    expect(buildPath(samples([0, 60, 70]), 'soilMoisture')).toBe('')
  })

  it('breaks the line across a gap instead of bridging missing time', () => {
    const path = buildPath(samples([0, 60, 70], [1000, 61, 71], [60_000, 62, 72]), 'soilMoisture')
    expect(path.match(/M/g)).toHaveLength(2)
  })

  it('draws one continuous line when the spacing is steady', () => {
    const path = buildPath(samples([0, 60, 70], [1000, 61, 71], [2000, 62, 72]), 'soilMoisture')
    expect(path.match(/M/g)).toHaveLength(1)
  })
})

describe('nearestSample', () => {
  const feed = samples([0, 60, 70], [1000, 61, 71], [2000, 62, 72])

  it('picks the sample closest to the tapped x', () => {
    expect(nearestSample(feed, 0).sample.ts).toBe(0)
    expect(nearestSample(feed, 320).sample.ts).toBe(2000)
  })

  it('returns nothing for an empty feed', () => {
    expect(nearestSample([], 100)).toBeNull()
  })
})

describe('pointerToPlotX', () => {
  it('maps a client x into the plot coordinate space', () => {
    expect(pointerToPlotX(150, { left: 100, width: 100 })).toBe(160)
  })

  it('clamps outside the plot', () => {
    expect(pointerToPlotX(0, { left: 100, width: 100 })).toBe(0)
    expect(pointerToPlotX(900, { left: 100, width: 100 })).toBe(320)
  })
})
