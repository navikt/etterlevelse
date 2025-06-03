import { Accordion, Tag } from '@navikt/ds-react'
import { FunctionComponent, RefObject } from 'react'
import { IKravReference, IRisikoscenario } from '../../constants'

type TProps = {
  risikoscenario: IRisikoscenario
  ref?: RefObject<HTMLButtonElement | null>
}

export const RisikoscenarioAccordianHeader: FunctionComponent<TProps> = ({
  risikoscenario,
  ref,
}) => {
  const ferdigVurdert: boolean =
    risikoscenario.konsekvensNivaa !== 0 &&
    risikoscenario.sannsynlighetsNivaa !== 0 &&
    risikoscenario.konsekvensNivaaBegrunnelse !== '' &&
    risikoscenario.sannsynlighetsNivaaBegrunnelse !== '' &&
    risikoscenario.sannsynlighetsNivaaEtterTiltak !== 0 &&
    risikoscenario.konsekvensNivaaEtterTiltak !== 0 &&
    risikoscenario.nivaaBegrunnelseEtterTiltak !== '' &&
    !risikoscenario.ingenTiltak &&
    risikoscenario.tiltakIds.length > 0

  return (
    <Accordion.Header ref={ref}>
      {risikoscenario.navn}
      <div className='flex gap-2 mt-1'>
        {risikoscenario.ingenTiltak && <Tag variant='neutral'>Tiltak ikke aktuelt</Tag>}

        {ferdigVurdert && <Tag variant='alt3'>Ferdig vurdert </Tag>}

        {!ferdigVurdert && !risikoscenario.ingenTiltak && (
          <Tag variant='alt2'>Ikke ferdig vurdert</Tag>
        )}

        {risikoscenario.generelScenario && (
          <Tag className='bg-white' variant='neutral'>
            Øvrig
          </Tag>
        )}
        {risikoscenario.relevanteKravNummer.map((krav: IKravReference, index: number) => (
          <Tag className='bg-white' key={index} variant='neutral'>
            K{krav.kravNummer}.{krav.kravVersjon}
          </Tag>
        ))}
      </div>
    </Accordion.Header>
  )
}

export const IdentifiseringAvRisikoscenarioAccordianHeader: FunctionComponent<TProps> = ({
  risikoscenario,
  ref,
}) => {
  const ikkeFerdigBeskrevet: boolean =
    risikoscenario.konsekvensNivaa === 0 ||
    risikoscenario.sannsynlighetsNivaa === 0 ||
    risikoscenario.konsekvensNivaaBegrunnelse === '' ||
    risikoscenario.sannsynlighetsNivaaBegrunnelse === ''

  return (
    <Accordion.Header className='z-0' ref={ref}>
      {risikoscenario.navn}
      <div className='flex gap-2 mt-1'>
        {ikkeFerdigBeskrevet && <Tag variant='alt2'>Ikke ferdig utfylt</Tag>}
        {risikoscenario.ingenTiltak && <Tag variant='neutral'>Tiltak ikke aktuelt</Tag>}
        {!risikoscenario.ingenTiltak && risikoscenario.tiltakIds.length === 0 && (
          <Tag variant='alt1'>Savner tiltak</Tag>
        )}
      </div>
    </Accordion.Header>
  )
}

export default RisikoscenarioAccordianHeader
