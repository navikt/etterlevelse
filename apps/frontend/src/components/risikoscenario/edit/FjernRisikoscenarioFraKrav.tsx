import { TrashIcon } from '@navikt/aksel-icons'
import { Button, Heading, List, Modal } from '@navikt/ds-react'
import { FunctionComponent, useState } from 'react'
import { getPvkDokument } from '../../../api/PvkDokumentApi'
import {
  deleteRisikoscenario,
  fjernKravFraRisikoscenario,
  getRisikoscenario,
  removeTiltakToRisikoscenario,
} from '../../../api/RisikoscenarioApi'
import { deleteTiltak, getTiltak } from '../../../api/TiltakApi'
import { IKravReference, IRisikoscenario, ITiltak } from '../../../constants'
import AlertPvoUnderarbeidModal from '../../PvkDokument/common/AlertPvoUnderarbeidModal'
import { isReadOnlyPvkStatus } from '../../PvkDokument/common/util'

type TProps = {
  kravnummer: number
  risikoscenario: IRisikoscenario
  risikoscenarioer: IRisikoscenario[]
  setRisikoscenarioer: (state: IRisikoscenario[]) => void
  risikoscenarioForKrav: IRisikoscenario[]
  setRisikoscenarioForKrav: (state: IRisikoscenario[]) => void
}

export const FjernRisikoscenarioFraKrav: FunctionComponent<TProps> = ({
  kravnummer,
  risikoscenario,
  risikoscenarioer,
  setRisikoscenarioer,
  risikoscenarioForKrav,
  setRisikoscenarioForKrav,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isPvoAlertModalOpen, setIsPvoAlertModalOpen] = useState<boolean>(false)

  const activateFormButton = async (runFunction: () => void) => {
    await getPvkDokument(risikoscenario.pvkDokumentId).then((response) => {
      if (isReadOnlyPvkStatus(response.status)) {
        setIsPvoAlertModalOpen(true)
      } else {
        runFunction()
      }
    })
  }
  const submit = async (): Promise<void> => {
    getRisikoscenario(risikoscenario.id).then(async (response: IRisikoscenario) => {
      const relevanteKravNummer: IKravReference[] = response.relevanteKravNummer

      if (response.tiltakIds.length > 0) {
        for await (const tiltakId of response.tiltakIds) {
          await getTiltak(tiltakId).then(async (tiltakResponse: ITiltak) => {
            await removeTiltakToRisikoscenario(risikoscenario.id, tiltakId).then(async () => {
              if (tiltakResponse.risikoscenarioIds.length === 1) {
                await deleteTiltak(tiltakId)
              }
            })
          })
        }
      }

      if (relevanteKravNummer.length > 1) {
        await fjernKravFraRisikoscenario(risikoscenario.id, kravnummer).then(
          (deleteResponse: IRisikoscenario) => {
            const updatedRisikoscenarioForKrav: IRisikoscenario[] = risikoscenarioForKrav.filter(
              (risikoscenario: IRisikoscenario) => risikoscenario.id !== deleteResponse.id
            )
            setRisikoscenarioForKrav([...updatedRisikoscenarioForKrav])
            setRisikoscenarioer([...risikoscenarioer, deleteResponse])
            setIsOpen(false)
          }
        )
      } else {
        await deleteRisikoscenario(risikoscenario.id).then((deleteResponse: IRisikoscenario) => {
          const updatedRisikoscenarioForKrav = risikoscenarioForKrav.filter(
            (risikoscenario: IRisikoscenario) => risikoscenario.id !== deleteResponse.id
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
        type='button'
        variant='tertiary'
        onClick={async () => await activateFormButton(() => setIsOpen(true))}
        icon={<TrashIcon aria-hidden title='' />}
      >
        Slett risikoscenario
      </Button>

      {isOpen && (
        <Modal
          header={{
            heading: 'Vil dere slette dette risikoscenarioet?',
          }}
          open={isOpen}
          onClose={() => setIsOpen(false)}
        >
          <Modal.Body>
            {risikoscenario.relevanteKravNummer.length > 0 && (
              <List>
                <Heading size='medium'>
                  Dette risikoscenarioet brukes også ved følgende etterlevelseskrav:
                </Heading>
                {risikoscenario.relevanteKravNummer.map((krav: IKravReference) => (
                  <List.Item key={`${risikoscenario.id}_${krav.kravNummer}.${krav.kravVersjon}`}>
                    K{krav.kravNummer}.{krav.kravVersjon} {krav.navn}
                  </List.Item>
                ))}
              </List>
            )}
            Ved å slette scenarioet her, vil dere bare fjerne koblingen. Scenarioet, samt tilhørende
            tiltak, vil fortsatt være tilknyttet de andre kravene. Scenarioet kan ved behov også
            slettes derfra.
          </Modal.Body>
          <Modal.Footer>
            <Button type='button' onClick={() => submit()}>
              Ja, slett risikoscenarioet
            </Button>
            <Button type='button' variant='secondary' onClick={() => setIsOpen(false)}>
              Avbryt
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {isPvoAlertModalOpen && (
        <AlertPvoUnderarbeidModal
          isOpen={isPvoAlertModalOpen}
          onClose={() => setIsPvoAlertModalOpen(false)}
          pvkDokumentId={risikoscenario.pvkDokumentId}
        />
      )}
    </div>
  )
}
export default FjernRisikoscenarioFraKrav
