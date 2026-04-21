'use client'

import { IAvdelingDashboardStats } from '@/api/dashboard/dashboardApi'
import { Link as AkselLink, BodyShort, Heading } from '@navikt/ds-react'
import { useState } from 'react'

interface IProps {
  stats: IAvdelingDashboardStats
  hideHeader?: boolean
}

interface IPieSlice {
  name: string
  value: number
  color: string
}

const DOK_COLORS = ['#C4C4C4', '#5B9BD5', '#91DC75']
const SUKSESS_COLORS = ['#5B9BD5', '#91DC75', '#FF6B6B', '#C4C4C4']
const BEHOV_COLORS = ['#FFB347', '#C4C4C4', '#8B8B8B']
const PVK_COLORS = ['#5B9BD5', '#2F5496', '#9B59B6', '#91DC75']

const SimplePie = ({
  data,
  size = 140,
  highlightedName,
  onHover,
}: {
  data: IPieSlice[]
  size?: number
  highlightedName: string | null
  onHover: (name: string | null) => void
}) => {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  if (total === 0) return null

  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 5

  const angleOffset = -Math.PI / 2

  const slices = data
    .filter((d) => d.value > 0)
    .map((d, i, arr) => {
      const angle = (d.value / total) * 2 * Math.PI
      const startAngle = arr
        .slice(0, i)
        .reduce((acc, s) => acc + (s.value / total) * 2 * Math.PI, angleOffset)
      const endAngle = startAngle + angle

      const isHighlighted = highlightedName === d.name
      const isDimmed = highlightedName !== null && !isHighlighted
      const opacity = isDimmed ? 0.3 : 1
      const scale = isHighlighted ? 'scale(1.05)' : 'scale(1)'

      const x1 = cx + r * Math.cos(startAngle)
      const y1 = cy + r * Math.sin(startAngle)
      const x2 = cx + r * Math.cos(endAngle)
      const y2 = cy + r * Math.sin(endAngle)
      const largeArc = angle > Math.PI ? 1 : 0

      if (angle >= 2 * Math.PI - 0.001) {
        return (
          <circle
            key={d.name}
            cx={cx}
            cy={cy}
            r={r}
            fill={d.color}
            opacity={opacity}
            style={{
              transformOrigin: `${cx}px ${cy}px`,
              transform: scale,
              transition: 'opacity 0.2s, transform 0.2s',
            }}
            onMouseEnter={() => onHover(d.name)}
            onMouseLeave={() => onHover(null)}
          />
        )
      }

      return (
        <path
          key={d.name}
          d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`}
          fill={d.color}
          opacity={opacity}
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            transform: scale,
            transition: 'opacity 0.2s, transform 0.2s',
            cursor: 'pointer',
          }}
          onMouseEnter={() => onHover(d.name)}
          onMouseLeave={() => onHover(null)}
        />
      )
    })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices}
    </svg>
  )
}

const LegendItem = ({
  color,
  label,
  isHighlighted,
  isDimmed,
  onMouseEnter,
  onMouseLeave,
}: {
  color: string
  label: string
  isHighlighted: boolean
  isDimmed: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginTop: '4px',
      cursor: 'pointer',
      opacity: isDimmed ? 0.4 : 1,
      fontWeight: isHighlighted ? 600 : 400,
      transition: 'opacity 0.2s',
    }}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <span
      style={{
        display: 'inline-block',
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: color,
        flexShrink: 0,
      }}
    />
    <BodyShort size='small'>{label}</BodyShort>
  </div>
)

const PieWithLegend = ({ data, hasData }: { data: IPieSlice[]; hasData: boolean }) => {
  const [highlighted, setHighlighted] = useState<string | null>(null)

  return (
    <>
      <div style={{ marginTop: '8px' }}>
        {hasData ? (
          <SimplePie data={data} highlightedName={highlighted} onHover={setHighlighted} />
        ) : (
          <BodyShort className='text-gray-500'>Ingen data</BodyShort>
        )}
      </div>
      {hasData && (
        <div style={{ marginTop: '8px' }}>
          {data.map((s) => (
            <LegendItem
              key={s.name}
              color={s.color}
              label={s.name}
              isHighlighted={highlighted === s.name}
              isDimmed={highlighted !== null && highlighted !== s.name}
              onMouseEnter={() => setHighlighted(s.name)}
              onMouseLeave={() => setHighlighted(null)}
            />
          ))}
        </div>
      )}
    </>
  )
}

export const DashboardPieCard = ({ stats, hideHeader }: IProps) => {
  const dokSlices: IPieSlice[] = [
    {
      name: `Under arbeid (${stats.dokumenter.underArbeid})`,
      value: stats.dokumenter.underArbeid,
      color: DOK_COLORS[0],
    },
    {
      name: `Sendt til godkjenning (${stats.dokumenter.sendtTilGodkjenning})`,
      value: stats.dokumenter.sendtTilGodkjenning,
      color: DOK_COLORS[1],
    },
    {
      name: `Godkjent (${stats.dokumenter.godkjentAvRisikoeier})`,
      value: stats.dokumenter.godkjentAvRisikoeier,
      color: DOK_COLORS[2],
    },
  ]

  const suksessSlices: IPieSlice[] = [
    {
      name: `Under arbeid (${stats.suksesskriterier.underArbeidProsent}%)`,
      value: stats.suksesskriterier.underArbeidProsent,
      color: SUKSESS_COLORS[0],
    },
    {
      name: `Oppfylt (${stats.suksesskriterier.oppfyltProsent}%)`,
      value: stats.suksesskriterier.oppfyltProsent,
      color: SUKSESS_COLORS[1],
    },
    {
      name: `Ikke oppfylt (${stats.suksesskriterier.ikkeOppfyltProsent}%)`,
      value: stats.suksesskriterier.ikkeOppfyltProsent,
      color: SUKSESS_COLORS[2],
    },
    {
      name: `Ikke relevant (${stats.suksesskriterier.ikkeRelevantProsent}%)`,
      value: stats.suksesskriterier.ikkeRelevantProsent,
      color: SUKSESS_COLORS[3],
    },
  ]

  const behovSlices: IPieSlice[] = [
    {
      name: `Ikke ennå vurdert behov (${stats.behovForPvk.ikkeVurdertBehov})`,
      value: stats.behovForPvk.ikkeVurdertBehov,
      color: BEHOV_COLORS[0],
    },
    {
      name: `Vurdert, ikke behov (${stats.behovForPvk.vurdertIkkeBehov})`,
      value: stats.behovForPvk.vurdertIkkeBehov,
      color: BEHOV_COLORS[1],
    },
    {
      name: `Behov, ikke påbegynt (${stats.behovForPvk.behovIkkePaabegynt})`,
      value: stats.behovForPvk.behovIkkePaabegynt,
      color: BEHOV_COLORS[2],
    },
    {
      name: `PVK i Word (${stats.pvk.pvkIWord})`,
      value: stats.pvk.pvkIWord,
      color: '#E67E22',
    },
  ]

  const pvkSlices: IPieSlice[] = [
    {
      name: `Under arbeid (${stats.pvk.underArbeid})`,
      value: stats.pvk.underArbeid,
      color: PVK_COLORS[0],
    },
    {
      name: `Til behandling hos PVO (${stats.pvk.tilBehandlingHosPvo})`,
      value: stats.pvk.tilBehandlingHosPvo,
      color: PVK_COLORS[1],
    },
    {
      name: `Tilbakemelding fra PVO (${stats.pvk.tilbakemeldingFraPvo})`,
      value: stats.pvk.tilbakemeldingFraPvo,
      color: PVK_COLORS[2],
    },
    {
      name: `Godkjent av risikoeier (${stats.pvk.godkjentAvRisikoeier})`,
      value: stats.pvk.godkjentAvRisikoeier,
      color: PVK_COLORS[3],
    },
  ]

  const hasDokData = dokSlices.some((d) => d.value > 0)
  const hasSuksessData = suksessSlices.some((d) => d.value > 0)
  const hasBehovData = behovSlices.some((d) => d.value > 0)
  const hasPvkData = pvkSlices.some((d) => d.value > 0)

  return (
    <div className='border border-gray-300 rounded-lg p-6 bg-white'>
      {!hideHeader && (
        <Heading size='small' level='3'>
          <AkselLink href={`/dashboard/${stats.avdelingId}`}>{stats.avdelingNavn}</AkselLink>
        </Heading>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginTop: '16px',
        }}
      >
        <div>
          <BodyShort weight='semibold'>
            Etterlevelsesdokumenter ({stats.dokumenter.total})
          </BodyShort>
          <PieWithLegend data={dokSlices} hasData={hasDokData} />
        </div>

        <div>
          <BodyShort weight='semibold'>
            Behov for PVK ({stats.behovForPvk.totalMedPersonopplysninger})
          </BodyShort>
          <PieWithLegend data={behovSlices} hasData={hasBehovData} />
        </div>

        <div>
          <BodyShort weight='semibold'>Suksesskriterier (etterlevelseskrav)</BodyShort>
          <PieWithLegend data={suksessSlices} hasData={hasSuksessData} />
        </div>

        <div>
          <BodyShort weight='semibold'>PVK ({stats.pvk.total})</BodyShort>
          <PieWithLegend data={pvkSlices} hasData={hasPvkData} />
        </div>
      </div>
    </div>
  )
}
