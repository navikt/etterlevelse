'use client'

import { ExternalLink } from '@/components/common/externalLink/externalLink'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { risikoscenarioFilterAlleUrl } from '@/routes/risikoscenario/risikoscenarioRoutes'
import { risikoscenarioFieldCheck } from '@/util/risikoscenario/risikoscenarioUtils'
import { FormSummary } from '@navikt/ds-react'
import { usePathname } from 'next/navigation'
import { FunctionComponent, useEffect, useState } from 'react'
import FormAlert from './formAlert'

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
  const pathName = usePathname()
  const risikoscenarioLink = `${pathName}?steg=${customStepNumber ? customStepNumber : 7}`

  useEffect(() => {
    if (alleRisikoscenario.length !== 0) {
      let antallFerdigVurdert = 0

      const risikoscenarioMedIngenTiltak: IRisikoscenario[] = alleRisikoscenario.filter(
        (risiko: IRisikoscenario) => risiko.ingenTiltak
      )
      const risikoscenarioMedTiltak: IRisikoscenario[] = alleRisikoscenario.filter(
        (risiko: IRisikoscenario) => !risiko.ingenTiltak
      )
      if (risikoscenarioMedTiltak.length !== 0) {
        const ferdigVurdertRisikoscenarioMedTiltak: IRisikoscenario[] =
          risikoscenarioMedTiltak.filter(
            (risiko: IRisikoscenario) =>
              risiko.tiltakIds.length !== 0 &&
              risiko.sannsynlighetsNivaaEtterTiltak !== 0 &&
              risiko.konsekvensNivaaEtterTiltak !== 0 &&
              risiko.nivaaBegrunnelseEtterTiltak !== ''
          )
        antallFerdigVurdert += ferdigVurdertRisikoscenarioMedTiltak.length
      }
      if (risikoscenarioMedIngenTiltak.length !== 0) {
        const ferdigVurdertRisikoscenarioUtenTiltak = risikoscenarioMedIngenTiltak.filter(
          (risiko: IRisikoscenario) => {
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
        <FormSummary.Heading level='2'>Vurder tiltakenes effekt</FormSummary.Heading>
      </FormSummary.Header>
      <FormSummary.Answers>
        <FormSummary.Answer>
          <FormSummary.Value>
            <FormSummary.Answers>
              <FormSummary.Answer>
                <FormSummary.Label id='effektEtterTiltak'>Vurderinger</FormSummary.Label>
                <FormSummary.Value>
                  Det er vurdert totalt sett {antallFerdigVurdert} risikoscenarioer.{' '}
                  <ExternalLink href={`${risikoscenarioLink}${risikoscenarioFilterAlleUrl()}`}>
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
