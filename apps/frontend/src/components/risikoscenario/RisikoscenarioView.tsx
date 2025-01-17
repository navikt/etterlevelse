import { LinkIcon } from '@navikt/aksel-icons'
import { BodyLong, CopyButton } from '@navikt/ds-react'
import { IRisikoscenario } from '../../constants'
import RisikoscenarioTag, {
  getKonsekvenssnivaaText,
  getSannsynlighetsnivaaText,
} from './RisikoscenarioTag'

interface IProps {
  risikoscenario: IRisikoscenario
  currentUrl: string
  noCopyButton?: boolean
}

export const RisikoscenarioView = (props: IProps) => {
  const { risikoscenario, currentUrl, noCopyButton } = props
  return (
    <div>
      {!noCopyButton && (
        <CopyButton
          variant="action"
          copyText={currentUrl + '#' + risikoscenario.id}
          text="Kopiér scenariolenke"
          activeText="Lenken er kopiert"
          icon={<LinkIcon aria-hidden />}
        />
      )}
      <BodyLong className="mt-5">{risikoscenario.beskrivelse}</BodyLong>
      <BodyLong className="mt-5">
        Dette risikoscenarioet er ikke tilknyttet spesifikke etterlevelseskrav.
      </BodyLong>

      <div className="mt-5">
        <RisikoscenarioTag
          level={risikoscenario.sannsynlighetsNivaa}
          text={getSannsynlighetsnivaaText(risikoscenario.sannsynlighetsNivaa)}
        />
      </div>

      {!risikoscenario.sannsynlighetsNivaaBegrunnelse && (
        <BodyLong className="mt-5">Ingen begrunnelse skrevet for sannsylighetsnivå</BodyLong>
      )}
      {risikoscenario.sannsynlighetsNivaaBegrunnelse && (
        <BodyLong className="mt-5">{risikoscenario.sannsynlighetsNivaaBegrunnelse}</BodyLong>
      )}

      <div className="mt-5">
        <RisikoscenarioTag
          level={risikoscenario.konsekvensNivaa}
          text={getKonsekvenssnivaaText(risikoscenario.konsekvensNivaa)}
        />
      </div>

      {!risikoscenario.konsekvensNivaaBegrunnelse && (
        <BodyLong className="mt-5">Ingen begrunnelse skrevet for konsekvensnivå</BodyLong>
      )}
      {risikoscenario.konsekvensNivaaBegrunnelse && (
        <BodyLong className="mt-5">{risikoscenario.konsekvensNivaaBegrunnelse}</BodyLong>
      )}
    </div>
  )
}
export default RisikoscenarioView
