import { TrashIcon } from '@navikt/aksel-icons'
import { Button, Modal } from '@navikt/ds-react'
import { useState } from 'react'
import {
  deleteRisikoscenario,
  fjernKravFraRisikoscenario,
  getRisikoscenario,
} from '../../../api/RisikoscenarioApi'
import { IRisikoscenario } from '../../../constants'

interface IProps {
  kravnummer: number
  risikoscenario: IRisikoscenario
  risikoscenarioer: IRisikoscenario[]
  setRisikoscenarioer: (state: IRisikoscenario[]) => void
  risikoscenarioForKrav: IRisikoscenario[]
  setRisikoscenarioForKrav: (state: IRisikoscenario[]) => void
}

export const FjernRisikoscenarioFraKrav = (props: IProps) => {
  const {
    kravnummer,
    risikoscenario,
    risikoscenarioer,
    setRisikoscenarioer,
    risikoscenarioForKrav,
    setRisikoscenarioForKrav,
  } = props
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const submit = async () => {
    getRisikoscenario(risikoscenario.id).then((response) => {
      const relevanteKravNummer = response.relevanteKravNummer
      if (relevanteKravNummer.length > 1) {
        fjernKravFraRisikoscenario(risikoscenario.id, kravnummer).then((deleteResponse) => {
          const updatedRisikoscenarioForKrav = risikoscenarioForKrav.filter(
            (risikoscenario) => risikoscenario.id !== deleteResponse.id
          )
          setRisikoscenarioForKrav([...updatedRisikoscenarioForKrav])
          setRisikoscenarioer([...risikoscenarioer, deleteResponse])
          setIsOpen(false)
        })
      } else {
        deleteRisikoscenario(risikoscenario.id).then((deleteResponse) => {
          const updatedRisikoscenarioForKrav = risikoscenarioForKrav.filter(
            (risikoscenario) => risikoscenario.id !== deleteResponse.id
          )
          setRisikoscenarioForKrav([...updatedRisikoscenarioForKrav])
          setIsOpen(false)
        })
      }
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
          header={{
            heading: 'Slett risikoscenarioe',
          }}
          open={isOpen}
          onClose={() => setIsOpen(false)}
        >
          <Modal.Body>Er du sikkert på at du vil slette risikoscenarioet?</Modal.Body>
          <Modal.Footer>
            <Button type="button" onClick={() => submit()}>
              ja, slett risikoscenarioet
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
export default FjernRisikoscenarioFraKrav
