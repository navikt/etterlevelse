import { PencilIcon, TrashIcon } from '@navikt/aksel-icons'
import { BodyLong, Button, List, Modal, ReadMore } from '@navikt/ds-react'
import { RefObject, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPvkDokument } from '../../api/PvkDokumentApi'
import { removeTiltakToRisikoscenario } from '../../api/RisikoscenarioApi'
import { deleteTiltak, getTiltak, updateTiltak } from '../../api/TiltakApi'
import { IRisikoscenario, ITiltak } from '../../constants'
import AlertPvoUnderarbeidModal from '../PvkDokument/common/AlertPvoUnderarbeidModal'
import { isReadOnlyPvkStatus } from '../PvkDokument/common/util'
import { risikoscenarioTiltakUrl, risikoscenarioUrl } from '../common/RouteLinkPvk'
import TiltakView from './TiltakView'
import TiltakForm from './edit/TiltakForm'

interface IProps {
  risikoscenario: IRisikoscenario
  setRirikoscenario: (state: IRisikoscenario) => void
  tiltakList: ITiltak[]
  setTiltakList: (state: ITiltak[]) => void
  risikoscenarioList: IRisikoscenario[]
  setRisikoscenarioList: (state: IRisikoscenario[]) => void
  risikoscenarioer: IRisikoscenario[]
  setRisikoscenarioer: (state: IRisikoscenario[]) => void
  setIsEditTiltakFormActive: (state: boolean) => void
  isCreateTiltakFormActive: boolean
  isAddExistingMode: boolean
  customDelete?: (tiltakId: string) => void
  formRef?: RefObject<any>
}

export const TiltakReadMoreList = (props: IProps) => {
  const {
    risikoscenario,
    setRirikoscenario,
    tiltakList,
    setTiltakList,
    risikoscenarioList,
    setRisikoscenarioList,
    risikoscenarioer,
    setRisikoscenarioer,
    setIsEditTiltakFormActive,
    isCreateTiltakFormActive,
    isAddExistingMode,
    customDelete,
    formRef,
  } = props
  const [activeTiltak, setActiveTiltak] = useState<string>('')
  const url = new URL(window.location.href)
  const tiltakId = url.searchParams.get('tiltak')

  useEffect(() => {
    if (tiltakId) {
      setActiveTiltak(tiltakId)
    }
  }, [])

  return (
    <div>
      {tiltakList
        .filter((tiltak) => risikoscenario.tiltakIds.includes(tiltak.id))
        .map((tiltak, index) => {
          return (
            <div className='mt-3' key={risikoscenario.id + '_' + tiltak.id + '_' + index}>
              <TiltakListContent
                activeTiltak={activeTiltak}
                setActiveTiltak={setActiveTiltak}
                risikoscenario={risikoscenario}
                setRirikoscenario={setRirikoscenario}
                tiltak={tiltak}
                tiltakList={tiltakList}
                setTiltakList={setTiltakList}
                risikoscenarioList={risikoscenarioList}
                setRisikoscenarioList={setRisikoscenarioList}
                risikoscenarioer={risikoscenarioer}
                setRisikoscenarioer={setRisikoscenarioer}
                setIsEditTiltakFormActive={setIsEditTiltakFormActive}
                isCreateTiltakFormActive={isCreateTiltakFormActive}
                isAddExistingMode={isAddExistingMode}
                customDelete={customDelete}
                formRef={formRef}
              />
            </div>
          )
        })}
    </div>
  )
}

interface ITiltakListContentProps extends IProps {
  activeTiltak: string
  setActiveTiltak: (state: string) => void
  tiltak: ITiltak
}

