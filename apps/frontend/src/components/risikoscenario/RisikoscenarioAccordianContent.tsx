import { PencilIcon } from '@navikt/aksel-icons'
import { Alert, Button, Heading } from '@navikt/ds-react'
import { RefObject, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRisikoscenario, updateRisikoscenario } from '../../api/RisikoscenarioApi'
import { createTiltakAndRelasjonWithRisikoscenario } from '../../api/TiltakApi'
import { IRisikoscenario, ITiltak } from '../../constants'
import TiltakReadMoreList from '../tiltak/TiltakReadMoreList'
import LeggTilEksisterendeTiltak from '../tiltak/edit/LeggTilEksisterendeTiltak'
import TiltakForm from '../tiltak/edit/TiltakForm'
import RisikoscenarioView from './RisikoscenarioView'
import SlettOvrigRisikoscenario from './SlettOvrigRisikoscenario'
import IngenTiltakField from './edit/IngenTiltakField'
import RisikoscenarioModalForm from './edit/RisikoscenarioModalForm'

interface IProps {
  risikoscenario: IRisikoscenario
  risikoscenarioer: IRisikoscenario[]
  allRisikoscenarioList: IRisikoscenario[]
  tiltakList: ITiltak[]
  setTiltakList: (state: ITiltak[]) => void
  setRisikoscenarioer: (state: IRisikoscenario[]) => void
  setIsTiltakFormActive: (state: boolean) => void
  formRef: RefObject<any>
}

export const RisikoscenarioAccordionContent = (props: IProps) => {
  const {
    risikoscenario,
    risikoscenarioer,
    allRisikoscenarioList,
    tiltakList,
    setTiltakList,
    setRisikoscenarioer,
    setIsTiltakFormActive,
    formRef,
  } = props
  const [activeRisikoscenario, setActiveRisikoscenario] = useState<IRisikoscenario>(risikoscenario)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [isCreateTiltakFormActive, setIsCreateTiltakFormActive] = useState<boolean>(false)
  const [isAddExistingMode, setIsAddExisitingMode] = useState<boolean>(false)

  const [isEditTiltakFormActive, setIsEditTiltakFormActive] = useState<boolean>(false)
  const [isIngenTilgangFormDirty, setIsIngenTilgangFormDirty] = useState<boolean>(false)
  const navigate = useNavigate()

  const submit = async (risikoscenario: IRisikoscenario) => {
    await updateRisikoscenario(risikoscenario).then((response) => {
      setActiveRisikoscenario(response)
      setIsEditModalOpen(false)
      window.location.reload()
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
        window.location.reload()
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
      setTiltakList([...tiltakList, response])
      setIsCreateTiltakFormActive(false)
      navigate(
        `${window.location.pathname}?risikoscenario=${activeRisikoscenario.id}&tiltak=${response.id}`
      )
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

  return (
    <div>
      <RisikoscenarioView risikoscenario={activeRisikoscenario} noCopyButton={false} />

      {!isIngenTilgangFormDirty &&
        !isCreateTiltakFormActive &&
        !isEditTiltakFormActive &&
        !isAddExistingMode && (
          <div className="mt-12 flex gap-2 items-center">
            <Button
              variant="tertiary"
              type="button"
              icon={<PencilIcon aria-hidden />}
              onClick={() => setIsEditModalOpen(true)}
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

      <div className="mt-12">
        <Heading level="3" size="small">
          Følgende tiltak gjelder for dette risikoscenarioet
        </Heading>
        {!risikoscenario.ingenTiltak && (
          <div>
            {risikoscenario.tiltakIds.length === 0 &&
              !isCreateTiltakFormActive &&
              !isEditTiltakFormActive && (
                <Alert className="mt-5 mb-9" variant="warning">
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
                formRef={formRef}
              />
            )}

            {!isIngenTilgangFormDirty &&
              !isCreateTiltakFormActive &&
              !isEditTiltakFormActive &&
              !isAddExistingMode && (
                <div className="mt-5 flex gap-2">
                  <Button
                    type="button"
                    onClick={() => {
                      setIsCreateTiltakFormActive(true)

                      setIsTiltakFormActive(true)
                    }}
                  >
                    Opprett nytt tiltak
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setIsAddExisitingMode(true)
                      setIsTiltakFormActive(true)
                    }}
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
            <div className="mt-3">
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
export default RisikoscenarioAccordionContent
