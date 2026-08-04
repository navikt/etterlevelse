'use client'

import { IDashboardTable } from '@/constants/dashboard/dashboardConstants'
import { BodyShort, Popover } from '@navikt/ds-react'
import { useState } from 'react'

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
  const oppfylt = dok.antallSuksesskriterierOppfylt ?? 0
  const ikkeOppfylt = dok.antallSuksesskriterierIkkeOppfylt ?? 0
  const totSuksess = oppfylt + ikkeOppfylt
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
          minWidth: '52px',
        }}
      >
        {oppfyltPct != null ? `${oppfyltPct}%` : '-'}
      </button>
      <Popover open={open} onClose={() => setOpen(false)} anchorEl={anchorEl} placement='bottom'>
        <Popover.Content>
          <div style={{ width: '340px' }}>
            {totSuksess > 0 ? (
              <>
                <div className='flex w-full h-6 mb-4 overflow-hidden'>
                  <div style={{ flex: oppfylt, backgroundColor: '#005B4B' }} />
                  <div style={{ flex: ikkeOppfylt, backgroundColor: '#C30000' }} />
                </div>
                <div className='flex items-center gap-2 mb-2'>
                  <span
                    className='inline-block w-4 h-4 rounded-full'
                    style={{ backgroundColor: '#005B4B' }}
                  />
                  <BodyShort>
                    Oppfylt <strong>{oppfylt} suksesskriterier</strong>
                  </BodyShort>
                </div>
                <div className='flex items-center gap-2 mb-6'>
                  <span
                    className='inline-block w-4 h-4 rounded-full'
                    style={{ backgroundColor: '#C30000' }}
                  />
                  <BodyShort>
                    Ikke oppfylt <strong>{ikkeOppfylt} suksesskriterier</strong>
                  </BodyShort>
                </div>
                <hr className='my-4' />
                <BodyShort className='mb-2' style={{ textAlign: 'left' }}>
                  <strong>Oppfylt der kravet er ferdig vurdert: {oppfyltPct}%</strong>
                </BodyShort>
                <BodyShort
                  size='small'
                  style={{ textAlign: 'left', whiteSpace: 'normal', wordBreak: 'break-word' }}
                >
                  Etterleveren må først ha markert hele kravet som ferdig utfylt for at tallene
                  vises her. Prosentandelen er beregnet basert på forholdet mellom suksesskriterier
                  vurdert som oppfylt, og suksesskriterier vurdert som ikke oppfylt. Det tas ikke
                  med suksesskriterier som ble vurdert som ikke relevant.
                </BodyShort>
              </>
            ) : (
              <BodyShort>Ingen suksesskriterier ferdig vurdert ennå.</BodyShort>
            )}
          </div>
        </Popover.Content>
      </Popover>
    </>
  )
}
