'use client'

import { ExternalLink } from '@/components/common/externalLink/externalLink'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { pvkDokumentasjonTabFilterTiltakUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import {
  risikoscenarioFilterAlleUrl,
  tabTiltakQuery,
} from '@/routes/risikoscenario/risikoscenarioRoutes'
import { FormSummary } from '@navikt/ds-react'
import { usePathname } from 'next/navigation'
import { FunctionComponent } from 'react'
import FormAlert from './formAlert'

type TProps = {
  alleRisikoscenario: IRisikoscenario[]
  alleTiltak: ITiltak[]
  risikoscenarioError: string
  tiltakError: string
  tiltakAnsvarligError: string
  tiltakFristError: string
  tiltakFristUtgaattError: string
  customStepNumber?: number
}

export const RisikoscenarioSummary: FunctionComponent<TProps> = ({
  alleRisikoscenario,
  alleTiltak,
  risikoscenarioError,
  tiltakError,
  tiltakAnsvarligError,
  tiltakFristError,
  tiltakFristUtgaattError,
  customStepNumber,
}) => {
  const pathName = usePathname()
  const risikoscenarioLink = `${pathName}?steg=${customStepNumber ? customStepNumber : 6}`
  const tiltakLink = `${pathName}?steg=${customStepNumber ? customStepNumber : 7}`

  return (
    <FormSummary className='my-3'>
      <FormSummary.Header>
        <FormSummary.Heading level='2'>Risikoscenarioer og tiltak</FormSummary.Heading>
      </FormSummary.Header>
      <FormSummary.Answers>
        <FormSummary.Answer>
          <FormSummary.Value>
            <FormSummary.Answers>
              <FormSummary.Answer>
                <FormSummary.Label id='risikoscenarioer'>Risikoscenarioer</FormSummary.Label>
                <FormSummary.Value>
                  Det er beskrevet totalt sett {alleRisikoscenario.length} risikoscenarioer.{' '}
                  <ExternalLink href={`${risikoscenarioLink}${risikoscenarioFilterAlleUrl()}`}>
                    Se alle risikoscenarioer
                  </ExternalLink>
                  .
                  <br />
                  {risikoscenarioError !== '' && <FormAlert>{risikoscenarioError}</FormAlert>}
                </FormSummary.Value>
              </FormSummary.Answer>
              <FormSummary.Answer>
                <FormSummary.Label id='tiltak'>Tiltak</FormSummary.Label>
                <FormSummary.Value>
                  Det er beskrevet totalt sett {alleTiltak.length} tiltak, hvorav{' '}
                  {alleTiltak.filter((tiltak) => tiltak.iverksatt).length} er iverksatt.{' '}
                  <ExternalLink href={`${tiltakLink}${tabTiltakQuery}`}>
                    Se alle tiltak
                  </ExternalLink>
                  .
                  <br />
                  {tiltakError !== '' && <FormAlert>{tiltakError}</FormAlert>}
                  {tiltakAnsvarligError !== '' && (
                    <>
                      <FormAlert>{tiltakAnsvarligError}</FormAlert>
                      <ExternalLink
                        href={pvkDokumentasjonTabFilterTiltakUrl('7', 'tiltak', 'utenAnsvarlig')}
                      >
                        Se tiltak som mangler tiltaksansvarlig
                      </ExternalLink>
                      <br />
                    </>
                  )}
                  {tiltakFristError !== '' && (
                    <>
                      <FormAlert>{tiltakError}</FormAlert>
                      <ExternalLink
                        href={pvkDokumentasjonTabFilterTiltakUrl('7', 'tiltak', 'utenFrist')}
                      >
                        Se tiltak som mangler tiltaksfrist (åpner i ny fane)
                      </ExternalLink>
                    </>
                  )}
                  {tiltakFristUtgaattError !== '' && (
                    <>
                      <FormAlert>{tiltakFristUtgaattError}</FormAlert>
                      <ExternalLink
                        href={pvkDokumentasjonTabFilterTiltakUrl('7', 'tiltak', 'alleTiltak')}
                      >
                        Se tiltak som har utgått tiltaksfrist (åpner i ny fane)
                      </ExternalLink>
                    </>
                  )}
                </FormSummary.Value>
              </FormSummary.Answer>
            </FormSummary.Answers>
          </FormSummary.Value>
        </FormSummary.Answer>
      </FormSummary.Answers>
    </FormSummary>
  )
}

export default RisikoscenarioSummary
