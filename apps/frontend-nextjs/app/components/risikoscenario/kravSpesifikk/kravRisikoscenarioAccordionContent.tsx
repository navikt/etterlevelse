'use client'

import { getPvkDokument } from '@/api/pvkDokument/pvkDokumentApi'
import {
  addTiltakToRisikoscenario,
  getRisikoscenario,
  removeTiltakToRisikoscenario,
  syncKravRelasjonerForRisikoscenario,
  updateRisikoscenario,
} from '@/api/risikoscenario/risikoscenarioApi'
import {
  createTiltakAndRelasjonWithRisikoscenario,
  deleteTiltak,
  getTiltak,
} from '@/api/tiltak/tiltakApi'
import AlertPvoUnderArbeidModal from '@/components/pvoTilbakemelding/common/alertPvoUnderArbeidModal'
import { LeggTilEksisterendeTiltak } from '@/components/tiltak/edit/leggTilEksisterendeTiltak'
import TiltakForm from '@/components/tiltak/form/tiltakForm'
import TiltakReadMoreList from '@/components/tiltak/tiltakReadMoreList'
import {
  IRisikoscenario,
  ITiltakRisikoscenarioRelasjon,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import {
  risikoscenarioIdQuery,
  risikoscenarioTiltakUrl,
} from '@/routes/risikoscenario/risikoscenarioRoutes'
import { isReadOnlyPvkStatus } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { Button } from '@navikt/ds-react'
import { useRouter } from 'next/navigation'
import { FunctionComponent, RefObject, useEffect, useState } from 'react'
import RisikoscenarioView from '../common/RisikoscenarioView'
import { RisikoscenarioTiltakHeader } from '../common/risikoscenarioTiltakHeader'
import RedigerRisikoscenarioButtons from '../edit/redigerRisikoscenarioButtons'
import { IngenTiltakField } from '../form/field/ingenTiltakField'
import RisikoscenarioModalForm from '../form/risikoscenarioModalForm'

type TProps = {
  risikoscenario: IRisikoscenario
  risikoscenarioer: IRisikoscenario[]
  alleRisikoscenarioer: IRisikoscenario[]
  setAlleRisikoscenarioer: (state: IRisikoscenario[]) => void
  etterlevelseDokumentasjonId: string
  setRisikoscenarioer: (state: IRisikoscenario[]) => void
  risikoscenarioForKrav: IRisikoscenario[]
  setRisikoscenarioForKrav: (state: IRisikoscenario[]) => void
  tiltakList: ITiltak[]
  setTiltakList: (state: ITiltak[]) => void
  kravnummer: number
  kravversjon: number
  setIsTiltakFormActive: (state: boolean) => void
  isCreateMode?: boolean
  noCopyButton?: boolean
  formRef: RefObject<any>
  onRemovedFromThisKrav?: (payload: { risikoscenarioName: string }) => void
}

export const KravRisikoscenarioAccordionContent: FunctionComponent<TProps> = ({
  risikoscenario,
  risikoscenarioer,
  alleRisikoscenarioer,
  setAlleRisikoscenarioer,
  risikoscenarioForKrav,
  etterlevelseDokumentasjonId,
  kravnummer,
  kravversjon,
  setRisikoscenarioer,
  setRisikoscenarioForKrav,
  tiltakList,
  setTiltakList,
  isCreateMode,
  setIsTiltakFormActive,
  formRef,
  onRemovedFromThisKrav,
}) => {
  const [activeRisikoscenario, setActiveRisikoscenario] = useState<IRisikoscenario>(risikoscenario)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [isCreateTiltakFormActive, setIsCreateTiltakFormActive] = useState<boolean>(false)
  const [isAddExistingMode, setIsAddExisitingMode] = useState<boolean>(false)

  const [isEditTiltakFormActive, setIsEditTiltakFormActive] = useState<boolean>(false)
  const [isIngenTiltakFormDirty, setIsIngenTilktakFormDirty] = useState<boolean>(false)
  const [isPvoAlertModalOpen, setIsPvoAlertModalOpen] = useState<boolean>(false)
  const router = useRouter()

  const isLinkedToThisKrav = (scenario: IRisikoscenario): boolean => {
    if (scenario.generelScenario) return false
    return (scenario.relevanteKravNummer || []).some(
      (krav) => krav.kravNummer === kravnummer && krav.kravVersjon === kravversjon
    )
  }

  const updateRisikoscenarioList = (updatedRisikoscenario: IRisikoscenario): void => {
    if (updatedRisikoscenario.generelScenario || !isLinkedToThisKrav(updatedRisikoscenario)) {
      setRisikoscenarioForKrav(
        risikoscenarioForKrav.filter(
          (risikoscenario) => risikoscenario.id !== updatedRisikoscenario.id
        )
      )
    } else {
      setRisikoscenarioForKrav(
        risikoscenarioForKrav.map((risikoscenario: IRisikoscenario) => {
          if (risikoscenario.id === updatedRisikoscenario.id) {
            return { ...updatedRisikoscenario }
          } else {
            return risikoscenario
          }
        })
      )
    }
  }

  const submit = async (risikoscenario: IRisikoscenario): Promise<void> => {
    const wasLinkedToThisKrav = isLinkedToThisKrav(activeRisikoscenario)
    const onskedeKravnummer = risikoscenario.generelScenario
      ? []
      : (risikoscenario.relevanteKravNummer || []).map((krav) => krav.kravNummer)

    const response = await updateRisikoscenario(risikoscenario)

    // Backend can clear relevanteKravNummer as part of update when switching to generelScenario.
    // Use the post-update state as the source of truth to avoid trying to remove relations twice.
    const eksisterendeKravnummer = (response.relevanteKravNummer || []).map(
      (krav) => krav.kravNummer
    )

    await syncKravRelasjonerForRisikoscenario(
      response.id,
      eksisterendeKravnummer,
      onskedeKravnummer
    )

    const refreshed = await getRisikoscenario(response.id)

    const isNowLinkedToThisKrav = isLinkedToThisKrav(refreshed)
    if (wasLinkedToThisKrav && !isNowLinkedToThisKrav) {
      const storageKey = `pvk:removed-risikoscenario-from-krav:${etterlevelseDokumentasjonId}:${kravnummer}:${kravversjon}`
      const payload = { risikoscenarioName: refreshed.navn || 'Risikoscenario' }
      window.sessionStorage.setItem(storageKey, JSON.stringify(payload))
      onRemovedFromThisKrav?.(payload)
    }

    setActiveRisikoscenario(refreshed)
    updateRisikoscenarioList(refreshed)
    setIsEditModalOpen(false)
  }

  const submitIngenTiltak = async (submitedValues: IRisikoscenario): Promise<void> => {
    await getRisikoscenario(risikoscenario.id).then((response: IRisikoscenario) => {
      const updatedRisikoscenario = {
        ...submitedValues,
        ...response,
        ingenTiltak: submitedValues.ingenTiltak,
      }

      updateRisikoscenario(updatedRisikoscenario).then((response: IRisikoscenario) => {
        setActiveRisikoscenario(response)
        updateRisikoscenarioList(response)
        setIsIngenTilktakFormDirty(false)
      })
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
      updateRisikoscenarioList({
        ...activeRisikoscenario,
        tiltakIds: [...activeRisikoscenario.tiltakIds, response.id],
      })
      setTiltakList([...tiltakList, response])
      setIsCreateTiltakFormActive(false)
      router.push(risikoscenarioIdQuery(risikoscenario.id, response.id))
    })
  }

  const submitExistingTiltak = async (request: ITiltakRisikoscenarioRelasjon): Promise<void> => {
    await addTiltakToRisikoscenario(request).then(() => {
      setActiveRisikoscenario({
        ...activeRisikoscenario,
        tiltakIds: [...activeRisikoscenario.tiltakIds, ...request.tiltakIds],
      })
      updateRisikoscenarioList({
        ...activeRisikoscenario,
        tiltakIds: [...activeRisikoscenario.tiltakIds, ...request.tiltakIds],
      })
      router.push(risikoscenarioTiltakUrl(activeRisikoscenario.id, request.tiltakIds[0]))
      setIsAddExisitingMode(false)
    })
  }

  const submitDeleteTiltak = async (tiltakId: string): Promise<void> => {
    await getTiltak(tiltakId).then(async (response: ITiltak) => {
      if (
        response.risikoscenarioIds.length === 1 &&
        response.risikoscenarioIds[0] === risikoscenario.id
      ) {
        await removeTiltakToRisikoscenario(risikoscenario.id, tiltakId).then(async () => {
          await deleteTiltak(tiltakId).then(() => {
            setActiveRisikoscenario({
              ...activeRisikoscenario,
              tiltakIds: activeRisikoscenario.tiltakIds.filter((id: string) => id !== tiltakId),
            })
            router.push(risikoscenarioIdQuery(risikoscenario.id))
            window.location.reload()
          })
        })
      } else {
        await removeTiltakToRisikoscenario(risikoscenario.id, tiltakId).then(() => {
          setActiveRisikoscenario({
            ...activeRisikoscenario,
            tiltakIds: activeRisikoscenario.tiltakIds.filter((id: string) => id !== tiltakId),
          })
          router.push(risikoscenarioIdQuery(risikoscenario.id))
          window.location.reload()
        })
      }
    })
  }

  const activateFormButton = async (runFunction: () => void) => {
    await getPvkDokument(risikoscenario.pvkDokumentId).then((response) => {
      if (isReadOnlyPvkStatus(response.status)) {
        setIsPvoAlertModalOpen(true)
      } else {
        runFunction()
      }
    })
  }

  useEffect(() => {
    if (isCreateTiltakFormActive || isAddExistingMode || isEditTiltakFormActive) {
      setIsTiltakFormActive(true)
    } else setIsTiltakFormActive(false)
  }, [isCreateTiltakFormActive, isAddExistingMode, isEditTiltakFormActive])

  return (
    <div>
      <RisikoscenarioView
        risikoscenario={activeRisikoscenario}
        noCopyButton={true}
        etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
      />

      {!isIngenTiltakFormDirty &&
        !isCreateTiltakFormActive &&
        !isEditTiltakFormActive &&
        !isAddExistingMode &&
        !isCreateMode && (
          <RedigerRisikoscenarioButtons
            setIsEditModalOpen={setIsEditModalOpen}
            kravnummer={kravnummer}
            risikoscenario={risikoscenario}
            risikoscenarioer={risikoscenarioer}
            setRisikoscenarioer={setRisikoscenarioer}
            risikoscenarioForKrav={risikoscenarioForKrav}
            setRisikoscenarioForKrav={setRisikoscenarioForKrav}
            tiltakList={tiltakList}
            setTiltakList={setTiltakList}
          />
        )}

      <div className='mt-12'>
        <RisikoscenarioTiltakHeader />

        {!risikoscenario.ingenTiltak && (
          <div>
            {risikoscenario.tiltakIds.length !== 0 && (
              <TiltakReadMoreList
                risikoscenario={activeRisikoscenario}
                setRisikoscenario={setActiveRisikoscenario}
                risikoscenarioList={alleRisikoscenarioer}
                setRisikoscenarioList={setAlleRisikoscenarioer}
                risikoscenarioer={risikoscenarioer}
                setRisikoscenarioer={setRisikoscenarioer}
                tiltakList={tiltakList}
                setTiltakList={setTiltakList}
                setIsEditTiltakFormActive={setIsEditTiltakFormActive}
                isCreateTiltakFormActive={isCreateTiltakFormActive}
                isAddExistingMode={isAddExistingMode}
                customDelete={submitDeleteTiltak}
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
                submit={submitExistingTiltak}
                formRef={formRef}
              />
            )}

            {!isIngenTiltakFormDirty &&
              !isCreateTiltakFormActive &&
              !isEditTiltakFormActive &&
              !isAddExistingMode &&
              !isCreateMode && (
                <div className='mt-5 flex gap-2 lg:flex-row flex-col'>
                  <Button
                    size='small'
                    type='button'
                    onClick={async () =>
                      await activateFormButton(() => {
                        setIsCreateTiltakFormActive(true)
                      })
                    }
                  >
                    Opprett nytt tiltak
                  </Button>
                  {tiltakList.filter(
                    (tiltak) => !activeRisikoscenario.tiltakIds.includes(tiltak.id)
                  ).length !== 0 && (
                    <Button
                      type='button'
                      size='small'
                      variant='secondary'
                      onClick={async () =>
                        await activateFormButton(() => {
                          setIsAddExisitingMode(true)
                        })
                      }
                    >
                      Legg til eksisterende tiltak
                    </Button>
                  )}
                </div>
              )}
          </div>
        )}

        {!isCreateMode &&
          !isCreateTiltakFormActive &&
          !isEditTiltakFormActive &&
          !isAddExistingMode &&
          activeRisikoscenario.tiltakIds.length === 0 && (
            <div className='mt-3'>
              <IngenTiltakField
                risikoscenario={activeRisikoscenario}
                submit={submitIngenTiltak}
                formRef={formRef}
                setIsIngenTilgangFormDirty={setIsIngenTilktakFormDirty}
              />
            </div>
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

export default KravRisikoscenarioAccordionContent
