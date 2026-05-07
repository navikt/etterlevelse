'use client'

import { IAvdelingDashboardStats } from '@/constants/dashboard/dashboardConstants'
import { Link as AkselLink, BodyShort, Heading } from '@navikt/ds-react'

interface IProps {
  stats: IAvdelingDashboardStats
  hideHeader?: boolean
  subHeadingLevel?: '3' | '4'
}

export const DashboardCard = ({ stats, hideHeader, subHeadingLevel = '3' }: IProps) => {
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
          <Heading size='xsmall' level={subHeadingLevel}>
            Etterlevelsesdokumenter ({stats.dokumenter.total})
          </Heading>
          <BodyShort>
            Under arbeid <span className='font-bold'>{stats.dokumenter.underArbeid}</span>
          </BodyShort>
          <BodyShort>
            Sendt til godkjenning{' '}
            <span className='font-bold'>{stats.dokumenter.sendtTilGodkjenning}</span>
          </BodyShort>
          <BodyShort>
            Godkjent <span className='font-bold'>{stats.dokumenter.godkjentAvRisikoeier}</span>
          </BodyShort>
        </div>

        <div>
          <Heading size='xsmall' level={subHeadingLevel}>
            Vurdere behov for PVK
          </Heading>
          <BodyShort>
            Ikke vurdert behov{' '}
            <span className='font-bold'>
              {stats.behovForPvk.ikkeVurdertBehov} av {stats.behovForPvk.totalMedPersonopplysninger}
            </span>
          </BodyShort>
          <BodyShort>
            Skal ikke gjennomføre PVK{' '}
            <span className='font-bold'>
              {stats.behovForPvk.vurdertIkkeBehov} av {stats.behovForPvk.totalMedPersonopplysninger}
            </span>
          </BodyShort>
          <BodyShort>
            Skal gjennomføre PVK{' '}
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
          <Heading size='xsmall' level={subHeadingLevel}>
            Suksesskriterier (etterlevelseskrav)
          </Heading>
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
          <Heading size='xsmall' level={subHeadingLevel}>
            PVK-status ({stats.pvk.total - stats.pvk.pvkIWord})
          </Heading>
          <BodyShort>
            Ikke påbegynt <span className='font-bold'>{stats.pvk.ikkePaabegynt}</span>
          </BodyShort>
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
