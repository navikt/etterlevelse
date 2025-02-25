import { Alert, Heading } from '@navikt/ds-react'
import { RefObject, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateRisikoscenario } from '../../api/RisikoscenarioApi'
import { createTiltakAndRelasjonWithRisikoscenario } from '../../api/TiltakApi'
import { IRisikoscenario, ITiltak } from '../../constants'
import TiltakReadMoreList from '../tiltak/TiltakReadMoreList'
import LeggTilEksisterendeTiltak from '../tiltak/edit/LeggTilEksisterendeTiltak'
import TiltakForm from '../tiltak/edit/TiltakForm'
import RisikoscenarioView from './RisikoscenarioView'
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

export const RisikoscenarioAccordionContentReadonly = (props: IProps) => {
  const {
    risikoscenario,
    allRisikoscenarioList,
    tiltakList,
    setTiltakList,
    setIsTiltakFormActive,
    formRef,
  } = props
  const [activeRisikoscenario, setActiveRisikoscenario] = useState<IRisikoscenario>(risikoscenario)
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false)
  const [isCreateTiltakFormActive, setIsCreateTiltakFormActive] = useState<boolean>(false)
  const [isAddExistingMode, setIsAddExisitingMode] = useState<boolean>(false)

  const [isEditTiltakFormActive, setIsEditTiltakFormActive] = useState<boolean>(false)
  const navigate = useNavigate()

  const submit = async (risikoscenario: IRisikoscenario) => {
    await updateRisikoscenario(risikoscenario).then((response) => {
      setActiveRisikoscenario(response)
      setIsEditModalOpen(false)
      window.location.reload()
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

export default RisikoscenarioAccordionContentReadonly
