'use client'

import { removeTiltakToRisikoscenario } from '@/api/risikoscenario/risikoscenarioApi'
import { deleteTiltak, getTiltak } from '@/api/tiltak/tiltakApi'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { risikoscenarioUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { BodyLong, Button, List, Modal } from '@navikt/ds-react'
import { useRouter } from 'next/navigation'
import { FunctionComponent, SetStateAction } from 'react'

type TProps = {
  tiltak: ITiltak
  risikoscenario: IRisikoscenario
  isDeleteModalOpen: boolean
  setIsDeleteModalOpen: (value: SetStateAction<boolean>) => void
  risikoscenarioerConnectedToTiltak: string[]
  setRisikoscenario: (state: IRisikoscenario) => void
  tiltakList: ITiltak[]
  setTiltakList: (state: ITiltak[]) => void
  risikoscenarioList: IRisikoscenario[]
  setRisikoscenarioList: (state: IRisikoscenario[]) => void
  risikoscenarioer: IRisikoscenario[]
  setRisikoscenarioer: (state: IRisikoscenario[]) => void
  customDelete?: (tiltakId: string) => void
}

export const SlettTiltakModal: FunctionComponent<TProps> = ({
  tiltak,
  risikoscenario,
  isDeleteModalOpen,
  setIsDeleteModalOpen,
  risikoscenarioerConnectedToTiltak,
  setRisikoscenario,
  tiltakList,
  setTiltakList,
  risikoscenarioList,
  setRisikoscenarioList,
  risikoscenarioer,
  setRisikoscenarioer,
  customDelete,
}) => {
  const router = useRouter()

  const onDeleteSubmit = async (tiltakId: string) => {
    await getTiltak(tiltakId).then(async (response: ITiltak) => {
      if (
        response.risikoscenarioIds.length === 1 &&
        response.risikoscenarioIds[0] === risikoscenario.id
      ) {
        await removeTiltakToRisikoscenario(risikoscenario.id, tiltakId).then(
          async (risikoscenarioResponse) => {
            setRisikoscenario(risikoscenarioResponse)
            setRisikoscenarioer(
              risikoscenarioer.map((rs) => {
                if (rs.id === risikoscenarioResponse.id) {
                  return risikoscenarioResponse
                } else {
                  return rs
                }
              })
            )
            setRisikoscenarioList(
              risikoscenarioList.map((rs) => {
                if (rs.id === risikoscenarioResponse.id) {
                  return risikoscenarioResponse
                } else {
                  return rs
                }
              })
            )

            await deleteTiltak(tiltakId).then(() => {
              setTiltakList(tiltakList.filter((tiltak) => tiltak.id !== tiltakId))
              setIsDeleteModalOpen(false)
              router.push(risikoscenarioUrl(risikoscenario.id))
            })
          }
        )
      } else {
        await removeTiltakToRisikoscenario(risikoscenario.id, tiltakId).then(
          (risikoscenarioResponse) => {
            setRisikoscenario(risikoscenarioResponse)
            setRisikoscenarioer(
              risikoscenarioer.map((rs) => {
                if (rs.id === risikoscenarioResponse.id) {
                  return risikoscenarioResponse
                } else {
                  return rs
                }
              })
            )
            setRisikoscenarioList(
              risikoscenarioList.map((rs) => {
                if (rs.id === risikoscenarioResponse.id) {
                  return risikoscenarioResponse
                } else {
                  return rs
                }
              })
            )
            setTiltakList(
              tiltakList.map((tiltak) => {
                if (tiltak.id === tiltakId) {
                  return {
                    ...tiltak,
                    risikoscenarioIds: tiltak.risikoscenarioIds.filter(
                      (id) => id !== risikoscenario.id
                    ),
                  }
                } else {
                  return tiltak
                }
              })
            )
            router.push(risikoscenarioUrl(risikoscenario.id))
          }
        )
      }
    })
  }

  return (
    <Modal
      open={isDeleteModalOpen}
      header={{ heading: 'Vil dere slette dette tiltaket?' }}
      onClose={() => setIsDeleteModalOpen(false)}
    >
      <Modal.Body>
        {risikoscenarioerConnectedToTiltak.length === 0 && (
          <div>
            <BodyLong className='mb-5'>
              Tiltaket brukes ikke noe annet sted i dokumentasjonen deres. Ved sletting vil tiltaket
              ikke lenger være tilgjengelig i PVK-dokumentasjonen deres.
            </BodyLong>
            <BodyLong>
              Hvis tiltaket er tenkt brukt ved andre risikoscenarioer, koble tiltaket på de
              scenarioene først, og kom så tilbake og slette tiltaket herfra.
            </BodyLong>
          </div>
        )}
        {risikoscenarioerConnectedToTiltak.length !== 0 && (
          <div>
            <BodyLong>Dette tiltaket brukes også ved følgende risikoscenarioer:</BodyLong>
            <List as='ul'>
              {risikoscenarioerConnectedToTiltak.map((risikoscenario, index) => (
                <List.Item key={index + '_' + risikoscenario}>{risikoscenario}</List.Item>
              ))}
            </List>
            <BodyLong>
              Ved å slette tiltaket her, vil dere bare fjerne koblingen. Tiltaket vil fortsatt være
              tilknyttet de andre risikoscenarioene. Tiltaket kan ved behov også slettes derfra.
            </BodyLong>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => setIsDeleteModalOpen(false)} variant={'secondary'}>
          Avbryt
        </Button>
        <Button
          onClick={async () => {
            if (customDelete) {
              await customDelete(tiltak.id)
              setIsDeleteModalOpen(false)
            } else {
              await onDeleteSubmit(tiltak.id)
              setIsDeleteModalOpen(false)
            }
          }}
        >
          Slett
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default SlettTiltakModal
