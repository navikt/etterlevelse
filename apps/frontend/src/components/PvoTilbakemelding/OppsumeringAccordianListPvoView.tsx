import { Accordion, Alert, BodyLong, Heading, Label, ReadMore } from '@navikt/ds-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IRisikoscenario, ITiltak } from '../../constants'
import RisikoscenarioAccordianHeader from '../risikoscenario/RisikoscenarioAccordionHeader'
import RisikoscenarioTag, {
  getKonsekvenssnivaaText,
  getSannsynlighetsnivaaText,
} from '../risikoscenario/RisikoscenarioTag'
import RisikoscenarioView from '../risikoscenario/RisikoscenarioView'
import TiltakView from '../tiltak/TiltakView'
import { tabValues } from './OppsummeringAvAlleRisikoscenarioerOgTiltakPvoView'

interface IProps {
  risikoscenarioList: IRisikoscenario[]
  allRisikoscenarioList: IRisikoscenario[]
  etterlevelseDokumentasjonId: string
  tiltakList: ITiltak[]
}

export const OppsumeringAccordianListPvoView = (props: IProps) => {
  const { risikoscenarioList, allRisikoscenarioList, etterlevelseDokumentasjonId, tiltakList } =
    props
  const url = new URL(window.location.href)
  const risikoscenarioId = url.searchParams.get('risikoscenario')
  const tabQuery = url.searchParams.get('tab')
  const filterQuery = url.searchParams.get('filter')
  const navigate = useNavigate()

  useEffect(() => {
    if (risikoscenarioId) {
      setTimeout(() => {
        const element = document.getElementById(risikoscenarioId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 200)
    }
  }, [])

  const handleAccordionChange = (risikoscenarioId?: string) => {
    if (risikoscenarioId) {
      navigate(
        `${window.location.pathname}?tab=${tabQuery}&filter=${filterQuery}&risikoscenario=${risikoscenarioId}`
      )
    } else {
      const paramQuery = tabQuery === tabValues.risikoscenarioer ? '&filter=' + filterQuery : ''
      navigate(`${window.location.pathname}?tab=${tabQuery}${paramQuery}`)
    }
  }

  return (
    <div>
      <Accordion>
        {risikoscenarioList.map((risikoscenario, index) => {
          const expanded = risikoscenarioId === risikoscenario.id

          const revurdertEffektCheck =
            risikoscenario.sannsynlighetsNivaaEtterTiltak === 0 ||
            risikoscenario.sannsynlighetsNivaaEtterTiltak === null ||
            risikoscenario.konsekvensNivaaEtterTiltak === 0 ||
            risikoscenario.konsekvensNivaaEtterTiltak === null
          return (
            <Accordion.Item
              id={risikoscenario.id}
              key={index + '_' + risikoscenario.id}
              open={expanded}
              onOpenChange={(open) => {
                handleAccordionChange(open ? risikoscenario.id : undefined)
              }}
            >
              <RisikoscenarioAccordianHeader risikoscenario={risikoscenario} />
              <Accordion.Content>
                <RisikoscenarioView
                  risikoscenario={risikoscenario}
                  etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
                  stepUrl="5"
                />
                <div className="mt-12">
                  <Heading level="3" size="small">
                    Følgende tiltak gjelder for dette risikoscenarioet
                  </Heading>
                  {risikoscenario.ingenTiltak && <BodyLong>Vi skal ikke ha tiltak.</BodyLong>}

                  {!risikoscenario.ingenTiltak && risikoscenario.tiltakIds.length !== 0 && (
                    <div className="mt-5">
                      {tiltakList
                        .filter((tiltak) => risikoscenario.tiltakIds.includes(tiltak.id))
                        .map((tiltak, index) => (
                          <ReadMore
                            key={risikoscenario.id + '_' + tiltak.id + '_' + index}
                            header={tiltak.navn}
                            className="mb-3"
                          >
                            <TiltakView
                              tiltak={tiltak}
                              risikoscenarioList={allRisikoscenarioList}
                            />
                          </ReadMore>
                        ))}
                    </div>
                  )}

                  {!risikoscenario.ingenTiltak && risikoscenario.tiltakIds.length === 0 && (
                    <div className="mt-5">
                      <Alert className="mt-3" variant="warning">
                        Dere må legge inn tiltak under Identifisering av risikoscenarioer og tiltak.
                      </Alert>
                    </div>
                  )}

                  <div className="mt-5">
                    <Label>Antatt risikonivå etter gjennomførte tiltak </Label>

                    {revurdertEffektCheck && (
                      <Alert className="mt-3" variant="warning">
                        Du må vurdere tiltakenes effekt
                      </Alert>
                    )}

                    {!revurdertEffektCheck && (
                      <div className="mt-3">
                        <RisikoscenarioTag
                          level={risikoscenario.sannsynlighetsNivaaEtterTiltak}
                          text={getSannsynlighetsnivaaText(
                            risikoscenario.sannsynlighetsNivaaEtterTiltak
                          )}
                        />

                        <div className="mt-3">
                          <RisikoscenarioTag
                            level={risikoscenario.konsekvensNivaaEtterTiltak}
                            text={getKonsekvenssnivaaText(
                              risikoscenario.konsekvensNivaaEtterTiltak
                            )}
                          />
                        </div>
                        <BodyLong className="mt-3">
                          {risikoscenario.nivaaBegrunnelseEtterTiltak}
                        </BodyLong>
                      </div>
                    )}
                  </div>
                </div>
              </Accordion.Content>
            </Accordion.Item>
          )
        })}
      </Accordion>
    </div>
  )
}
export default OppsumeringAccordianListPvoView
