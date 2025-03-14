import {LinkIcon} from '@navikt/aksel-icons'
import {BodyLong, CopyButton, List, ReadMore} from '@navikt/ds-react'
import {useParams} from 'react-router'
import {IRisikoscenario} from '../../constants'
import {ExternalLink} from '../common/RouteLink'
import RisikoscenarioTag, {
  getKonsekvenssnivaaText,
  getSannsynlighetsnivaaText,
} from './RisikoscenarioTag'

interface IProps {
  risikoscenario: IRisikoscenario
  noCopyButton?: boolean
}

export const RisikoscenarioViewReadOnly = (props: IProps) => {
  const {risikoscenario, noCopyButton} = props
  const params = useParams<{ id?: string }>()
  return (
    <div>
      {!noCopyButton && (
        <CopyButton
          variant="action"
          copyText={window.location.href}
          text="Kopiér scenariolenke"
          activeText="Lenken er kopiert"
          icon={<LinkIcon aria-hidden/>}
        />
      )}
      <BodyLong className="mt-5">{risikoscenario.beskrivelse}</BodyLong>

      {risikoscenario.generelScenario && (
        <BodyLong className="mt-8">
          Dette risikoscenarioet er ikke tilknyttet spesifikke etterlevelseskrav.
        </BodyLong>
      )}

      {!risikoscenario.generelScenario && (
        <ReadMore header="Vis etterlevelseskrav hvor risikoscenarioet inntreffer">
          <List as="ul">
            {risikoscenario.relevanteKravNummer.map((relevantKrav, index) => {
              const kravHref = `/dokumentasjon/${params.id}/${relevantKrav.temaCode || 'PVK'}/RELEVANTE_KRAV/krav/${relevantKrav.kravNummer}/${relevantKrav.kravVersjon}`
              return (
                <List.Item className="max-w-[75ch]" key={relevantKrav.kravNummer + '_' + index}>
                  <ExternalLink href={kravHref}>
                    K{relevantKrav.kravNummer}.{relevantKrav.kravVersjon} {relevantKrav.navn}
                  </ExternalLink>
                </List.Item>
              )
            })}
          </List>
        </ReadMore>
      )}

      {risikoscenario.sannsynlighetsNivaa !== 0 && (
        <div className="mt-12">
          <RisikoscenarioTag
            level={risikoscenario.sannsynlighetsNivaa}
            text={getSannsynlighetsnivaaText(risikoscenario.sannsynlighetsNivaa)}
          />
        </div>
      )}

      {risikoscenario.sannsynlighetsNivaaBegrunnelse && (
        <BodyLong className="mt-5">{risikoscenario.sannsynlighetsNivaaBegrunnelse}</BodyLong>
      )}

      {risikoscenario.konsekvensNivaa !== 0 && (
        <div className="mt-12">
          <RisikoscenarioTag
            level={risikoscenario.konsekvensNivaa}
            text={getKonsekvenssnivaaText(risikoscenario.konsekvensNivaa)}
          />
        </div>
      )}

      {risikoscenario.konsekvensNivaaBegrunnelse && (
        <BodyLong className="mt-5">{risikoscenario.konsekvensNivaaBegrunnelse}</BodyLong>
      )}
    </div>
  )
}
export default RisikoscenarioViewReadOnly
