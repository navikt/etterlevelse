import { PencilIcon } from '@navikt/aksel-icons'
import { Alert, Button } from '@navikt/ds-react'
import { FunctionComponent, RefObject, useEffect, useState } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import { getPvkDokument } from '../../api/PvkDokumentApi'
import { getRisikoscenario, updateRisikoscenario } from '../../api/RisikoscenarioApi'
import { createTiltakAndRelasjonWithRisikoscenario } from '../../api/TiltakApi'
import { IRisikoscenario, ITiltak } from '../../constants'
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
  setRisikoscenarioer: (state: IRisikoscenario[]) => void
  setIsTiltakFormActive: (state: boolean) => void
  formRef: RefObject<any>
}

export const RisikoscenarioAccordionContent: FunctionComponent<TProps> = ({
  risikoscenario,
  risikoscenarioer,
  allRisikoscenarioList,
  tiltakList,
  etterlevelseDokumentasjonId,
  setTiltakList,
  setRisikoscenarioer,
  setIsTiltakFormActive,
  formRef,
}) => {
  const navigate: NavigateFunction = useNavigate()
  const [activeRisikoscenario, setActiveRisikoscenario] = useState<IRisikoscenario>(risikoscenario)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [isCreateTiltakFormActive, setIsCreateTiltakFormActive] = useState<boolean>(false)
  const [isAddExistingMode, setIsAddExisitingMode] = useState<boolean>(false)

  const [isEditTiltakFormActive, setIsEditTiltakFormActive] = useState<boolean>(false)
  const [isIngenTilgangFormDirty, setIsIngenTilgangFormDirty] = useState<boolean>(false)

  const [isPvoAlertModalOpen, setIsPvoAlertModalOpen] = useState<boolean>(false)

  const submit = async (risikoscenario: IRisikoscenario): Promise<void> => {
    await updateRisikoscenario(risikoscenario).then((response: IRisikoscenario) => {
      setActiveRisikoscenario(response)
      setIsEditModalOpen(false)
      window.location.reload()
    })
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
        window.location.reload()
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
      setTiltakList([...tiltakList, response])
      setIsCreateTiltakFormActive(false)

      navigate(risikoscenarioTiltakUrl(activeRisikoscenario.id, response.id))
      window.location.reload()
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

  return (
    <div>
      <RisikoscenarioView
        risikoscenario={activeRisikoscenario}
        noCopyButton={false}
        etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
        stepUrl='5'
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
                <Alert className='mt-5 mb-9' variant='warning'>
                  Dere har ikke lagt inn tiltak
                </Alert>
              )}

            {risikoscenario.tiltakIds.length !== 0 && (
              <TiltakReadMoreList
                risikoscenario={risikoscenario}
                risikoscenarioList={allRisikoscenarioList}
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

        {!isCreateTiltakFormActive &&
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
