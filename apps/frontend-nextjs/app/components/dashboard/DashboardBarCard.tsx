'use client'

import { IAvdelingDashboardStats } from '@/constants/dashboard/dashboardConstants'
import { Link as AkselLink, BodyShort, Heading } from '@navikt/ds-react'

interface IProps {
  stats: IAvdelingDashboardStats
  hideHeader?: boolean
  singleRow?: boolean
  subHeadingLevel?: '3' | '4'
}

interface IBarSegment {
  name: string
  value: number
  color: string
}

const DOK_COLORS = ['#fa4d56', '#9f1853', '#005d5d']
const SUKSESS_COLORS = ['#1192e8', '#005d5d', '#fa4d56', '#9f1853']
const BEHOV_COLORS = ['#fa4d56', '#9f1853', '#005d5d', '#1192e8']
const PVK_COLORS = ['#fa4d56', '#9f1853', '#005d5d', '#1192e8', '#6929c4', '#198038']

const StackedBar = ({
  data,
  isPercentage,
  maxWidth,
}: {
  data: IBarSegment[]
  isPercentage?: boolean
  maxWidth?: string
}) => {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  const hasData = total > 0

  if (!hasData) return <BodyShort className='text-gray-500 mt-2'>Ingen data</BodyShort>

  return (
    <div style={{ marginTop: '12px', maxWidth }}>
      <div style={{ display: 'flex', height: 32, borderRadius: 4, overflow: 'hidden' }}>
        {data
          .filter((d) => d.value > 0)
          .map((d) => (
            <div
              key={d.name}
              title={`${d.name}: ${d.value}`}
              style={{
                width: `${(d.value / total) * 100}%`,
                backgroundColor: d.color,
                transition: 'width 0.3s',
              }}
            />
          ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
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
              {d.name} {isPercentage ? `${d.value}%` : `(${d.value})`}
            </BodyShort>
          </div>
        ))}
      </div>
    </div>
  )
}

export const DashboardBarCard = ({
  stats,
  hideHeader,
  singleRow,
  subHeadingLevel = '3',
}: IProps) => {
  const dokData: IBarSegment[] = [
    { name: 'Under arbeid', value: stats.dokumenter.underArbeid, color: DOK_COLORS[0] },
    {
      name: 'Sendt til godkjenning',
      value: stats.dokumenter.sendtTilGodkjenning,
      color: DOK_COLORS[1],
    },
    { name: 'Godkjent', value: stats.dokumenter.godkjentAvRisikoeier, color: DOK_COLORS[2] },
  ]

  const suksessData: IBarSegment[] = [
    {
      name: 'Under arbeid',
      value: stats.suksesskriterier.underArbeidProsent,
      color: SUKSESS_COLORS[0],
    },
    { name: 'Oppfylt', value: stats.suksesskriterier.oppfyltProsent, color: SUKSESS_COLORS[1] },
    {
      name: 'Ikke oppfylt',
      value: stats.suksesskriterier.ikkeOppfyltProsent,
      color: SUKSESS_COLORS[2],
    },
    {
      name: 'Ikke relevant',
      value: stats.suksesskriterier.ikkeRelevantProsent,
      color: SUKSESS_COLORS[3],
    },
  ]

  const behovData: IBarSegment[] = [
    {
      name: 'Ikke vurdert behov',
      value: stats.behovForPvk.ikkeVurdertBehov,
      color: BEHOV_COLORS[0],
    },
    {
      name: 'Skal ikke gjennomføre PVK',
      value: stats.behovForPvk.vurdertIkkeBehov,
      color: BEHOV_COLORS[1],
    },
    {
      name: 'Skal gjennomføre PVK',
      value: stats.behovForPvk.behovIkkePaabegynt,
      color: BEHOV_COLORS[2],
    },
    { name: 'PVK i Word', value: stats.pvk.pvkIWord, color: BEHOV_COLORS[3] },
  ]

  const pvkData: IBarSegment[] = [
    { name: 'Ikke påbegynt', value: stats.pvk.ikkePaabegynt ?? 0, color: PVK_COLORS[0] },
    { name: 'Under arbeid', value: stats.pvk.underArbeid, color: PVK_COLORS[1] },
    { name: 'Til behandling hos PVO', value: stats.pvk.tilBehandlingHosPvo, color: PVK_COLORS[2] },
    {
      name: 'Tilbakemelding fra PVO',
      value: stats.pvk.tilbakemeldingFraPvo,
      color: PVK_COLORS[3],
    },
    {
      name: 'Godkjent av risikoeier',
      value: stats.pvk.godkjentAvRisikoeier,
      color: PVK_COLORS[4],
    },
  ]

  return (
    <div className='border border-gray-300 rounded-lg p-6 bg-white'>
      {!hideHeader && (
        <Heading size='small' level='3'>
          <AkselLink href={`/dashboard/${stats.avdelingId}`}>{stats.avdelingNavn}</AkselLink>
        </Heading>
      )}

      <div
        className={singleRow ? 'grid grid-cols-2 lg:grid-cols-4 gap-6 mt-4' : ''}
        style={
          !singleRow
            ? {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px',
                marginTop: '16px',
              }
            : undefined
        }
      >
        <div>
          <Heading size='xsmall' level={subHeadingLevel}>
            Etterlevelsesdokumenter ({stats.dokumenter.total})
          </Heading>
          <StackedBar data={dokData} maxWidth='200px' />
        </div>

        {singleRow ? (
          <>
            <div>
              <Heading size='xsmall' level={subHeadingLevel}>
                Suksesskriterier (etterlevelseskrav)
              </Heading>
              <StackedBar data={suksessData} isPercentage maxWidth='200px' />
            </div>

            <div>
              <Heading size='xsmall' level={subHeadingLevel}>
                Vurdere behov for PVK ({stats.behovForPvk.totalMedPersonopplysninger})
              </Heading>
              <StackedBar data={behovData} maxWidth='200px' />
            </div>
          </>
        ) : (
          <>
            <div>
              <Heading size='xsmall' level={subHeadingLevel}>
                Vurdere behov for PVK ({stats.behovForPvk.totalMedPersonopplysninger})
              </Heading>
              <StackedBar data={behovData} maxWidth='200px' />
            </div>

            <div>
              <Heading size='xsmall' level={subHeadingLevel}>
                Suksesskriterier (etterlevelseskrav)
              </Heading>
              <StackedBar data={suksessData} isPercentage maxWidth='200px' />
            </div>
          </>
        )}

        <div>
          <Heading size='xsmall' level={subHeadingLevel}>
            Digital PVK status ({stats.pvk.total - stats.pvk.pvkIWord})
          </Heading>
          <StackedBar data={pvkData} maxWidth='200px' />
        </div>
      </div>
    </div>
  )
}
