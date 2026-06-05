'use client'

import { IAvdelingDashboardStats } from '@/constants/dashboard/dashboardConstants'
import { BodyShort, Detail, Heading } from '@navikt/ds-react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import {
  AVDELING_SUKSESS_COLORS,
  BEHOV_COLORS,
  DOK_COLORS,
  IBarSegment,
  PVK_COLORS,
  roundedPercentages,
} from './chartUtils'

const OverviewStackedBar = ({
  data,
  isPercentage,
}: {
  data: IBarSegment[]
  isPercentage?: boolean
}) => {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  if (total === 0) return <BodyShort className='text-gray-500 mt-2'>Ingen data</BodyShort>

  const chartData = [
    data.reduce((acc, d) => ({ ...acc, [d.name]: d.value }), {} as Record<string, number>),
  ]

  return (
    <div style={{ marginTop: '12px', maxWidth: '200px' }}>
      <ResponsiveContainer width='100%' height={32}>
        <BarChart
          layout='vertical'
          data={chartData}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          tabIndex={-1}
        >
          <XAxis type='number' hide />
          <YAxis type='category' hide />
          {data
            .filter((d) => d.value > 0)
            .map((d) => (
              <Bar key={d.name} dataKey={d.name} stackId='stack' fill={d.color} tabIndex={-1} />
            ))}
        </BarChart>
      </ResponsiveContainer>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
        {data.map((d) => (
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
              {d.name} <strong>{isPercentage ? `${d.value}%` : d.value}</strong>
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
  isPercentage,
}: {
  data: IBarSegment[]
  title: string
  isPercentage?: boolean
}) => {
  return (
    <div>
      <BodyShort weight='semibold' className='mb-2'>
        {title}
      </BodyShort>
      {data.map((d) => (
        <BodyShort key={d.name}>
          {d.name} <span className='font-bold'>{isPercentage ? `${d.value}%` : d.value}</span>
        </BodyShort>
      ))}
    </div>
  )
}

interface IProps {
  stats: IAvdelingDashboardStats[]
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

  const suksess = stats.reduce(
    (acc, s) => ({
      total: acc.total + s.suksesskriterier.total,
      ikkePaabegynt: acc.ikkePaabegynt + s.suksesskriterier.ikkePaabegyntAntall,
      underArbeid: acc.underArbeid + s.suksesskriterier.underArbeidAntall,
      oppfylt: acc.oppfylt + s.suksesskriterier.oppfyltAntall,
      ikkeOppfylt: acc.ikkeOppfylt + s.suksesskriterier.ikkeOppfyltAntall,
      ikkeRelevant: acc.ikkeRelevant + s.suksesskriterier.ikkeRelevantAntall,
    }),
    { total: 0, ikkePaabegynt: 0, underArbeid: 0, oppfylt: 0, ikkeOppfylt: 0, ikkeRelevant: 0 }
  )

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
      ikkePaabegynt: acc.ikkePaabegynt + s.pvk.ikkePaabegynt,
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

export const DashboardOverviewCard = ({ stats, view }: IProps) => {
  const agg = aggregateAvdelingStats(stats)

  const dokData: IBarSegment[] = [
    { name: 'Under arbeid', value: agg.dok.underArbeid, color: DOK_COLORS[0] },
    { name: 'Sendt til godkjenning', value: agg.dok.sendtTilGodkjenning, color: DOK_COLORS[1] },
    { name: 'Godkjent', value: agg.dok.godkjentAvRisikoeier, color: DOK_COLORS[2] },
  ]

  const suksessTotal =
    agg.suksess.ikkePaabegynt +
    agg.suksess.underArbeid +
    agg.suksess.oppfylt +
    agg.suksess.ikkeOppfylt +
    agg.suksess.ikkeRelevant
  const suksessPcts =
    suksessTotal > 0
      ? roundedPercentages([
          agg.suksess.ikkePaabegynt,
          agg.suksess.underArbeid,
          agg.suksess.oppfylt,
          agg.suksess.ikkeOppfylt,
          agg.suksess.ikkeRelevant,
        ])
      : [0, 0, 0, 0, 0]

  const suksessData: IBarSegment[] = [
    { name: 'Ikke påbegynt', value: suksessPcts[0], color: AVDELING_SUKSESS_COLORS[0] },
    { name: 'Under arbeid', value: suksessPcts[1], color: AVDELING_SUKSESS_COLORS[1] },
    { name: 'Oppfylt', value: suksessPcts[2], color: AVDELING_SUKSESS_COLORS[2] },
    { name: 'Ikke oppfylt', value: suksessPcts[3], color: AVDELING_SUKSESS_COLORS[3] },
    { name: 'Ikke relevant', value: suksessPcts[4], color: AVDELING_SUKSESS_COLORS[4] },
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
    <div>
      <Detail uppercase className='mt-2 mb-4'>
        {agg.dok.total.toLocaleString('nb-NO')} ETTERLEVELSESDOKUMENTER
      </Detail>

      {view === 'figurer' ? (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-4'>
          <div className='md:order-1 xl:order-none'>
            <Heading size='xsmall' level='3'>
              Etterlevelsesdokumenter ({agg.dok.total})
            </Heading>
            <OverviewStackedBar data={dokData} />
          </div>

          <div className='md:order-3 xl:order-none'>
            <Heading size='xsmall' level='3'>
              Suksesskriterier (etterlevelseskrav)
            </Heading>
            <OverviewStackedBar data={suksessData} isPercentage />
          </div>

          <div className='md:order-2 xl:order-none'>
            <Heading size='xsmall' level='3'>
              Vurdere behov for PVK ({agg.behov.totalMedPersonopplysninger})
            </Heading>
            <OverviewStackedBar data={behovData} />
          </div>

          <div className='md:order-4 xl:order-none'>
            <Heading size='xsmall' level='3'>
              Digital PVK status ({agg.pvk.total - agg.pvk.pvkIWord})
            </Heading>
            <OverviewStackedBar data={pvkData} />
          </div>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-4'>
          <div className='md:order-1 xl:order-none'>
            <OverviewKeyMetrics
              title={`Etterlevelsesdokumenter (${agg.dok.total})`}
              data={dokData}
            />
          </div>
          <div className='md:order-3 xl:order-none'>
            <OverviewKeyMetrics
              title='Suksesskriterier (etterlevelseskrav)'
              data={suksessData}
              isPercentage
            />
          </div>
          <div className='md:order-2 xl:order-none'>
            <OverviewKeyMetrics
              title={`Vurdere behov for PVK (${agg.behov.totalMedPersonopplysninger})`}
              data={behovData}
            />
          </div>
          <div className='md:order-4 xl:order-none'>
            <OverviewKeyMetrics
              title={`Digital PVK status (${agg.pvk.total - agg.pvk.pvkIWord})`}
              data={pvkData}
            />
          </div>
        </div>
      )}
    </div>
  )
}
