import { Accordion, Tag } from '@navikt/ds-react'
import { IRisikoscenario } from '../../constants'
import RisikoscenarioTag, {
  getKonsekvenssnivaaText,
  getSannsynlighetsnivaaText,
} from './RisikoscenarioTag'

interface IProps {
  risikoscenario: IRisikoscenario
}

export const RisikoscenarioAccordianHeader = (props: IProps) => {
  const { risikoscenario } = props
  const ikkeFerdigBeskrevet =
    risikoscenario.konsekvensNivaa === 0 ||
    risikoscenario.sannsynlighetsNivaa === 0 ||
    risikoscenario.konsekvensNivaaBegrunnelse === '' ||
    risikoscenario.sannsynlighetsNivaaBegrunnelse === ''
  const WIP_tiltaksListe = []

  return (
    <Accordion.Header>
      {risikoscenario.navn}
      <div className="flex gap-2">
        {ikkeFerdigBeskrevet && <Tag variant="alt2">Det er felter som ikke er ferdig utfylt</Tag>}
        {risikoscenario.ingenTiltak && <Tag variant="neutral">Tiltak ikke aktuelt</Tag>}
        {!risikoscenario.ingenTiltak && WIP_tiltaksListe.length === 0 && (
          <Tag variant="alt1">Savner tiltak</Tag>
        )}
        {!ikkeFerdigBeskrevet && (
          <RisikoscenarioTag
            level={risikoscenario.konsekvensNivaa}
            text={getKonsekvenssnivaaText(risikoscenario.konsekvensNivaa)}
          />
        )}
        {!ikkeFerdigBeskrevet && (
          <RisikoscenarioTag
            level={risikoscenario.sannsynlighetsNivaa}
            text={getSannsynlighetsnivaaText(risikoscenario.sannsynlighetsNivaa)}
          />
        )}
      </div>
    </Accordion.Header>
  )
}
export default RisikoscenarioAccordianHeader
