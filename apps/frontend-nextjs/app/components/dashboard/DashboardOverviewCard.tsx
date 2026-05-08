'use client'

import { IAvdelingDashboardStats } from '@/constants/dashboard/dashboardConstants'
import { BodyShort, Detail, Heading } from '@navikt/ds-react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { IBarSegment, formatPct, roundedPercentages } from './chartUtils'

const DOK_COLORS = ['#fa4d56', '#9f1853', '#005d5d']
const SUKSESS_COLORS = ['#1192e8', '#005d5d', '#fa4d56', '#9f1853']
const BEHOV_COLORS = ['#fa4d56', '#9f1853', '#005d5d', '#1192e8']
const PVK_COLORS = ['#fa4d56', '#9f1853', '#005d5d', '#1192e8', '#6929c4', '#198038']

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
      <BodyShort weight='semibold' className='mb-2'>
        {title}
      </BodyShort>
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
  stats: IAvdelingDashboardStats[]
  totalDokumenter: number
  view: 'figurer' | 'nokkeltall'
}

const aggregateAvdelingStats = (stats: IAvdelingDashboardStats[]) => {
  const dok = stats.reduce(
    (acc, s) => ({
      total: acc.total + s.dokumenter.total,
      underArbeid: acc.underArbeid + s.dokumenter.underArbeid,
      sendtTilGodkjenning: acc.sendtTilGodkjenning + s.dokumenter.sendtTilGodkjenning,
      godkjentAvRisikoeier: acc.godkjentAvRisikoeier + s.dokumenter.godkjentAvRisikoeier,
    }),
    { total: 0, underArbeid: 0, sendtTilGodkjenning: 0, godkjentAvRisikoeier: 0 }
  )

  const n = stats.length || 1
  const suksess = {
    underArbeidProsent: Math.round(
      stats.reduce((s, a) => s + a.suksesskriterier.underArbeidProsent, 0) / n
    ),
    oppfyltProsent: Math.round(
      stats.reduce((s, a) => s + a.suksesskriterier.oppfyltProsent, 0) / n
    ),
    ikkeOppfyltProsent: Math.round(
      stats.reduce((s, a) => s + a.suksesskriterier.ikkeOppfyltProsent, 0) / n
    ),
    ikkeRelevantProsent: Math.round(
      stats.reduce((s, a) => s + a.suksesskriterier.ikkeRelevantProsent, 0) / n
    ),
  }

  const behov = stats.reduce(
    (acc, s) => ({
      totalMedPersonopplysninger:
        acc.totalMedPersonopplysninger + s.behovForPvk.totalMedPersonopplysninger,
      ikkeVurdertBehov: acc.ikkeVurdertBehov + s.behovForPvk.ikkeVurdertBehov,
      vurdertIkkeBehov: acc.vurdertIkkeBehov + s.behovForPvk.vurdertIkkeBehov,
      behovIkkePaabegynt: acc.behovIkkePaabegynt + s.behovForPvk.behovIkkePaabegynt,
    }),
    {
      totalMedPersonopplysninger: 0,
      ikkeVurdertBehov: 0,
      vurdertIkkeBehov: 0,
      behovIkkePaabegynt: 0,
    }
  )

  const pvk = stats.reduce(
    (acc, s) => ({
      total: acc.total + s.pvk.total,
      ikkePaabegynt: acc.ikkePaabegynt + (s.pvk.ikkePaabegynt ?? 0),
      underArbeid: acc.underArbeid + s.pvk.underArbeid,
      tilBehandlingHosPvo: acc.tilBehandlingHosPvo + s.pvk.tilBehandlingHosPvo,
      tilbakemeldingFraPvo: acc.tilbakemeldingFraPvo + s.pvk.tilbakemeldingFraPvo,
      godkjentAvRisikoeier: acc.godkjentAvRisikoeier + s.pvk.godkjentAvRisikoeier,
      pvkIWord: acc.pvkIWord + s.pvk.pvkIWord,
    }),
    {
      total: 0,
      ikkePaabegynt: 0,
      underArbeid: 0,
      tilBehandlingHosPvo: 0,
      tilbakemeldingFraPvo: 0,
      godkjentAvRisikoeier: 0,
      pvkIWord: 0,
    }
  )

  return { dok, suksess, behov, pvk }
}

