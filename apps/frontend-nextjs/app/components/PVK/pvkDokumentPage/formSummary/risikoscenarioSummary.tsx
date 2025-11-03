'use client'

import { ExternalLink } from '@/components/common/externalLink/externalLink'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import {
  filterUtenAnsvarligQuery,
  filterUtenFristQuery,
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
  tiltakFristError: string[]
  customStepNumber?: number
}

export const RisikoscenarioSummary: FunctionComponent<TProps> = ({
  alleRisikoscenario,
  alleTiltak,
  risikoscenarioError,
  tiltakError,
  tiltakAnsvarligError,
  tiltakFristError,
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
                        href={`${tiltakLink}${tabTiltakQuery}${filterUtenAnsvarligQuery}`}
                      >
                        Se tiltak som mangler tiltaksansvarlig
                      </ExternalLink>
                      <br />
                    </>
                  )}
                  {tiltakFristError.length !== 0 && (
                    <>
                      {tiltakFristError.forEach((error, index) => (
                        <FormAlert key={`${index}_tiltakFristError`}>{error}</FormAlert>
                      ))}
                      <ExternalLink href={`${tiltakLink}${tabTiltakQuery}${filterUtenFristQuery}`}>
                        Se tiltak som mangler tiltaksfrist
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