const TiltakListContent = (props: ITiltakListContentProps) => {
  const {
    activeTiltak,
    setActiveTiltak,
    risikoscenario,
    setRirikoscenario,
    tiltak,
    tiltakList,
    setTiltakList,
    risikoscenarioList,
    setRisikoscenarioList,
    risikoscenarioer,
    setRisikoscenarioer,
    setIsEditTiltakFormActive,
    isCreateTiltakFormActive,
    isAddExistingMode,
    customDelete,
    formRef,
  } = props
  const [isEditMode, setIsEditMode] = useState<boolean>(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)
  const [isPvoAlertModalOpen, setIsPvoAlertModalOpen] = useState<boolean>(false)
  const [risikoscenarioerConnectedToTiltak, setRisikoscenarioerConnectedToTiltak] = useState<
    string[]
  >([])
  const url = new URL(window.location.href)
  const tiltakId = url.searchParams.get('tiltak')
  const navigate = useNavigate()

  const submit = async (submitedValues: ITiltak) => {
    await updateTiltak(submitedValues).then((response) => {
      setTiltakList(
        tiltakList.map((tiltak) => {
          if (tiltak.id === response.id) {
            return { ...response }
          } else {
            return tiltak
          }
        })
      )
      setIsEditTiltakFormActive(false)
      setIsEditMode(false)
    })
  }

  const onDeleteSubmit = async (tiltakId: string) => {
    await getTiltak(tiltakId).then(async (response: ITiltak) => {
      if (
        response.risikoscenarioIds.length === 1 &&
        response.risikoscenarioIds[0] === risikoscenario.id
      ) {
        await removeTiltakToRisikoscenario(risikoscenario.id, tiltakId).then(
          async (risikoscenarioResponse) => {
            setRirikoscenario(risikoscenarioResponse)
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
              navigate(risikoscenarioUrl(risikoscenario.id))
            })
          }
        )
      } else {
        await removeTiltakToRisikoscenario(risikoscenario.id, tiltakId).then(
          (risikoscenarioResponse) => {
            setRirikoscenario(risikoscenarioResponse)
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
            navigate(risikoscenarioUrl(risikoscenario.id))
          }
        )
      }
    })
  }

  const activeFormButton = async (runFunction: () => void) => {
    await getPvkDokument(risikoscenario.pvkDokumentId).then((response) => {
      if (isReadOnlyPvkStatus(response.status)) {
        setIsPvoAlertModalOpen(true)
      } else {
        runFunction()
      }
    })
  }

  useEffect(() => {
    if (tiltak && tiltak.id === activeTiltak) {
      const risikoscenarioIds = tiltak.risikoscenarioIds.filter((id) => id !== risikoscenario.id)
      const risikoscenarioNameList: string[] = []
      risikoscenarioIds.forEach((id) => {
        risikoscenarioNameList.push(
          risikoscenarioList.filter((risikoscenario) => risikoscenario.id === id)[0].navn
        )
      })
      setRisikoscenarioerConnectedToTiltak(risikoscenarioNameList)
    }
  }, [activeTiltak])

  return (
    <div key={risikoscenario.id + '_' + tiltak.id}>
      {!isEditMode && (
        <ReadMore
          open={tiltakId === tiltak.id}
          id={risikoscenario.id + '_' + tiltak.id}
          className='mb-3'
          onOpenChange={(open) => {
            if (open) {
              setActiveTiltak(tiltak.id)
              navigate(risikoscenarioTiltakUrl(risikoscenario.id, tiltak.id))
            } else {
              setActiveTiltak('')
              navigate(risikoscenarioUrl(risikoscenario.id))
            }
          }}
          header={tiltak.navn}
        >
          <TiltakView tiltak={tiltak} risikoscenarioList={risikoscenarioList} />
        </ReadMore>
      )}

      <div>
        {isEditMode && (
          <TiltakForm
            title='Redigér tiltak'
            initialValues={tiltak}
            pvkDokumentId={tiltak.pvkDokumentId}
            submit={submit}
            close={() => {
              setIsEditMode(false)
              setIsEditTiltakFormActive(false)
            }}
            formRef={formRef}
          />
        )}

        {activeTiltak === tiltak.id &&
          !isEditMode &&
          !isCreateTiltakFormActive &&
          !isAddExistingMode && (
            <div className='flex gap-2 mt-5'>
              <Button
                type='button'
                variant='tertiary'
                size='small'
                icon={<PencilIcon title='' aria-hidden />}
                onClick={async () => {
                  await activeFormButton(() => {
                    setIsEditTiltakFormActive(true)
                    setIsEditMode(true)
                  })
                }}
              >
                Redigér tiltak
              </Button>

              <Button
                type='button'
                variant='tertiary'
                size='small'
                icon={<TrashIcon title='' aria-hidden />}
                onClick={async () => {
                  await activeFormButton(() => setIsDeleteModalOpen(true))
                }}
              >
                Slett tiltak
              </Button>
            </div>
          )}
      </div>

      {isPvoAlertModalOpen && (
        <AlertPvoUnderarbeidModal
          isOpen={isPvoAlertModalOpen}
          onClose={() => setIsPvoAlertModalOpen(false)}
          pvkDokumentId={risikoscenario.pvkDokumentId}
        />
      )}

      {isDeleteModalOpen && (
        <Modal
          open={isDeleteModalOpen}
          header={{ heading: 'Vil dere slette dette tiltaket?' }}
          onClose={() => setIsDeleteModalOpen(false)}
        >
          <Modal.Body>
            {risikoscenarioerConnectedToTiltak.length === 0 && (
              <div>
                <BodyLong className='mb-5'>
                  Tiltaket brukes ikke noe annet sted i dokumentasjonen deres. Ved sletting vil
                  tiltaket ikke lenger være tilgjengelig i PVK-dokumentasjonen deres.
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
                  Ved å slette tiltaket her, vil dere bare fjerne koblingen. Tiltaket vil fortsatt
                  være tilknyttet de andre risikoscenarioene. Tiltaket kan ved behov også slettes
                  derfra.
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
      )}
    </div>
  )
}

export default TiltakReadMoreList
