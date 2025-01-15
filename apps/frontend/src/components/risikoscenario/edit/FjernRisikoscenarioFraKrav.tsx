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
  setRisikoscenerioForKrav: (state: IRisikoscenario[]) => void
}

export const FjernRisikoscenarioFraKrav = (props: IProps) => {
  const {
    kravnummer,
    risikoscenario,
    risikoscenarioer,
    setRisikoscenarioer,
    risikoscenarioForKrav,
    setRisikoscenerioForKrav,
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
          setRisikoscenerioForKrav([...updatedRisikoscenarioForKrav])
          setRisikoscenarioer([...risikoscenarioer, deleteResponse])
          setIsOpen(false)
        })
      } else {
        deleteRisikoscenario(risikoscenario.id).then((deleteResponse) => {
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
        {risikoscenario.relevanteKravNummer.length > 1
          ? 'Fjern risikoscenario fra krav'
          : 'Slett risikoscenario'}
      </Button>

      {isOpen && (
        <Modal
          header={{
            heading:
              risikoscenario.relevanteKravNummer.length > 1
                ? 'Fjerne kravet fra risikoscenario'
                : 'Slett risikoscenarioet',
          }}
          open={isOpen}
          onClose={() => setIsOpen(false)}
        >
          <Modal.Body>
            {risikoscenario.relevanteKravNummer.length > 1
              ? 'Er du sikkert på at du vil fjerne kravet fra risikoscenario?'
              : 'Er du sikkert på at du vil slette risikoscenarioet?'}
          </Modal.Body>
          <Modal.Footer>
            <Button type="button" onClick={() => submit()}>
              {risikoscenario.relevanteKravNummer.length > 1
                ? 'ja, fjern kravet fra risikoscenario'
                : 'ja, slett risikoscenarioet'}
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
