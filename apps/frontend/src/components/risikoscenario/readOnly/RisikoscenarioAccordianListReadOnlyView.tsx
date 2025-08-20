import { Accordion, Alert, BodyLong, ReadMore } from '@navikt/ds-react'
import { FunctionComponent, useEffect, useRef } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import { IRisikoscenario, ITiltak } from '../../../constants'
import { risikoscenarioUrl } from '../../common/RouteLinkPvk'
import TiltakView from '../../tiltak/TiltakView'
import { IdentifiseringAvRisikoscenarioAccordianHeader } from '../RisikoscenarioAccordionHeader'
import RisikoscenarioView from '../RisikoscenarioView'
import { RisikoscenarioTiltakHeader } from '../common/KravRisikoscenarioHeaders'

type TProps = {
  risikoscenarioList: IRisikoscenario[]
  etterlevelseDokumentasjonId: string
  allRisikoscenarioList: IRisikoscenario[]
  tiltakList: ITiltak[]
}

export const RisikoscenarioAccordianListReadOnlyView: FunctionComponent<TProps> = ({
  risikoscenarioList,
  allRisikoscenarioList,
  tiltakList,
  etterlevelseDokumentasjonId,
}) => {
  const navigate: NavigateFunction = useNavigate()
  const accordionRef = useRef<HTMLButtonElement>(null)
  const url: URL = new URL(window.location.href)
  const risikoscenarioId: string | null = url.searchParams.get('risikoscenario')
  const tiltakId: string | null = url.searchParams.get('tiltak')

  useEffect(() => {
    if (risikoscenarioId) {
      setTimeout(() => {
        const element: HTMLElement | null = document.getElementById(risikoscenarioId)

        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })

          if (tiltakId) {
            const tiltakElement: HTMLElement | null = document.getElementById(
              `${risikoscenarioId}_${tiltakId}`
            )

            if (tiltakElement) {
              tiltakElement.focus()
              tiltakElement.scrollIntoView({ behavior: 'smooth' })
            }
          }
        }
      }, 200)
    }
  }, [])

  const handleAccordionChange = (risikoscenarioId?: string): void => {
    if (risikoscenarioId) {
      navigate(risikoscenarioUrl(risikoscenarioId))
      setTimeout(() => {
        if (accordionRef.current) {
          window.scrollTo({ top: accordionRef.current.offsetTop - 30, behavior: 'smooth' })
        }
      }, 200)
    } else {
      navigate(window.location.pathname)
    }
  }

  return (
    <div>
      <Accordion>
        {risikoscenarioList.map((risikoscenario: IRisikoscenario, index: number) => {
          const expanded: boolean = risikoscenarioId === risikoscenario.id

          return (
            <Accordion.Item
              id={risikoscenario.id}
              key={`${index}_${risikoscenario.navn}`}
              open={expanded}
              onOpenChange={(open: boolean) => {
                handleAccordionChange(open ? risikoscenario.id : undefined)
              }}
            >
              <IdentifiseringAvRisikoscenarioAccordianHeader
                risikoscenario={risikoscenario}
                ref={expanded ? accordionRef : undefined}
              />
              <Accordion.Content>
                {expanded && (
                  <div>
                    <RisikoscenarioView
                      risikoscenario={risikoscenario}
                      etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
                      stepUrl='6'
                      markdownCopyLinkButton={true}
                    />
                    <div className='mt-12'>
                      <RisikoscenarioTiltakHeader />
                      {risikoscenario.ingenTiltak && <BodyLong>Vi skal ikke ha tiltak.</BodyLong>}

                      {!risikoscenario.ingenTiltak && risikoscenario.tiltakIds.length !== 0 && (
                        <div className='mt-5'>
                          {tiltakList
                            .filter((tiltak: ITiltak) =>
                              risikoscenario.tiltakIds.includes(tiltak.id)
                            )
                            .map((tiltak: ITiltak, index: number) => (
                              <ReadMore
                                key={risikoscenario.id + '_' + tiltak.id + '_' + index}
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
                            Dere må legge inn tiltak under Identifisering av risikoscenarioer og
                            tiltak.
                          </Alert>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Accordion.Content>
            </Accordion.Item>
          )
        })}
      </Accordion>
    </div>
  )
}

export default RisikoscenarioAccordianListReadOnlyView
