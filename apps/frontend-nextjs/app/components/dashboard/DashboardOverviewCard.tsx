'use client'

import { ITemaDashboardStats } from '@/constants/dashboard/dashboardConstants'
import { BodyShort, Detail, Heading } from '@navikt/ds-react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const KRAV_COLORS = {
  underArbeid: '#fa4d56',
  ferdigVurdert: '#005d5d',
}

const SUKSESS_COLORS = {
  underArbeid: '#1192e8',
  oppfylt: '#005d5d',
  ikkeOppfylt: '#fa4d56',
  ikkeRelevant: '#9f1853',
}

interface IBarSegment {
  name: string
  value: number
  color: string
}

const roundedPercentages = (values: number[]): number[] => {
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

const formatPct = (pct: number, value: number): string => {
  if (value > 0 && pct === 0) return '<1'
  return `${pct}`
}

const OverviewStackedBar = ({
  data,
  showPercentage,
}: {
  data: IBarSegment[]
  showPercentage?: boolean
}) => {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  if (total === 0) return <BodyShort className='text-gray-500 mt-2'>Ingen data</BodyShort>

  const pcts = roundedPercentages(data.map((d) => d.value))
  const chartData = [
    data.reduce((acc, d) => ({ ...acc, [d.name]: d.value }), {} as Record<string, number>),
  ]

  return (
    <div style={{ marginTop: '12px' }}>
      <ResponsiveContainer width='100%' height={32}>
        <BarChart
          layout='vertical'
          data={chartData}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <XAxis type='number' hide />
          <YAxis type='category' hide />
          <Tooltip
            labelFormatter={() => ''}
            formatter={(value, name) => {
              const idx = data.findIndex((d) => d.name === String(name))
              return [
                `${Number(value)} (${formatPct(pcts[idx] ?? 0, Number(value))}%)`,
                String(name),
              ]
            }}
          />
          {data
            .filter((d) => d.value > 0)
            .map((d) => (
              <Bar key={d.name} dataKey={d.name} stackId='stack' fill={d.color} />
            ))}
        </BarChart>
      </ResponsiveContainer>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
        {data.map((d, i) => (
          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: d.color,
                flexShrink: 0,
              }}
            />
            <BodyShort size='small'>
              {d.name}{' '}
              <strong>
                {d.value}
                {showPercentage ? ` (${formatPct(pcts[i], d.value)}%)` : ''}
              </strong>
            </BodyShort>
          </div>
        ))}
      </div>
    </div>
  )
}

const OverviewKeyMetrics = ({
  data,
  title,
  showPercentage,
}: {
  data: IBarSegment[]
  title: string
  showPercentage?: boolean
}) => {
  const pcts = roundedPercentages(data.map((d) => d.value))

  return (
    <div>
      <BodyShort weight='semibold'>{title}</BodyShort>
      {data.map((d, i) => (
        <BodyShort key={d.name}>
          {d.name}{' '}
          <span className='font-bold'>
            {d.value}
            {showPercentage ? ` (${formatPct(pcts[i], d.value)}%)` : ''}
          </span>
        </BodyShort>
      ))}
    </div>
  )
}

interface IProps {
  temaStats: ITemaDashboardStats[]
  totalDokumenter: number
  view: 'figurer' | 'nokkeltall'
}

const aggregateTemaStats = (stats: ITemaDashboardStats[]) =>
  stats.reduce(
    (acc, s) => ({
      kravTotal: acc.kravTotal + s.kravTotal,
      kravUnderArbeid: acc.kravUnderArbeid + s.kravUnderArbeid,
      kravFerdigVurdert: acc.kravFerdigVurdert + s.kravFerdigVurdert,
      suksesskriterierUnderArbeid: acc.suksesskriterierUnderArbeid + s.suksesskriterierUnderArbeid,
      suksesskriterierOppfylt: acc.suksesskriterierOppfylt + s.suksesskriterierOppfylt,
      suksesskriterierIkkeOppfylt: acc.suksesskriterierIkkeOppfylt + s.suksesskriterierIkkeOppfylt,
      suksesskriterierIkkeRelevant:
        acc.suksesskriterierIkkeRelevant + s.suksesskriterierIkkeRelevant,
      ferdigOppfylt: acc.ferdigOppfylt + (s.ferdigUtfyltKravSuksesskriterierOppfylt ?? 0),
      ferdigIkkeOppfylt:
        acc.ferdigIkkeOppfylt + (s.ferdigUtfyltKravSuksesskriterierIkkeOppfylt ?? 0),
      ferdigIkkeRelevant:
        acc.ferdigIkkeRelevant + (s.ferdigUtfyltKravSuksesskriterierIkkeRelevant ?? 0),
    }),
    {
      kravTotal: 0,
      kravUnderArbeid: 0,
      kravFerdigVurdert: 0,
      suksesskriterierUnderArbeid: 0,
      suksesskriterierOppfylt: 0,
      suksesskriterierIkkeOppfylt: 0,
      suksesskriterierIkkeRelevant: 0,
      ferdigOppfylt: 0,
      ferdigIkkeOppfylt: 0,
      ferdigIkkeRelevant: 0,
    }
  )

