import { TrashIcon } from '@navikt/aksel-icons'
import { BodyLong, Button, List, Modal } from '@navikt/ds-react'
import { FunctionComponent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  tiltakList: ITiltak[]
  setTiltakList: (state: ITiltak[]) => void
}

export const FjernRisikoscenarioFraKrav: FunctionComponent<TProps> = ({
  kravnummer,
  risikoscenario,
  risikoscenarioer,
  setRisikoscenarioer,
  risikoscenarioForKrav,
  setRisikoscenarioForKrav,
  tiltakList,
  setTiltakList,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isPvoAlertModalOpen, setIsPvoAlertModalOpen] = useState<boolean>(false)
  const [connectedKravToRisikoscenario, setConnectedKravToRisikoscenario] = useState<
    IKravReference[]
  >([])
  const [uniqueTiltak, setUniqueTiltak] = useState<ITiltak[]>([])
  const navigate = useNavigate()

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
                await deleteTiltak(tiltakId).then(() => {
                  setTiltakList(tiltakList.filter((tiltak) => tiltak.id !== tiltakId))
                })
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
            navigate(window.location.pathname)
            setIsOpen(false)
          }
        )
      } else {
        await deleteRisikoscenario(risikoscenario.id).then((deleteResponse: IRisikoscenario) => {
          const updatedRisikoscenarioForKrav = risikoscenarioForKrav.filter(
            (risikoscenario: IRisikoscenario) => risikoscenario.id !== deleteResponse.id
          )
          setRisikoscenarioForKrav([...updatedRisikoscenarioForKrav])
          navigate(window.location.pathname)
          setIsOpen(false)
        })
      }
    })
  }

  useEffect(() => {
    if (risikoscenario) {
      setConnectedKravToRisikoscenario(
        risikoscenario.relevanteKravNummer.filter((krav) => krav.kravNummer !== kravnummer)
      )

      setUniqueTiltak(
        tiltakList.filter(
          (tiltak) =>
            tiltak.risikoscenarioIds.length === 1 &&
            tiltak.risikoscenarioIds.includes(risikoscenario.id)
        )
      )
    }
  }, [risikoscenario])

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
            {connectedKravToRisikoscenario.length !== 0 && (
              <div>
                <BodyLong>
                  Dette risikoscenarioet brukes også ved følgende etterlevelseskrav:
                </BodyLong>

                <List>
                  {connectedKravToRisikoscenario.map((krav: IKravReference) => (
                    <List.Item key={`${risikoscenario.id}_${krav.kravNummer}.${krav.kravVersjon}`}>
                      K{krav.kravNummer}.{krav.kravVersjon} {krav.navn}
                    </List.Item>
                  ))}
                </List>

                <BodyLong>
                  Ved å slette scenarioet her, vil dere bare fjerne koblingen. Scenarioet, samt
                  tilhørende tiltak, vil fortsatt være tilknyttet de andre kravene. Scenarioet kan
                  ved behov også slettes derfra.
                </BodyLong>
              </div>
            )}

            {connectedKravToRisikoscenario.length === 0 && uniqueTiltak.length !== 0 && (
              <div>
                <BodyLong className='mb-5'>
                  Dette risikoscenarioet brukes ikke noe annet sted i dokumentasjonen deres.
                </BodyLong>
                <BodyLong>
                  Følgende tiltak er unike for dette risikoscenarioet, og vil også slettes:
                </BodyLong>
                <List>
                  {uniqueTiltak.map((tiltak, index) => (
                    <List.Item key={index + '_' + tiltak.navn}>{tiltak.navn}</List.Item>
                  ))}
                </List>

                <BodyLong>
                  Hvis disse tiltakene er tenkt brukt ved andre scenarioer, koble tiltakene på de
                  scenarioene først, og kom så tilbake og slette scenarioet.
                </BodyLong>
              </div>
            )}

            {connectedKravToRisikoscenario.length === 0 && uniqueTiltak.length === 0 && (
              <div>
                <BodyLong className='mb-5'>
                  Risikoscenarioet slettes helt og blir ikke lenger tilgjengelig i
                  PVK-dokumentasjonen deres.
                </BodyLong>
                <BodyLong>
                  Hvis risikoscenarioet er tenkt brukt andre steder i samme PVK-dokumentasjon, lag
                  den koblingen først, og kom så tilbake og slett scenarioet herfra.
                </BodyLong>
              </div>
            )}
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
