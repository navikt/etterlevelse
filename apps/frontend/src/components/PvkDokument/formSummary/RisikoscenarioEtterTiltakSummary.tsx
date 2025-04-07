import { FormSummary } from '@navikt/ds-react'
import { FunctionComponent, useEffect, useState } from 'react'
import { IRisikoscenario } from '../../../constants'
import { ExternalLink } from '../../common/RouteLink'
import { risikoscenarioFieldCheck } from '../../risikoscenario/common/util'
import FormAlert from './FormAlert'

type TProps = {
  alleRisikoscenario: IRisikoscenario[]
  savnerVurderingError: string
  customStepNumber?: number
}

export const RisikoscenarioEtterTitak: FunctionComponent<TProps> = ({
  alleRisikoscenario,
  savnerVurderingError,
  customStepNumber,
}) => {
  const [antallFerdigVurdert, setAntallFerdigVurdert] = useState<number>(0)
  const currentPath = window.location.pathname
  const risikoscenarioLink = currentPath.slice(0, -1) + `${customStepNumber ? customStepNumber : 6}`

  useEffect(() => {
    if (alleRisikoscenario.length !== 0) {
      let antallFerdigVurdert = 0

      const risikoscenarioMedIngenTiltak = alleRisikoscenario.filter((risiko) => risiko.ingenTiltak)
      const risikoscenarioMedTiltak = alleRisikoscenario.filter((risiko) => !risiko.ingenTiltak)
      if (risikoscenarioMedTiltak.length !== 0) {
        const ferdigVurdertRisikoscenarioMedTiltak = risikoscenarioMedTiltak.filter((risiko) => {
          return (
            risiko.tiltakIds.length !== 0 &&
            risikoscenarioFieldCheck(risiko) &&
            risiko.sannsynlighetsNivaaEtterTiltak !== 0 &&
            risiko.konsekvensNivaaEtterTiltak !== 0 &&
            risiko.nivaaBegrunnelseEtterTiltak !== ''
          )
        })
        antallFerdigVurdert += ferdigVurdertRisikoscenarioMedTiltak.length
      }
      if (risikoscenarioMedIngenTiltak.length !== 0) {
        const ferdigVurdertRisikoscenarioUtenTiltak = risikoscenarioMedIngenTiltak.filter(
          (risiko) => {
            return risikoscenarioFieldCheck(risiko)
          }
        )
        antallFerdigVurdert += ferdigVurdertRisikoscenarioUtenTiltak.length
      }

      setAntallFerdigVurdert(antallFerdigVurdert)
    }
  }, [alleRisikoscenario])

  return (
    <FormSummary className='my-3'>
      <FormSummary.Header>
        <FormSummary.Heading level='2'>Vurdér tiltakenes effekt</FormSummary.Heading>
      </FormSummary.Header>
      <FormSummary.Answers>
        <FormSummary.Answer>
          <FormSummary.Value>
            <FormSummary.Answers>
              <FormSummary.Answer>
                <FormSummary.Label id='effektEtterTiltak'>Risikoscenarioer</FormSummary.Label>
                <FormSummary.Value>
                  Det er vurdert totalt sett {antallFerdigVurdert} risikoscenarioer.{' '}
                  <ExternalLink href={risikoscenarioLink + '?tab=risikoscenarioer&filter=alle'}>
                    Se alle risikoscenarioer
                  </ExternalLink>
                  .
                  <br />
                  {savnerVurderingError !== '' && <FormAlert>{savnerVurderingError}</FormAlert>}
                </FormSummary.Value>
              </FormSummary.Answer>
            </FormSummary.Answers>
          </FormSummary.Value>
        </FormSummary.Answer>
      </FormSummary.Answers>
    </FormSummary>
  )
}
export default RisikoscenarioEtterTitak
