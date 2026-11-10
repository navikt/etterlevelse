'use client'

import { BodyShort, Heading, Popover, Portal } from '@navikt/ds-react'
import { useState } from 'react'
import { IDashboardTable } from '@/constants/dashboard/dashboardConstants'
import { OverviewStackedBar } from './DashboardOverviewCard'
import { buildSuksesskriterierSegments } from './chartUtils'

export const getKravTrafficColor = (ferdig: number, total: number): string => {
  if (total === 0) return '#C6C2BF'
  const pct = (ferdig / total) * 100
  if (pct >= 100) return '#06893A'
  if (pct >= 50) return '#E67E22'
  return '#C30000'
}

export const TrafficDot = ({ color }: { color: string }) => (
  <span
    style={{
      display: 'inline-block',
      width: 12,
      height: 12,
      borderRadius: '50%',
      backgroundColor: color,
      marginRight: 6,
      verticalAlign: 'middle',
    }}
  />
)

export const OppfyltCell = ({ dok }: { dok: IDashboardTable }) => {
  const [open, setOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const suksesskriterier = dok.suksesskriterier
  const suksessData = buildSuksesskriterierSegments({
    ikkePaabegynt: suksesskriterier?.ikkePaabegyntAntall ?? 0,
    underArbeid: suksesskriterier?.underArbeidAntall ?? 0,
    oppfylt: suksesskriterier?.oppfyltAntall ?? 0,
    ikkeOppfylt: suksesskriterier?.ikkeOppfyltAntall ?? 0,
    ikkeRelevant: suksesskriterier?.ikkeRelevantAntall ?? 0,
  })
  const suksessTotal = suksessData.reduce((sum, d) => sum + (d.rawValue ?? 0), 0)
  const oppfyltPct = dok.oppfyltKravProsent

  return (
    <>
      <button
        ref={setAnchorEl}
        onClick={() => setOpen((o) => !o)}
        style={{
          border: '2.5px solid #0067C5',
          borderRadius: '10px',
          padding: '4px 12px',
          background: 'white',
          color: '#0067C5',
          fontWeight: 700,
          fontSize: '1rem',
          cursor: 'pointer',
          display: 'inline-grid',
          justifyItems: 'center',
        }}
      >
        <span aria-hidden style={{ gridArea: '1 / 1', visibility: 'hidden' }}>
          100%
        </span>
        <span style={{ gridArea: '1 / 1' }}>{oppfyltPct != null ? `${oppfyltPct}%` : '-'}</span>
      </button>
      <Portal>
        <Popover open={open} onClose={() => setOpen(false)} anchorEl={anchorEl} placement='bottom'>
          <Popover.Content>
            <div style={{ width: '340px' }}>
              {suksessTotal > 0 ? (
                <>
                  <Heading size='small' level='3'>
                    Suksesskriterier (etterlevelseskrav)
                  </Heading>
                  <OverviewStackedBar data={suksessData} isPercentage />
                  <hr className='my-4' />
                  <BodyShort className='mt-6 mb-2' style={{ textAlign: 'left' }}>
                    <strong>Oppfylt der kravet er ferdig vurdert: {oppfyltPct}%</strong>
                  </BodyShort>
                  <BodyShort
                    size='small'
                    style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word' }}
                  >
                    Denne prosenten viser alle suksesskriterier som er oppfylt, i forhold til
                    ikke-oppfylte suksesskriterier.
                  </BodyShort>
                </>
              ) : (
                <BodyShort>Ingen suksesskriterier vurdert ennå.</BodyShort>
              )}
            </div>
          </Popover.Content>
        </Popover>
      </Portal>
    </>
  )
}
