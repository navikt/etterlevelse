import { Button, Heading } from '@navikt/ds-react'
import { RefObject, useEffect, useState } from 'react'
import {
  addTiltakToRisikoscenario,
  getRisikoscenario,
  removeTiltakToRisikoscenario,
  updateRisikoscenario,
} from '../../../api/RisikoscenarioApi'
import {
  createTiltakAndRelasjonWithRisikoscenario,
  deleteTiltak,
  getTiltak,
} from '../../../api/TiltakApi'
import {
  IRisikoscenario,
  ITiltak,
  ITiltakRisikoscenarioRelasjon,
  TEtterlevelseDokumentasjonQL,
} from '../../../constants'
import { user } from '../../../services/User'
import TiltakReadMoreList from '../../tiltak/TiltakReadMoreList'
import LeggTilEksisterendeTiltak from '../../tiltak/edit/LeggTilEksisterendeTiltak'
import TiltakForm from '../../tiltak/edit/TiltakForm'
import RisikoscenarioView from '../RisikoscenarioView'
import IngenTiltakField from '../edit/IngenTiltakField'
import RisikoscenarioModalForm from '../edit/RisikoscenarioModalForm'
import RedigerRisikoscenarioButtons from './RedigerRisikoscenarioButtons/RedigerRisikoscenarioButtons'

interface IProps {
  risikoscenario: IRisikoscenario
  risikoscenarioer: IRisikoscenario[]
  alleRisikoscenarioer: IRisikoscenario[]
  etterlevelseDokumentasjonId: string
  setRisikoscenarioer: (state: IRisikoscenario[]) => void
  risikoscenarioForKrav: IRisikoscenario[]
  setRisikoscenarioForKrav: (state: IRisikoscenario[]) => void
  tiltakList: ITiltak[]
  setTiltakList: (state: ITiltak[]) => void
  kravnummer: number
  setIsTiltakFormActive: (state: boolean) => void
  isCreateMode?: boolean
  noCopyButton?: boolean
  formRef: RefObject<any>
  etterlevelseDokumentasjon?: TEtterlevelseDokumentasjonQL
}

export const KravRisikoscenarioAccordionContent = (props: IProps) => {
  const {
    risikoscenario,
    risikoscenarioer,
    alleRisikoscenarioer,
    risikoscenarioForKrav,
    etterlevelseDokumentasjonId,
    kravnummer,
    setRisikoscenarioer,
    setRisikoscenarioForKrav,
    tiltakList,
    setTiltakList,
    isCreateMode,
    setIsTiltakFormActive,
    formRef,
    etterlevelseDokumentasjon,
  } = props
  const [activeRisikoscenario, setActiveRisikoscenario] = useState<IRisikoscenario>(risikoscenario)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [isCreateTiltakFormActive, setIsCreateTiltakFormActive] = useState<boolean>(false)
  const [isAddExistingMode, setIsAddExisitingMode] = useState<boolean>(false)

  const [isEditTiltakFormActive, setIsEditTiltakFormActive] = useState<boolean>(false)
  const [isIngenTilgangFormDirty, setIsIngenTilgangFormDirty] = useState<boolean>(false)

  const updateRisikoscenarioList = (updatedRisikoscenario: IRisikoscenario) => {
    setRisikoscenarioForKrav(
      risikoscenarioForKrav.map((risikoscenario) => {
        if (risikoscenario.id === updatedRisikoscenario.id) {
          return { ...updatedRisikoscenario }
        } else {
          return risikoscenario
        }
      })
    )
  }

  const submit = async (risikoscenario: IRisikoscenario) => {
    await updateRisikoscenario(risikoscenario).then((response) => {
      setActiveRisikoscenario(response)
      updateRisikoscenarioList(response)
      setIsEditModalOpen(false)
    })
  }

  const submitIngenTiltak = async (submitedValues: IRisikoscenario) => {
    await getRisikoscenario(risikoscenario.id).then((response) => {
      const updatedRisikoscenario = {
        ...submitedValues,
        ...response,
        ingenTiltak: submitedValues.ingenTiltak,
      }

      updateRisikoscenario(updatedRisikoscenario).then((response) => {
        setActiveRisikoscenario(response)
        updateRisikoscenarioList(response)
        setIsIngenTilgangFormDirty(false)
      })
    })
  }

  const submitCreateTiltak = async (submitedTiltakValues: ITiltak) => {
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
    await getTiltak(tiltakId).then(async (response) => {
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

  const userHasAccess = () => {
    return user.isAdmin() || etterlevelseDokumentasjon?.hasCurrentUserAccess || false
  }

  return (
    <div>
      <RisikoscenarioView
        risikoscenario={activeRisikoscenario}
        noCopyButton={true}
        etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
      />

      {!isIngenTilgangFormDirty &&
        !isCreateTiltakFormActive &&
        !isEditTiltakFormActive &&
        !isAddExistingMode &&
        !isCreateMode &&
        userHasAccess() && (
          <RedigerRisikoscenarioButtons
            setIsEditModalOpen={setIsEditModalOpen}
            kravnummer={kravnummer}
            risikoscenario={risikoscenario}
            risikoscenarioer={risikoscenarioer}
            setRisikoscenarioer={setRisikoscenarioer}
            risikoscenarioForKrav={risikoscenarioForKrav}
            setRisikoscenarioForKrav={setRisikoscenarioForKrav}
          />
        )}

      <div className="mt-12">
        <Heading level="3" size="small">
          Følgende tiltak gjelder for dette risikoscenarioet
        </Heading>

        {!risikoscenario.ingenTiltak && userHasAccess() && (
          <div>
            {risikoscenario.tiltakIds.length !== 0 && (
              <TiltakReadMoreList
                risikoscenario={activeRisikoscenario}
                risikoscenarioList={alleRisikoscenarioer}
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
                title="Opprett nytt tiltak"
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
                customSubmit={submitExistingTiltak}
                formRef={formRef}
              />
            )}

            {!isIngenTilgangFormDirty &&
              !isCreateTiltakFormActive &&
              !isEditTiltakFormActive &&
              !isAddExistingMode &&
              !isCreateMode && (
                <div className="mt-5 flex gap-2 lg:flex-row flex-col">
                  <Button
                    size="small"
                    type="button"
                    onClick={() => setIsCreateTiltakFormActive(true)}
                  >
                    Opprett nytt tiltak
                  </Button>
                  <Button
                    type="button"
                    size="small"
                    variant="secondary"
                    onClick={() => setIsAddExisitingMode(true)}
                  >
                    Legg til eksisterende tiltak
                  </Button>
                </div>
              )}
          </div>
        )}
        {!isCreateMode &&
          !isCreateTiltakFormActive &&
          !isEditTiltakFormActive &&
          !isAddExistingMode &&
          activeRisikoscenario.tiltakIds.length === 0 && (
            <div className="mt-3">
              <IngenTiltakField
                risikoscenario={activeRisikoscenario}
                submit={submitIngenTiltak}
                formRef={formRef}
                setIsIngenTilgangFormDirty={setIsIngenTilgangFormDirty}
              />
            </div>
          )}
      </div>

      {isEditModalOpen && (
        <RisikoscenarioModalForm
          headerText="Redigér øvirg risikoscenario"
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
