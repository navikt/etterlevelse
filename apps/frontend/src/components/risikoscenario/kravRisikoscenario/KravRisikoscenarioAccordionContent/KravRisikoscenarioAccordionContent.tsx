import { FunctionComponent, RefObject, useEffect, useState } from 'react'
import {
  addTiltakToRisikoscenario,
  removeTiltakToRisikoscenario,
  updateRisikoscenario,
} from '../../../../api/RisikoscenarioApi'
import {
  createTiltakAndRelasjonWithRisikoscenario,
  deleteTiltak,
  getTiltak,
} from '../../../../api/TiltakApi'
import {
  IRisikoscenario,
  ITiltak,
  ITiltakRisikoscenarioRelasjon,
  TEtterlevelseDokumentasjonQL,
} from '../../../../constants'
import { user } from '../../../../services/User'
import RisikoscenarioModalForm from '../../edit/RisikoscenarioModalForm'
import { KravRisikoscenarioAccordionContentEditMode } from './KravRisikoscenarioAccordionContentEditMode'
import { KravRisikoscenarioAccordionContentLimitedReadonly } from './KravRisikoscenarioAccordionContentLimitedReadonly'

type TProps = {
  risikoscenario: IRisikoscenario
  alleRisikoscenarioer: IRisikoscenario[]
  etterlevelseDokumentasjonId: string
  risikoscenarioForKrav: IRisikoscenario[]
  setRisikoscenarioForKrav: (state: IRisikoscenario[]) => void
  tiltakList: ITiltak[]
  setTiltakList: (state: ITiltak[]) => void
  setIsTiltakFormActive: (state: boolean) => void
  isCreateMode?: boolean
  noCopyButton?: boolean
  formRef: RefObject<any>
  etterlevelseDokumentasjon?: TEtterlevelseDokumentasjonQL
}

export const KravRisikoscenarioAccordionContent: FunctionComponent<TProps> = ({
  risikoscenario,
  alleRisikoscenarioer,
  etterlevelseDokumentasjonId,
  risikoscenarioForKrav,
  setRisikoscenarioForKrav,
  tiltakList,
  setTiltakList,
  isCreateMode,
  setIsTiltakFormActive,
  formRef,
  etterlevelseDokumentasjon,
}) => {
  const [activeRisikoscenario, setActiveRisikoscenario] = useState<IRisikoscenario>(risikoscenario)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [isCreateTiltakFormActive, setIsCreateTiltakFormActive] = useState<boolean>(false)
  const [isAddExistingMode, setIsAddExisitingMode] = useState<boolean>(false)

  const [isEditTiltakFormActive, setIsEditTiltakFormActive] = useState<boolean>(false)

  const updateRisikoscenarioList = (updatedRisikoscenario: IRisikoscenario): void => {
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

  const submit = async (risikoscenario: IRisikoscenario): Promise<void> => {
    await updateRisikoscenario(risikoscenario).then((response: IRisikoscenario) => {
      setActiveRisikoscenario(response)
      updateRisikoscenarioList(response)
      setIsEditModalOpen(false)
    })
  }

  const submitCreateTiltak = async (submitedTiltakValues: ITiltak): Promise<void> => {
    await createTiltakAndRelasjonWithRisikoscenario(
      submitedTiltakValues,
      activeRisikoscenario.id
    ).then((response) => {
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
    })
  }

  const submitExistingTiltak = async (request: ITiltakRisikoscenarioRelasjon) => {
    await addTiltakToRisikoscenario(request).then(() => {
      setActiveRisikoscenario({
        ...activeRisikoscenario,
        tiltakIds: [...activeRisikoscenario.tiltakIds, ...request.tiltakIds],
      })
      updateRisikoscenarioList({
        ...activeRisikoscenario,
        tiltakIds: [...activeRisikoscenario.tiltakIds, ...request.tiltakIds],
      })
      setIsAddExisitingMode(false)
    })
  }

  const submitDeleteTiltak = async (tiltakId: string) => {
    await getTiltak(tiltakId).then(async (response: ITiltak) => {
      if (
        response.risikoscenarioIds.length === 1 &&
        response.risikoscenarioIds[0] === risikoscenario.id
      ) {
        await removeTiltakToRisikoscenario(risikoscenario.id, tiltakId).then(async () => {
          await deleteTiltak(tiltakId).then(() => {
            setActiveRisikoscenario({
              ...activeRisikoscenario,
              tiltakIds: activeRisikoscenario.tiltakIds.filter((id) => id !== tiltakId),
            })
          })
        })
      } else {
        await removeTiltakToRisikoscenario(risikoscenario.id, tiltakId).then(() => {
          setActiveRisikoscenario({
            ...activeRisikoscenario,
            tiltakIds: activeRisikoscenario.tiltakIds.filter((id) => id !== tiltakId),
          })
        })
      }
    })
  }

  useEffect(() => {
    if (isCreateTiltakFormActive || isAddExistingMode || isEditTiltakFormActive) {
      setIsTiltakFormActive(true)
    } else setIsTiltakFormActive(false)
  }, [isCreateTiltakFormActive, isAddExistingMode, isEditTiltakFormActive])

  const userHasAccess = (): boolean => {
    return user.isAdmin() || etterlevelseDokumentasjon?.hasCurrentUserAccess || false
  }

  return (
    <div>
      {!isCreateMode &&
        !isAddExistingMode &&
        !isCreateTiltakFormActive &&
        !isEditTiltakFormActive && (
          <KravRisikoscenarioAccordionContentLimitedReadonly
            activeRisikoscenario={activeRisikoscenario}
            etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
            risikoscenario={risikoscenario}
            alleRisikoscenarioer={alleRisikoscenarioer}
            tiltakList={tiltakList}
            setTiltakList={setTiltakList}
            setIsEditTiltakFormActive={setIsEditTiltakFormActive}
            isCreateTiltakFormActive={isCreateTiltakFormActive}
            isAddExistingMode={isAddExistingMode}
            submitDeleteTiltak={submitDeleteTiltak}
            formRef={formRef}
          />
        )}

      {isCreateMode && isAddExistingMode && isCreateTiltakFormActive && isEditTiltakFormActive && (
        <KravRisikoscenarioAccordionContentEditMode
          activeRisikoscenario={activeRisikoscenario}
          userHasAccess={userHasAccess}
          risikoscenario={risikoscenario}
          etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
          alleRisikoscenarioer={alleRisikoscenarioer}
          tiltakList={tiltakList}
          setTiltakList={setTiltakList}
          setIsEditTiltakFormActive={setIsEditTiltakFormActive}
          isCreateTiltakFormActive={isCreateTiltakFormActive}
          isAddExistingMode={isAddExistingMode}
          submitDeleteTiltak={submitDeleteTiltak}
          formRef={formRef}
          setIsCreateTiltakFormActive={setIsCreateTiltakFormActive}
          setIsAddExisitingMode={setIsAddExisitingMode}
          submitCreateTiltak={submitCreateTiltak}
          submitExistingTiltak={submitExistingTiltak}
        />
      )}

      {isEditModalOpen && (
        <RisikoscenarioModalForm
          headerText="Redigér øvrig risikoscenario"
          isOpen={isEditModalOpen}
          setIsOpen={setIsEditModalOpen}
          submit={submit}
          initialValues={activeRisikoscenario}
        />
      )}
    </div>
  )
}

export default KravRisikoscenarioAccordionContent
