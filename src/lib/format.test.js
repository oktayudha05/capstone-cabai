import { describe, expect, it } from 'vitest'
import { clampPercent, formatClock, formatDuration, formatPercent, formatState } from './format.js'

describe('format', () => {
  it('renders one decimal with a comma, Indonesian style', () => {
    expect(formatPercent(63.45)).toBe('63,5')
    expect(formatPercent(70)).toBe('70,0')
  })

  it('renders a 24 hour clock', () => {
    const ts = new Date(2026, 0, 2, 9, 5, 7).getTime()
    expect(formatClock(ts)).toBe('09.05.07')
  })

  it('clamps values into the gauge range', () => {
    expect(clampPercent(-5)).toBe(0)
    expect(clampPercent(120)).toBe(100)
    expect(clampPercent(48.2)).toBe(48.2)
  })

  it('uses one vocabulary for a relay state', () => {
    expect(formatState('on')).toBe('menyala')
    expect(formatState('off')).toBe('mati')
    expect(formatState(null)).toBe('belum ada data')
  })

  it('describes a duration at a human scale', () => {
    expect(formatDuration(12_000)).toBe('12 detik')
    expect(formatDuration(90_000)).toBe('1 menit')
    expect(formatDuration(3_600_000)).toBe('1 jam 0 menit')
  })

  it('never renders a negative or broken duration', () => {
    expect(formatDuration(-1)).toBe('0 detik')
    expect(formatDuration(NaN)).toBe('0 detik')
  })
})
