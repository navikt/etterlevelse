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
  risikoscenarioId: string
  risikoscenarioer: IRisikoscenario[]
  setRisikoscenarioer: (state: IRisikoscenario[]) => void
  risikoscenarioForKrav: IRisikoscenario[]
  setRisikoscenerioForKrav: (state: IRisikoscenario[]) => void
}

export const FjernRisikoscenarioFraKrav = (props: IProps) => {
  const {
    kravnummer,
    risikoscenarioId,
    risikoscenarioer,
    setRisikoscenarioer,
    risikoscenarioForKrav,
    setRisikoscenerioForKrav,
  } = props
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const submit = async () => {
    getRisikoscenario(risikoscenarioId).then((response) => {
      const relevanteKravNummer = response.relevanteKravNummer
      if (relevanteKravNummer.length > 1) {
        fjernKravFraRisikoscenario(risikoscenarioId, kravnummer).then((deleteResponse) => {
          const updatedRisikoscenarioForKrav = risikoscenarioForKrav.filter(
            (risikoscenario) => risikoscenario.id !== deleteResponse.id
          )
          setRisikoscenerioForKrav([...updatedRisikoscenarioForKrav])
          setRisikoscenarioer([...risikoscenarioer, deleteResponse])
          setIsOpen(false)
        })
      } else {
        deleteRisikoscenario(risikoscenarioId).then((deleteResponse) => {
          const updatedRisikoscenarioForKrav = risikoscenarioForKrav.filter(
            (risikoscenario) => risikoscenario.id !== deleteResponse.id
          )
          setRisikoscenerioForKrav([...updatedRisikoscenarioForKrav])
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
        Fjern krav
      </Button>

      {isOpen && (
        <Modal
          header={{ heading: 'Fjern kravet fra risikoscenario' }}
          open={isOpen}
          onClose={() => setIsOpen(false)}
        >
          <Modal.Body>Er du sikkert på at du vil fjerne kravet fra risikoscenario?</Modal.Body>
          <Modal.Footer>
            <Button type="button" onClick={() => submit()}>
              ja, fjern kravet
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
