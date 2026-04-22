'use client'

import { IAvdelingDashboardStats } from '@/constants/dashboard/dashboardConstants'
import { Link as AkselLink, BodyShort, Heading } from '@navikt/ds-react'

interface IProps {
  stats: IAvdelingDashboardStats
  hideHeader?: boolean
}

export const DashboardCard = ({ stats, hideHeader }: IProps) => {
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
          columnGap: '32px',
          rowGap: '16px',
          marginTop: '16px',
          whiteSpace: 'nowrap',
        }}
      >
        <div>
          <BodyShort weight='semibold'>
            Etterlevelsesdokumenter ({stats.dokumenter.total})
          </BodyShort>
          <BodyShort>
            Under arbeid <span className='font-bold'>{stats.dokumenter.underArbeid}</span>
          </BodyShort>
          <BodyShort>
            Sendt til godkjenning{' '}
            <span className='font-bold'>{stats.dokumenter.sendtTilGodkjenning}</span>
          </BodyShort>
          <BodyShort>
            Godkjent av risikoeier{' '}
            <span className='font-bold'>{stats.dokumenter.godkjentAvRisikoeier}</span>
          </BodyShort>
        </div>

        <div>
          <BodyShort weight='semibold'>Behov for PVK</BodyShort>
          <BodyShort>
            Ikke ennå vurdert behov{' '}
            <span className='font-bold'>
              {stats.behovForPvk.ikkeVurdertBehov} av {stats.behovForPvk.totalMedPersonopplysninger}
            </span>
          </BodyShort>
          <BodyShort>
            Vurdert, ikke behov{' '}
            <span className='font-bold'>
              {stats.behovForPvk.vurdertIkkeBehov} av {stats.behovForPvk.totalMedPersonopplysninger}
            </span>
          </BodyShort>
          <BodyShort>
            Behov, ikke påbegynt{' '}
            <span className='font-bold'>
              {stats.behovForPvk.behovIkkePaabegynt} av{' '}
              {stats.behovForPvk.totalMedPersonopplysninger}
            </span>
          </BodyShort>
          <BodyShort>
            PVK i Word <span className='font-bold'>{stats.pvk.pvkIWord}</span>
          </BodyShort>
        </div>

        <div>
          <BodyShort weight='semibold'>Etterlevelse: suksesskriterier</BodyShort>
          <BodyShort>
            Under arbeid{' '}
            <span className='font-bold'>{stats.suksesskriterier.underArbeidProsent}%</span>
          </BodyShort>
          <BodyShort>
            Oppfylt <span className='font-bold'>{stats.suksesskriterier.oppfyltProsent}%</span>
          </BodyShort>
          <BodyShort>
            Ikke oppfylt{' '}
            <span className='font-bold'>{stats.suksesskriterier.ikkeOppfyltProsent}%</span>
          </BodyShort>
          <BodyShort>
            Ikke relevant{' '}
            <span className='font-bold'>{stats.suksesskriterier.ikkeRelevantProsent}%</span>
          </BodyShort>
        </div>

        <div>
          <BodyShort weight='semibold'>PVK ({stats.pvk.total})</BodyShort>
          <BodyShort>
            Under arbeid <span className='font-bold'>{stats.pvk.underArbeid}</span>
          </BodyShort>
          <BodyShort>
            Til behandling hos PVO{' '}
            <span className='font-bold'>{stats.pvk.tilBehandlingHosPvo}</span>
          </BodyShort>
          <BodyShort>
            Tilbakemelding fra PVO{' '}
            <span className='font-bold'>{stats.pvk.tilbakemeldingFraPvo}</span>
          </BodyShort>
          <BodyShort>
            Godkjent av risikoeier{' '}
            <span className='font-bold'>{stats.pvk.godkjentAvRisikoeier}</span>
          </BodyShort>
        </div>
      </div>
    </div>
  )
}
