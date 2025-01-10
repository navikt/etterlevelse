import { TrashIcon } from '@navikt/aksel-icons'
import { Button, Modal } from '@navikt/ds-react'
import { useState } from 'react'
import { deleteRisikoscenario } from '../../../api/RisikoscenarioApi'
import { IRisikoscenario } from '../../../constants'

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
        Fjern krav
      </Button>

      {isOpen && (
        <Modal
          header={{ heading: 'Fjern kravet fra risikoscenario' }}
          open={isOpen}
          onClose={() => setIsOpen(false)}
        >
          <Modal.Body>Er du sikkert på at du vil slette risikoscenarioet?</Modal.Body>
          <Modal.Footer>
            <Button type="button" onClick={() => submit()}>
              ja, slett risikoscenario
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
