import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { IKravReference } from '@/constants/krav/kravConstants'
import { IVurdering } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { Accordion, Tag } from '@navikt/ds-react'
import moment from 'moment'
import { FunctionComponent, RefObject } from 'react'
import NyttInnholdTag from './NyttInnholdTag'

type TProps = {
  risikoscenario: IRisikoscenario
  ref?: RefObject<HTMLButtonElement | null>
  previousVurdering?: IVurdering
}

export const RisikoscenarioAccordianHeader: FunctionComponent<TProps> = ({
  risikoscenario,
  ref,
}) => {
  const ferdigVurdert: boolean =
    risikoscenario.sannsynlighetsNivaaEtterTiltak !== 0 &&
    risikoscenario.konsekvensNivaaEtterTiltak !== 0 &&
    risikoscenario.nivaaBegrunnelseEtterTiltak !== '' &&
    !risikoscenario.ingenTiltak &&
    risikoscenario.tiltakIds.length > 0

  const ferdigBeskrevet: boolean =
    risikoscenario.konsekvensNivaa !== 0 &&
    risikoscenario.sannsynlighetsNivaa !== 0 &&
    risikoscenario.konsekvensNivaaBegrunnelse !== '' &&
    risikoscenario.sannsynlighetsNivaaBegrunnelse !== ''

  return (
    <Accordion.Header ref={ref}>
      {risikoscenario.navn}
      <div className='flex gap-2 mt-1'>
        {risikoscenario.ingenTiltak && <Tag variant='neutral'>Tiltak ikke aktuelt</Tag>}

        {!ferdigBeskrevet && <Tag variant='alt1'>Risikoscenarioet er mangelfullt</Tag>}

        {ferdigBeskrevet && ferdigVurdert && <Tag variant='alt3'>Ferdig vurdert </Tag>}

        {ferdigBeskrevet && !ferdigVurdert && !risikoscenario.ingenTiltak && (
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
  previousVurdering,
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
        {previousVurdering &&
          moment(risikoscenario.changeStamp.lastModifiedDate).isAfter(
            previousVurdering?.sendtDato
          ) && <NyttInnholdTag />}
      </div>
    </Accordion.Header>
  )
}

export default RisikoscenarioAccordianHeader
