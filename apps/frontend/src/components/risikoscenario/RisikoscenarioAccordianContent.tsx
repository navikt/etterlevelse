import { PencilIcon } from '@navikt/aksel-icons'
import { Alert, Button } from '@navikt/ds-react'
import { FunctionComponent, RefObject, useEffect, useState } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import { getPvkDokument } from '../../api/PvkDokumentApi'
import {
  addTiltakToRisikoscenario,
  getRisikoscenario,
  updateRisikoscenario,
} from '../../api/RisikoscenarioApi'
import { createTiltakAndRelasjonWithRisikoscenario } from '../../api/TiltakApi'
import { IRisikoscenario, ITiltak, ITiltakRisikoscenarioRelasjon } from '../../constants'
import AlertPvoUnderarbeidModal from '../PvkDokument/common/AlertPvoUnderarbeidModal'
import { isReadOnlyPvkStatus } from '../PvkDokument/common/util'
import { risikoscenarioTiltakUrl } from '../common/RouteLinkPvk'
import TiltakReadMoreList from '../tiltak/TiltakReadMoreList'
import LeggTilEksisterendeTiltak from '../tiltak/edit/LeggTilEksisterendeTiltak'
import TiltakForm from '../tiltak/edit/TiltakForm'
import RisikoscenarioView from './RisikoscenarioView'
import SlettOvrigRisikoscenario from './SlettOvrigRisikoscenario'
import { RisikoscenarioTiltakHeader } from './common/KravRisikoscenarioHeaders'
import IngenTiltakField from './edit/IngenTiltakField'
import RisikoscenarioModalForm from './edit/RisikoscenarioModalForm'

type TProps = {
  risikoscenario: IRisikoscenario
  risikoscenarioer: IRisikoscenario[]
  allRisikoscenarioList: IRisikoscenario[]
  tiltakList: ITiltak[]
  etterlevelseDokumentasjonId: string
  setTiltakList: (state: ITiltak[]) => void
  setAllRisikoscenarioList: (state: IRisikoscenario[]) => void
  setRisikoscenarioer: (state: IRisikoscenario[]) => void
  setIsTiltakFormActive: (state: boolean) => void
  isIngenTilgangFormDirty: boolean
  setIsIngenTilgangFormDirty: (state: boolean) => void
  formRef: RefObject<any>
  isCreateModalOpen: boolean
}

