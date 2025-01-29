import { Accordion, Tag } from '@navikt/ds-react'
import { IRisikoscenario } from '../../constants'

interface IProps {
  risikoscenario: IRisikoscenario
}

export const RisikoscenarioAccordianHeader = (props: IProps) => {
  const { risikoscenario } = props
  const WIP_tiltaksListe = []

  const ikkeFerdigBeskrevet =
    risikoscenario.konsekvensNivaa === 0 ||
    risikoscenario.sannsynlighetsNivaa === 0 ||
    risikoscenario.konsekvensNivaaBegrunnelse === '' ||
    risikoscenario.sannsynlighetsNivaaBegrunnelse === ''
  const mangelfulScenario =
    ikkeFerdigBeskrevet || (!risikoscenario.ingenTiltak && WIP_tiltaksListe.length === 0)
  const ikkeFerdigVurdert =
    risikoscenario.sannsynlighetsNivaaEtterTiltak === 0 ||
    risikoscenario.konsekvensNivaaEtterTiltak === 0
  const ferdigVurdert =
    risikoscenario.sannsynlighetsNivaaEtterTiltak !== 0 &&
    risikoscenario.konsekvensNivaaEtterTiltak !== 0

  return (
    <Accordion.Header>
      {risikoscenario.navn}
      <div className="flex gap-2">
        {mangelfulScenario && <Tag variant="alt2">Scenario er mangelfullt </Tag>}
        {risikoscenario.ingenTiltak && <Tag variant="neutral">Tiltak ikke aktuelt</Tag>}
        {!risikoscenario.ingenTiltak && ikkeFerdigVurdert && (
          <Tag variant="alt1">Ikke ferdig vurdert </Tag>
        )}
        {!risikoscenario.ingenTiltak && ferdigVurdert && <Tag variant="info">Ferdig vurdert </Tag>}
      </div>
    </Accordion.Header>
  )
}

export const IdentifiseringAvRisikoscenarioAccordianHeader = (props: IProps) => {
  const { risikoscenario } = props
  const ikkeFerdigBeskrevet =
    risikoscenario.konsekvensNivaa === 0 ||
    risikoscenario.sannsynlighetsNivaa === 0 ||
    risikoscenario.konsekvensNivaaBegrunnelse === '' ||
    risikoscenario.sannsynlighetsNivaaBegrunnelse === ''
  const WIP_tiltaksListe = []

  return (
    <Accordion.Header className="z-0">
      {risikoscenario.navn}
      <div className="flex gap-2">
        {ikkeFerdigBeskrevet && <Tag variant="alt2">Det er felter som ikke er ferdig utfylt</Tag>}
        {risikoscenario.ingenTiltak && <Tag variant="neutral">Tiltak ikke aktuelt</Tag>}
        {!risikoscenario.ingenTiltak && WIP_tiltaksListe.length === 0 && (
          <Tag variant="alt1">Savner tiltak</Tag>
        )}
      </div>
    </Accordion.Header>
  )
}
export default RisikoscenarioAccordianHeader