export const DashboardOverviewCard = ({ temaStats, totalDokumenter, view }: IProps) => {
  const agg = aggregateTemaStats(temaStats)

  const totalSuksess =
    agg.suksesskriterierUnderArbeid +
    agg.suksesskriterierOppfylt +
    agg.suksesskriterierIkkeOppfylt +
    agg.suksesskriterierIkkeRelevant

  const totalFerdigSuksess = agg.ferdigOppfylt + agg.ferdigIkkeOppfylt + agg.ferdigIkkeRelevant
  const totalIkkeFerdigSuksess = totalSuksess - totalFerdigSuksess

  const kravData: IBarSegment[] = [
    { name: 'Under arbeid', value: agg.kravUnderArbeid, color: KRAV_COLORS.underArbeid },
    { name: 'Ferdig vurdert', value: agg.kravFerdigVurdert, color: KRAV_COLORS.ferdigVurdert },
  ]

  const suksessData: IBarSegment[] = [
    {
      name: 'Under arbeid',
      value: agg.suksesskriterierUnderArbeid,
      color: SUKSESS_COLORS.underArbeid,
    },
    { name: 'Oppfylt', value: agg.suksesskriterierOppfylt, color: SUKSESS_COLORS.oppfylt },
    {
      name: 'Ikke oppfylt',
      value: agg.suksesskriterierIkkeOppfylt,
      color: SUKSESS_COLORS.ikkeOppfylt,
    },
    {
      name: 'Ikke relevant',
      value: agg.suksesskriterierIkkeRelevant,
      color: SUKSESS_COLORS.ikkeRelevant,
    },
  ]

  const ferdigSuksessData: IBarSegment[] = [
    { name: 'Oppfylt', value: agg.ferdigOppfylt, color: SUKSESS_COLORS.oppfylt },
    { name: 'Ikke oppfylt', value: agg.ferdigIkkeOppfylt, color: SUKSESS_COLORS.ikkeOppfylt },
    { name: 'Ikke relevant', value: agg.ferdigIkkeRelevant, color: SUKSESS_COLORS.ikkeRelevant },
  ]

  const ikkeFerdigSuksessData: IBarSegment[] = [
    {
      name: 'Under arbeid',
      value: agg.suksesskriterierUnderArbeid,
      color: SUKSESS_COLORS.underArbeid,
    },
    {
      name: 'Oppfylt',
      value: agg.suksesskriterierOppfylt - agg.ferdigOppfylt,
      color: SUKSESS_COLORS.oppfylt,
    },
    {
      name: 'Ikke oppfylt',
      value: agg.suksesskriterierIkkeOppfylt - agg.ferdigIkkeOppfylt,
      color: SUKSESS_COLORS.ikkeOppfylt,
    },
    {
      name: 'Ikke relevant',
      value: agg.suksesskriterierIkkeRelevant - agg.ferdigIkkeRelevant,
      color: SUKSESS_COLORS.ikkeRelevant,
    },
  ]

  return (
    <div className='border border-gray-300 rounded-lg p-6 bg-white'>
      <Detail uppercase>{totalDokumenter.toLocaleString('nb-NO')} ETTERLEVELSESDOKUMENTER</Detail>

      {view === 'figurer' ? (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-4'>
          <div>
            <Heading size='xsmall' level='3'>
              Gjennomføringsstatus (krav) ({agg.kravTotal})
            </Heading>
            <OverviewStackedBar data={kravData} showPercentage />
          </div>

          <div>
            <Heading size='xsmall' level='3'>
              Etterlevelse (suksesskriterier)
            </Heading>
            <OverviewStackedBar data={suksessData} showPercentage />
          </div>

          <div>
            <Heading size='xsmall' level='3'>
              Suksesskriterier der kravet er ferdig utfylt
            </Heading>
            <OverviewStackedBar data={ferdigSuksessData} showPercentage />
          </div>

          <div>
            <Heading size='xsmall' level='3'>
              Suksesskriterier der kravet ikke er ferdig utfylt
            </Heading>
            <OverviewStackedBar data={ikkeFerdigSuksessData} showPercentage />
          </div>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-4'>
          <OverviewKeyMetrics
            title={`Gjennomføringsstatus (krav) (${agg.kravTotal})`}
            data={kravData}
            showPercentage
          />
          <OverviewKeyMetrics
            title='Etterlevelse (suksesskriterier)'
            data={suksessData}
            showPercentage
          />
          <OverviewKeyMetrics
            title={`Suksesskriterier der kravet er ferdig utfylt (${totalFerdigSuksess})`}
            data={ferdigSuksessData}
            showPercentage
          />
          <OverviewKeyMetrics
            title={`Suksesskriterier der kravet ikke er ferdig utfylt (${totalIkkeFerdigSuksess})`}
            data={ikkeFerdigSuksessData}
            showPercentage
          />
        </div>
      )}
    </div>
  )
}
