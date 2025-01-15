import { TrashIcon } from '@navikt/aksel-icons'
import { Button, Modal } from '@navikt/ds-react'
import { useState } from 'react'
import { deleteRisikoscenario } from '../../api/RisikoscenarioApi'
import { IRisikoscenario } from '../../constants'

interface IProps {
  risikoscenarioId: string
  risikoscenarioer?: IRisikoscenario[]
  setRisikoscenarioer?: (state: IRisikoscenario[]) => void
}

export const SlettOvrigRisikoscenario = (props: IProps) => {
  const { risikoscenarioId, risikoscenarioer, setRisikoscenarioer } = props
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const submit = async () => {
    deleteRisikoscenario(risikoscenarioId).then((response) => {
      if (risikoscenarioer && setRisikoscenarioer) {
        const updatedRisikoscenarioForKrav = risikoscenarioer.filter(
          (risikoscenario) => risikoscenario.id !== response.id
        )

        setRisikoscenarioer([...updatedRisikoscenarioForKrav])
      }
      setIsOpen(false)
    })
  }

  return (
    <div>
      <Button
        type="button"
        variant="tertiary"
        onClick={() => setIsOpen(true)}
        icon={<TrashIcon aria-hidden title="" />}
      >
        Slett risikoscenario
      </Button>

      {isOpen && (
        <Modal
          width="medium"
          header={{ heading: 'Vil dere slette dette risikoscenarioet?' }}
          open={isOpen}
          onClose={() => setIsOpen(false)}
        >
          <Modal.Body>
            Risikoscenarioet slettes helt og blir ikke lenger tilgjengelig i PVK-dokumentasjonen
            deres.
            <br />
            <br />
            Hvis risikoscenarioet er tenkt brukt andre steder i samme PVK-dokumentasjon, lag den
            koblingen først, og kom så tilbake og slett scenarioet herfra.
          </Modal.Body>
          <Modal.Footer>
            <Button type="button" onClick={() => submit()}>
              Slett risikoscenario
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
              avbryt
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  )
}
export default SlettOvrigRisikoscenario
