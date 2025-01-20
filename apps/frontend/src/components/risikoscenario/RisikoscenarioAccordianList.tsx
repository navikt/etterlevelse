import { Accordion, BodyLong, Button, Modal } from '@navikt/ds-react'
import { RefObject, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IRisikoscenario } from '../../constants'
import RisikoscenarioAccordionContent from './RisikoscenarioAccordianContent'
import RisikoscenarioAccordianHeader from './RisikoscenarioAccordionHeader'

interface IProps {
  risikoscenarioList: IRisikoscenario[]
  setRisikoscenarioList: (state: IRisikoscenario[]) => void
  formRef: RefObject<any>
}

export const RisikoscenarioAccordianList = (props: IProps) => {
  const { risikoscenarioList, setRisikoscenarioList, formRef } = props
  const [isUnsaved, setIsUnsaved] = useState<boolean>(false)
  const [navigateUrl, setNavigateUrl] = useState<string>('')
  const url = new URL(window.location.href)
  const risikoscenarioId = url.searchParams.get('risikoscenario')
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
              <RisikoscenarioAccordianHeader risikoscenario={risikoscenario} />
              <Accordion.Content>
                {expanded && (
                  <RisikoscenarioAccordionContent
                    risikoscenario={risikoscenario}
                    risikoscenarioer={risikoscenarioList}
                    setRisikoscenarioer={setRisikoscenarioList}
                    formRef={formRef}
                  />
                )}
              </Accordion.Content>
            </Accordion.Item>
          )
        })}
      </Accordion>

      <Modal onClose={() => setIsUnsaved(false)} open={isUnsaved} header={{ heading: 'Varsel' }}>
        <Modal.Body>
          <BodyLong>Endringene som er gjort er ikke lagret.</BodyLong>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            onClick={() => {
              formRef.current?.submitForm()
              setIsUnsaved(false)
              navigate(navigateUrl)
            }}
          >
            Lagre og fortsette
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setIsUnsaved(false)
              navigate(navigateUrl)
            }}
          >
            Fortsett uten å lagre
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default RisikoscenarioAccordianList
