export interface IBarSegment {
  name: string
  value: number
  color: string
}

export const KRAV_COLORS = {
  underArbeid: '#1192e8',
  ferdigVurdert: '#005d5d',
}

export const SUKSESS_COLORS = {
  underArbeid: '#1192e8',
  oppfylt: '#005d5d',
  ikkeOppfylt: '#fa4d56',
  ikkeRelevant: '#9f1853',
}

export const roundedPercentages = (values: number[]): number[] => {
  const total = values.reduce((s, v) => s + v, 0)
  if (total === 0) return values.map(() => 0)
  const exact = values.map((v) => (v / total) * 100)
  const floored = exact.map((v) => Math.floor(v))
  const remainder = 100 - floored.reduce((s, v) => s + v, 0)
  const diffs = exact.map((v, i) => ({ i, diff: v - floored[i] }))
  diffs.sort((a, b) => b.diff - a.diff)
  for (let j = 0; j < remainder; j++) {
    floored[diffs[j].i] += 1
  }
  return floored
}

export const formatPct = (pct: number, value: number): string => {
  if (value > 0 && pct === 0) return '<1'
  return `${pct}`
}

export const DOK_COLORS = ['#1192e8', '#9f1853', '#005d5d']
export const AVDELING_SUKSESS_COLORS = ['#1192e8', '#005d5d', '#fa4d56', '#9f1853']
export const BEHOV_COLORS = ['#fa4d56', '#9f1853', '#005d5d', '#1192e8']
export const PVK_COLORS = ['#fa4d56', '#9f1853', '#005d5d', '#1192e8', '#6929c4', '#198038']
