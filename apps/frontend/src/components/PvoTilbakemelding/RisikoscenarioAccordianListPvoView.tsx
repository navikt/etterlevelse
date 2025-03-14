import { Accordion, Alert, BodyLong, Heading, ReadMore } from '@navikt/ds-react'
import { RefObject, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IRisikoscenario, ITiltak } from '../../constants'
import AccordianAlertModal from '../risikoscenario/AccordianAlertModal'
import { IdentifiseringAvRisikoscenarioAccordianHeader } from '../risikoscenario/RisikoscenarioAccordionHeader'
import RisikoscenarioView from '../risikoscenario/RisikoscenarioView'
import TiltakView from '../tiltak/TiltakView'

interface IProps {
  risikoscenarioList: IRisikoscenario[]
  allRisikoscenarioList: IRisikoscenario[]
  tiltakList: ITiltak[]
  formRef: RefObject<any>
}

export const RisikoscenarioAccordianListPvoView = (props: IProps) => {
  const { risikoscenarioList, allRisikoscenarioList, tiltakList, formRef } = props
  const [isUnsaved, setIsUnsaved] = useState<boolean>(false)
  const [navigateUrl, setNavigateUrl] = useState<string>('')
  const url = new URL(window.location.href)
  const risikoscenarioId = url.searchParams.get('risikoscenario')
  const tiltakId = url.searchParams.get('tiltak')
  const navigate = useNavigate()

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
      setNavigateUrl(window.location.pathname + '?risikoscenario=' + risikoscenarioId)
      if (formRef.current?.dirty) {
        setIsUnsaved(true)
      } else {
        navigate(window.location.pathname + '?risikoscenario=' + risikoscenarioId)
      }
    } else {
      setNavigateUrl(window.location.pathname)
      if (formRef.current?.dirty) {
        setIsUnsaved(true)
      } else {
        navigate(window.location.pathname)
      }
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
              <IdentifiseringAvRisikoscenarioAccordianHeader risikoscenario={risikoscenario} />
              <Accordion.Content>
                {expanded && (
                  <div>
                    <RisikoscenarioView risikoscenario={risikoscenario} />
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

      <AccordianAlertModal
        isOpen={isUnsaved}
        setIsOpen={setIsUnsaved}
        navigateUrl={navigateUrl}
        formRef={formRef}
      />
    </div>
  )
}

export default RisikoscenarioAccordianListPvoView
