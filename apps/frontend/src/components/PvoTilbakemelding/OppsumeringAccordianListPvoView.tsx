import { Accordion, Alert, BodyLong, Heading, Label, ReadMore } from '@navikt/ds-react'
import { FunctionComponent, RefObject, useEffect, useRef } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import { IRisikoscenario, ITiltak } from '../../constants'
import {
  pvkDokumentasjonTabFilterRisikoscenarioUrl,
  pvkDokumentasjonTabFilterUrl,
} from '../common/RouteLinkPvk'
import RisikoscenarioAccordianHeader from '../risikoscenario/RisikoscenarioAccordionHeader'
import RisikoscenarioTag, {
  getKonsekvenssnivaaText,
  getSannsynlighetsnivaaText,
} from '../risikoscenario/RisikoscenarioTag'
import RisikoscenarioView from '../risikoscenario/RisikoscenarioView'
import TiltakView from '../tiltak/TiltakView'
import { tabValues } from './OppsummeringAvAlleRisikoscenarioerOgTiltakPvoView'

type TProps = {
  risikoscenarioList: IRisikoscenario[]
  allRisikoscenarioList: IRisikoscenario[]
  etterlevelseDokumentasjonId: string
  tiltakList: ITiltak[]
}

export const OppsumeringAccordianListPvoView: FunctionComponent<TProps> = ({
  risikoscenarioList,
  allRisikoscenarioList,
  etterlevelseDokumentasjonId,
  tiltakList,
}) => {
  const navigate: NavigateFunction = useNavigate()
  const accordionRef: RefObject<HTMLButtonElement | null> = useRef<HTMLButtonElement>(null)
  const url: URL = new URL(window.location.href)

  const risikoscenarioId: string | null = url.searchParams.get('risikoscenario')
  const tabQuery: string | null = url.searchParams.get('tab')
  const filterQuery: string | null = url.searchParams.get('filter')

  useEffect(() => {
    if (risikoscenarioId) {
      setTimeout(() => {
        const element: HTMLElement | null = document.getElementById(risikoscenarioId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 200)
    }
  }, [])

  const handleAccordionChange = (risikoscenarioId?: string): void => {
    if (risikoscenarioId) {
      navigate(pvkDokumentasjonTabFilterRisikoscenarioUrl(tabQuery, filterQuery, risikoscenarioId))
      setTimeout(() => {
        if (accordionRef.current) {
          window.scrollTo({ top: accordionRef.current.offsetTop - 30, behavior: 'smooth' })
        }
      }, 200)
    } else {
      navigate(pvkDokumentasjonTabFilterUrl(tabQuery, filterQuery, tabValues.risikoscenarioer))
    }
  }

  return (
    <div>
      <Accordion>
        {risikoscenarioList.map((risikoscenario: IRisikoscenario, index: number) => {
          const expanded = risikoscenarioId === risikoscenario.id

          const revurdertEffektCheck =
            risikoscenario.sannsynlighetsNivaaEtterTiltak === 0 ||
            risikoscenario.sannsynlighetsNivaaEtterTiltak === null ||
            risikoscenario.konsekvensNivaaEtterTiltak === 0 ||
            risikoscenario.konsekvensNivaaEtterTiltak === null
          return (
            <Accordion.Item
              id={risikoscenario.id}
              key={`${index}_${risikoscenario.id}`}
              open={expanded}
              onOpenChange={(open) => {
                handleAccordionChange(open ? risikoscenario.id : undefined)
              }}
            >
              <RisikoscenarioAccordianHeader
                risikoscenario={risikoscenario}
                ref={expanded ? accordionRef : undefined}
              />
              <Accordion.Content>
                <RisikoscenarioView
                  risikoscenario={risikoscenario}
                  etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
                  stepUrl='6'
                  markdownCopyLinkButton={true}
                />
                <div className='mt-12'>
                  <Heading level='3' size='small'>
                    Følgende tiltak gjelder for dette risikoscenarioet
                  </Heading>
                  {risikoscenario.ingenTiltak && <BodyLong>Vi skal ikke ha tiltak.</BodyLong>}

                  {!risikoscenario.ingenTiltak && risikoscenario.tiltakIds.length !== 0 && (
                    <div className='mt-5'>
                      {tiltakList
                        .filter((tiltak: ITiltak) => risikoscenario.tiltakIds.includes(tiltak.id))
                        .map((tiltak: ITiltak, index: number) => (
                          <ReadMore
                            key={`${risikoscenario.id}_${tiltak.id}_${index}`}
                            header={tiltak.navn}
                            className='mb-3'
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
                    <div className='mt-5'>
                      <Alert className='mt-3' variant='warning'>
                        Dere må legge inn tiltak under Identifisering av risikoscenarioer og tiltak.
                      </Alert>
                    </div>
                  )}

                  <div className='mt-5'>
                    <Label>Antatt risikonivå etter gjennomførte tiltak </Label>

                    {revurdertEffektCheck && (
                      <Alert className='mt-3' variant='warning'>
                        Du må vurdere tiltakenes effekt
                      </Alert>
                    )}

                    {!revurdertEffektCheck && (
                      <div className='mt-3'>
                        <RisikoscenarioTag
                          level={risikoscenario.sannsynlighetsNivaaEtterTiltak}
                          text={getSannsynlighetsnivaaText(
                            risikoscenario.sannsynlighetsNivaaEtterTiltak
                          )}
                        />

                        <div className='mt-3'>
                          <RisikoscenarioTag
                            level={risikoscenario.konsekvensNivaaEtterTiltak}
                            text={getKonsekvenssnivaaText(
                              risikoscenario.konsekvensNivaaEtterTiltak
                            )}
                          />
                        </div>
                        <BodyLong className='mt-3'>
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
