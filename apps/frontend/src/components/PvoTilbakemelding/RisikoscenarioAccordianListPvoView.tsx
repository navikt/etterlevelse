import { Accordion, Alert, BodyLong, Heading, ReadMore } from '@navikt/ds-react'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { IRisikoscenario, ITiltak } from '../../constants'
import { IdentifiseringAvRisikoscenarioAccordianHeader } from '../risikoscenario/RisikoscenarioAccordionHeader'
import RisikoscenarioView from '../risikoscenario/RisikoscenarioView'
import TiltakView from '../tiltak/TiltakView'

interface IProps {
  risikoscenarioList: IRisikoscenario[]
  etterlevelseDokumentasjonId: string
  allRisikoscenarioList: IRisikoscenario[]
  tiltakList: ITiltak[]
}

export const RisikoscenarioAccordianListPvoView = (props: IProps) => {
  const { risikoscenarioList, allRisikoscenarioList, tiltakList, etterlevelseDokumentasjonId } =
    props
  const url = new URL(window.location.href)
  const risikoscenarioId = url.searchParams.get('risikoscenario')
  const tiltakId = url.searchParams.get('tiltak')
  const navigate = useNavigate()
  const accordionRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (risikoscenarioId) {
      setTimeout(() => {
        const element = document.getElementById(risikoscenarioId)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })

          if (tiltakId) {
            const tiltakElement = document.getElementById(`${risikoscenarioId}_${tiltakId}`)
            if (tiltakElement) {
              tiltakElement.focus()
              tiltakElement.scrollIntoView({ behavior: 'smooth' })
            }
          }
        }
      }, 200)
    }
  }, [])

  const handleAccordionChange = (risikoscenarioId?: string) => {
    if (risikoscenarioId) {
      navigate(window.location.pathname + '?risikoscenario=' + risikoscenarioId)
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
        {risikoscenarioList.map((risikoscenario, index) => {
          const expanded = risikoscenarioId === risikoscenario.id
          return (
            <Accordion.Item
              id={risikoscenario.id}
              key={index + '_' + risikoscenario.navn}
              open={expanded}
              onOpenChange={(open) => {
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
                      stepUrl='5'
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
                            .filter((tiltak) => risikoscenario.tiltakIds.includes(tiltak.id))
                            .map((tiltak, index) => (
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

export default RisikoscenarioAccordianListPvoView