export const RisikoscenarioAccordionContent: FunctionComponent<TProps> = ({
  risikoscenario,
  risikoscenarioer,
  allRisikoscenarioList,
  setAllRisikoscenarioList,
  tiltakList,
  etterlevelseDokumentasjonId,
  setTiltakList,
  setRisikoscenarioer,
  setIsTiltakFormActive,
  isIngenTilgangFormDirty,
  setIsIngenTilgangFormDirty,
  formRef,
  isCreateModalOpen,
}) => {
  const navigate: NavigateFunction = useNavigate()
  const [activeRisikoscenario, setActiveRisikoscenario] = useState<IRisikoscenario>(risikoscenario)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [isCreateTiltakFormActive, setIsCreateTiltakFormActive] = useState<boolean>(false)
  const [isAddExistingMode, setIsAddExisitingMode] = useState<boolean>(false)

  const [isEditTiltakFormActive, setIsEditTiltakFormActive] = useState<boolean>(false)

  const [isPvoAlertModalOpen, setIsPvoAlertModalOpen] = useState<boolean>(false)
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false)

  const submit = async (risikoscenario: IRisikoscenario): Promise<void> => {
    await updateRisikoscenario(risikoscenario).then((response: IRisikoscenario) => {
      setActiveRisikoscenario(response)
      setRisikoscenarioer(
        risikoscenarioer.map((risikoscenario) => {
          if (risikoscenario.id === activeRisikoscenario.id) {
            return response
          } else {
            return risikoscenario
          }
        })
      )
      setIsEditModalOpen(false)
    })
  }

  const submitIngenTiltak = async (submitedValues: IRisikoscenario): Promise<void> => {
    await getRisikoscenario(risikoscenario.id).then((response: IRisikoscenario) => {
      const updatedRisikoscenario = {
        ...submitedValues,
        ...response,
        ingenTiltak: submitedValues.ingenTiltak,
      }

      updateRisikoscenario(updatedRisikoscenario)
        .then((response: IRisikoscenario) => {
          setActiveRisikoscenario(response)
          setRisikoscenarioer(
            risikoscenarioer.map((risikoscenario) => {
              if (risikoscenario.id === activeRisikoscenario.id) {
                return response
              } else {
                return risikoscenario
              }
            })
          )
          setSubmitSuccess(true)
        })
        .finally(() => setIsIngenTilgangFormDirty(false))
    })
  }

  const submitCreateTiltak = async (submitedTiltakValues: ITiltak): Promise<void> => {
    await createTiltakAndRelasjonWithRisikoscenario(
      submitedTiltakValues,
      activeRisikoscenario.id
    ).then((response: ITiltak) => {
      setActiveRisikoscenario({
        ...activeRisikoscenario,
        tiltakIds: [...activeRisikoscenario.tiltakIds, response.id],
      })
      setRisikoscenarioer(
        risikoscenarioer.map((risikoscenario) => {
          if (risikoscenario.id === activeRisikoscenario.id) {
            return { ...risikoscenario, tiltakIds: [...risikoscenario.tiltakIds, response.id] }
          } else {
            return risikoscenario
          }
        })
      )
      setTiltakList([...tiltakList, response])
      setIsCreateTiltakFormActive(false)
      navigate(risikoscenarioTiltakUrl(activeRisikoscenario.id, response.id))
    })
  }

  useEffect(() => {
    if (isCreateTiltakFormActive || isAddExistingMode || isEditTiltakFormActive) {
      setIsTiltakFormActive(true)
    } else {
      setIsTiltakFormActive(false)
    }
  }, [isCreateTiltakFormActive, isAddExistingMode, isEditTiltakFormActive])

  const activeFormButton = async (runFunction: () => void) => {
    await getPvkDokument(risikoscenario.pvkDokumentId).then((response) => {
      if (isReadOnlyPvkStatus(response.status)) {
        setIsPvoAlertModalOpen(true)
      } else {
        runFunction()
      }
    })
  }

  const submitLeggTilEksisterendeTitltak = async (request: ITiltakRisikoscenarioRelasjon) => {
    await addTiltakToRisikoscenario(request).then(() => {
      navigate(risikoscenarioTiltakUrl(request.risikoscenarioId, request.tiltakIds[0]))

      setActiveRisikoscenario({
        ...activeRisikoscenario,
        tiltakIds: [...activeRisikoscenario.tiltakIds, ...request.tiltakIds],
      })
      setRisikoscenarioer(
        risikoscenarioer.map((risikoscenario) => {
          if (risikoscenario.id === activeRisikoscenario.id) {
            return {
              ...risikoscenario,
              tiltakIds: [...risikoscenario.tiltakIds, ...request.tiltakIds],
            }
          } else {
            return risikoscenario
          }
        })
      )

      setIsAddExisitingMode(false)
    })
  }

  return (
    <div>
      <RisikoscenarioView
        risikoscenario={activeRisikoscenario}
        noCopyButton={false}
        etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
        stepUrl='6'
      />

      <div>
        {!isIngenTilgangFormDirty &&
          !isCreateTiltakFormActive &&
          !isEditTiltakFormActive &&
          !isAddExistingMode && (
            <div className='mt-5 flex gap-2 items-center'>
              <Button
                variant='tertiary'
                type='button'
                icon={<PencilIcon aria-hidden />}
                onClick={async () => {
                  await activeFormButton(() => setIsEditModalOpen(true))
                }}
              >
                Redigèr risikoscenario
              </Button>
              <SlettOvrigRisikoscenario
                risikoscenario={risikoscenario}
                tiltakList={tiltakList}
                risikoscenarioer={risikoscenarioer}
                setRisikoscenarioer={setRisikoscenarioer}
              />
            </div>
          )}
      </div>

      <div className='mt-12'>
        <RisikoscenarioTiltakHeader />
        {!risikoscenario.ingenTiltak && (
          <div>
            {risikoscenario.tiltakIds.length === 0 &&
              !isCreateTiltakFormActive &&
              !isEditTiltakFormActive && (
                <Alert inline className='mt-5 mb-9' variant='warning'>
                  Dere har ikke lagt inn tiltak
                </Alert>
              )}

            {risikoscenario.tiltakIds.length !== 0 && (
              <TiltakReadMoreList
                risikoscenario={activeRisikoscenario}
                setRirikoscenario={setActiveRisikoscenario}
                risikoscenarioList={allRisikoscenarioList}
                setRisikoscenarioList={setAllRisikoscenarioList}
                risikoscenarioer={risikoscenarioer}
                setRisikoscenarioer={setRisikoscenarioer}
                tiltakList={tiltakList}
                setTiltakList={setTiltakList}
                setIsEditTiltakFormActive={setIsEditTiltakFormActive}
                isCreateTiltakFormActive={isCreateTiltakFormActive}
                isAddExistingMode={isAddExistingMode}
                formRef={formRef}
              />
            )}

            {isCreateTiltakFormActive && (
              <TiltakForm
                title='Opprett nytt tiltak'
                initialValues={{} as ITiltak}
                pvkDokumentId={risikoscenario.pvkDokumentId}
                submit={submitCreateTiltak}
                close={() => setIsCreateTiltakFormActive(false)}
                formRef={formRef}
              />
            )}

            {isAddExistingMode && (
              <LeggTilEksisterendeTiltak
                risikoscenario={activeRisikoscenario}
                tiltakList={tiltakList}
                setIsAddExisitingMode={setIsAddExisitingMode}
                formRef={formRef}
                submit={submitLeggTilEksisterendeTitltak}
              />
            )}

            {!isIngenTilgangFormDirty &&
              !isCreateTiltakFormActive &&
              !isEditTiltakFormActive &&
              !isAddExistingMode && (
                <div className='mt-5 flex gap-2'>
                  <Button
                    type='button'
                    onClick={async () =>
                      await activeFormButton(() => {
                        setIsCreateTiltakFormActive(true)
                        setIsTiltakFormActive(true)
                      })
                    }
                  >
                    Opprett nytt tiltak
                  </Button>
                  <Button
                    type='button'
                    variant='secondary'
                    onClick={async () =>
                      await activeFormButton(() => {
                        setIsAddExisitingMode(true)
                        setIsTiltakFormActive(true)
                      })
                    }
                  >
                    Legg til eksisterende tiltak
                  </Button>
                </div>
              )}
          </div>
        )}

        {!isCreateModalOpen &&
          !isCreateTiltakFormActive &&
          !isEditTiltakFormActive &&
          !isAddExistingMode &&
          activeRisikoscenario.tiltakIds.length === 0 && (
            <div className='mt-3'>
              <IngenTiltakField
                risikoscenario={activeRisikoscenario}
                formRef={formRef}
                submit={submitIngenTiltak}
                setIsIngenTilgangFormDirty={setIsIngenTilgangFormDirty}
              />
            </div>
          )}

        {submitSuccess && (
          <Alert
            className='mt-3'
            variant='success'
            onClose={() => setSubmitSuccess(false)}
            closeButton
          >
            Lagring vellykket.
          </Alert>
        )}
      </div>

      {isEditModalOpen && (
        <RisikoscenarioModalForm
          headerText='Redigér øvrig risikoscenario'
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
          submit={submit}
          initialValues={activeRisikoscenario}
        />
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

export default RisikoscenarioAccordionContent
