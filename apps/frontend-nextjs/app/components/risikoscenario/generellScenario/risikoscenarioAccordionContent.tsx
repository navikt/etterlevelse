'use client'

import { getPvkDokument } from '@/api/pvkDokument/pvkDokumentApi'
import {
  addTiltakToRisikoscenario,
  getRisikoscenario,
  syncKravRelasjonerForRisikoscenario,
  updateRisikoscenario,
} from '@/api/risikoscenario/risikoscenarioApi'
import { createTiltakAndRelasjonWithRisikoscenario } from '@/api/tiltak/tiltakApi'
import AlertPvoUnderArbeidModal from '@/components/pvoTilbakemelding/common/alertPvoUnderArbeidModal'
import LeggTilEksisterendeTiltak from '@/components/tiltak/edit/leggTilEksisterendeTiltak'
import TiltakForm from '@/components/tiltak/form/tiltakForm'
import TiltakReadMoreList from '@/components/tiltak/tiltakReadMoreList'
import {
  IRisikoscenario,
  ITiltakRisikoscenarioRelasjon,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { IKravReference } from '@/constants/krav/kravConstants'
import { risikoscenarioTiltakUrl } from '@/routes/risikoscenario/risikoscenarioRoutes'
import { isReadOnlyPvkStatus } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { PencilIcon } from '@navikt/aksel-icons'
import { Alert, Button } from '@navikt/ds-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FunctionComponent, RefObject, useEffect, useState } from 'react'
import RisikoscenarioView from '../common/RisikoscenarioView'
import { RisikoscenarioTiltakHeader } from '../common/risikoscenarioTiltakHeader'
import SlettOvrigRisikoscenario from '../edit/slettOvrigRisikoscenario'
import IngenTiltakField from '../form/field/ingenTiltakField'
import RisikoscenarioModalForm from '../form/risikoscenarioModalForm'

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
  onMovedToKrav?: (payload: { risikoscenarioName: string; kravRefs: IKravReference[] }) => void
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
  onMovedToKrav,
}) => {
  const router = useRouter()
  const queryParams = useSearchParams()
  const steg = queryParams.get('steg') || undefined
  const [activeRisikoscenario, setActiveRisikoscenario] = useState<IRisikoscenario>(risikoscenario)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [isCreateTiltakFormActive, setIsCreateTiltakFormActive] = useState<boolean>(false)
  const [isAddExistingMode, setIsAddExisitingMode] = useState<boolean>(false)

  const [isEditTiltakFormActive, setIsEditTiltakFormActive] = useState<boolean>(false)

  const [isPvoAlertModalOpen, setIsPvoAlertModalOpen] = useState<boolean>(false)
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false)

  const submit = async (risikoscenario: IRisikoscenario): Promise<void> => {
    const prevWasGenerell = activeRisikoscenario.generelScenario
    const prevKravRefs = activeRisikoscenario.relevanteKravNummer || []
    const prevKravnummer = prevKravRefs.map((k) => k.kravNummer)

    // NOTE: updateRisikoscenario intentionally strips relevanteKravNummer from the DTO.
    // So we must sync krav relations separately.
    const desiredKravRefs = risikoscenario.relevanteKravNummer || []
    const desiredKravnummer = desiredKravRefs.map((k) => k.kravNummer)

    const response = await updateRisikoscenario(risikoscenario)
    await syncKravRelasjonerForRisikoscenario(response.id, prevKravnummer, desiredKravnummer)
    const hydrated = await getRisikoscenario(response.id)

    // If editing links this scenario to krav, it disappears from the "generelle" list.
    // Store a one-shot success message so the list view can show where it went.
    if (
      prevWasGenerell &&
      !hydrated.generelScenario &&
      prevKravRefs.length === 0 &&
      (hydrated.relevanteKravNummer || []).length > 0
    ) {
      const storageKey = `pvk:moved-risikoscenario:${etterlevelseDokumentasjonId}`
      const payload: { risikoscenarioName: string; kravRefs: IKravReference[] } = {
        risikoscenarioName: hydrated.navn || 'Risikoscenario',
        kravRefs: hydrated.relevanteKravNummer || [],
      }
      window.sessionStorage.setItem(storageKey, JSON.stringify(payload))
      onMovedToKrav?.(payload)
    }

    setActiveRisikoscenario(hydrated)

    if (hydrated.generelScenario) {
      setRisikoscenarioer(
        risikoscenarioer.map((item) => {
          if (item.id === hydrated.id) {
            return hydrated
          } else {
            return item
          }
        })
      )
    } else {
      setRisikoscenarioer(risikoscenarioer.filter((item) => item.id !== hydrated.id))
    }

    setIsEditModalOpen(false)
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
      router.push(risikoscenarioTiltakUrl(activeRisikoscenario.id, response.id, steg), {
        scroll: false,
      })
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
      router.push(risikoscenarioTiltakUrl(request.risikoscenarioId, request.tiltakIds[0], steg), {
        scroll: false,
      })

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

      request.tiltakIds.forEach((tiltakId) => {
        setTiltakList(
          tiltakList.map((tiltak) => {
            if (tiltak.id === tiltakId) {
              return {
                ...tiltak,
                risikoscenarioIds: [...tiltak.risikoscenarioIds, request.risikoscenarioId],
              }
            } else {
              return tiltak
            }
          })
        )
      })

      setIsAddExisitingMode(false)
    })
  }

  return (
    <div>
      <RisikoscenarioView
        risikoscenario={activeRisikoscenario}
        noCopyButton={false}
        etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
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
                Rediger risikoscenario
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
                setRisikoscenario={setActiveRisikoscenario}
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

        {submitSuccess && !formRef.current.dirty && (
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
          headerText='Rediger øvrig risikoscenario'
          mode='update'
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
          submit={submit}
          initialValues={activeRisikoscenario}
        />
      )}

      {isPvoAlertModalOpen && (
        <AlertPvoUnderArbeidModal
          isOpen={isPvoAlertModalOpen}
          onClose={() => setIsPvoAlertModalOpen(false)}
          pvkDokumentId={risikoscenario.pvkDokumentId}
        />
      )}
    </div>
  )
}

export default RisikoscenarioAccordionContent