export const DashboardOverviewCard = ({ stats, totalDokumenter, view }: IProps) => {
  const agg = aggregateAvdelingStats(stats)

  const dokData: IBarSegment[] = [
    { name: 'Under arbeid', value: agg.dok.underArbeid, color: DOK_COLORS[0] },
    { name: 'Sendt til godkjenning', value: agg.dok.sendtTilGodkjenning, color: DOK_COLORS[1] },
    { name: 'Godkjent', value: agg.dok.godkjentAvRisikoeier, color: DOK_COLORS[2] },
  ]

  const suksessData: IBarSegment[] = [
    { name: 'Under arbeid', value: agg.suksess.underArbeidProsent, color: SUKSESS_COLORS[0] },
    { name: 'Oppfylt', value: agg.suksess.oppfyltProsent, color: SUKSESS_COLORS[1] },
    { name: 'Ikke oppfylt', value: agg.suksess.ikkeOppfyltProsent, color: SUKSESS_COLORS[2] },
    { name: 'Ikke relevant', value: agg.suksess.ikkeRelevantProsent, color: SUKSESS_COLORS[3] },
  ]

  const behovData: IBarSegment[] = [
    { name: 'Ikke vurdert behov', value: agg.behov.ikkeVurdertBehov, color: BEHOV_COLORS[0] },
    {
      name: 'Skal ikke gjennomføre PVK',
      value: agg.behov.vurdertIkkeBehov,
      color: BEHOV_COLORS[1],
    },
    {
      name: 'Skal gjennomføre PVK',
      value: agg.behov.behovIkkePaabegynt,
      color: BEHOV_COLORS[2],
    },
    { name: 'PVK i Word', value: agg.pvk.pvkIWord, color: BEHOV_COLORS[3] },
  ]

  const pvkData: IBarSegment[] = [
    { name: 'Ikke påbegynt', value: agg.pvk.ikkePaabegynt, color: PVK_COLORS[0] },
    { name: 'Under arbeid', value: agg.pvk.underArbeid, color: PVK_COLORS[1] },
    { name: 'Til behandling hos PVO', value: agg.pvk.tilBehandlingHosPvo, color: PVK_COLORS[2] },
    {
      name: 'Tilbakemelding fra PVO',
      value: agg.pvk.tilbakemeldingFraPvo,
      color: PVK_COLORS[3],
    },
    {
      name: 'Godkjent av risikoeier',
      value: agg.pvk.godkjentAvRisikoeier,
      color: PVK_COLORS[4],
    },
  ]

  return (
    <div className='border border-gray-300 rounded-lg p-6 bg-white'>
      <Detail uppercase>{totalDokumenter.toLocaleString('nb-NO')} ETTERLEVELSESDOKUMENTER</Detail>

      {view === 'figurer' ? (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-4'>
          <div>
            <Heading size='xsmall' level='3'>
              Etterlevelsesdokumenter ({agg.dok.total})
            </Heading>
            <OverviewStackedBar data={dokData} />
          </div>

          <div>
            <Heading size='xsmall' level='3'>
              Suksesskriterier (etterlevelseskrav)
            </Heading>
            <OverviewStackedBar data={suksessData} showPercentage />
          </div>

          <div>
            <Heading size='xsmall' level='3'>
              Vurdere behov for PVK ({agg.behov.totalMedPersonopplysninger})
            </Heading>
            <OverviewStackedBar data={behovData} />
          </div>

          <div>
            <Heading size='xsmall' level='3'>
              Digital PVK status ({agg.pvk.total - agg.pvk.pvkIWord})
            </Heading>
            <OverviewStackedBar data={pvkData} />
          </div>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-4'>
          <OverviewKeyMetrics title={`Etterlevelsesdokumenter (${agg.dok.total})`} data={dokData} />
          <OverviewKeyMetrics
            title='Suksesskriterier (etterlevelseskrav)'
            data={suksessData}
            showPercentage
          />
          <OverviewKeyMetrics
            title={`Vurdere behov for PVK (${agg.behov.totalMedPersonopplysninger})`}
            data={behovData}
          />
          <OverviewKeyMetrics
            title={`Digital PVK status (${agg.pvk.total - agg.pvk.pvkIWord})`}
            data={pvkData}
          />
        </div>
      )}
    </div>
  )
}
