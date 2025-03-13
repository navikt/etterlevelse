import { Dispatch, RefObject, SetStateAction } from 'react'
import { IRisikoscenario, ITiltak, ITiltakRisikoscenarioRelasjon } from '../../../../constants'
import TiltakReadMoreList from '../../../tiltak/TiltakReadMoreList'
import LeggTilEksisterendeTiltak from '../../../tiltak/edit/LeggTilEksisterendeTiltak'
import TiltakForm from '../../../tiltak/edit/TiltakForm'
import RisikoscenarioView from '../../RisikoscenarioView'
import KravRisikoscenarioAccordionContentHeader from './KravRisikoscenarioAccordionContentHeader'

interface IProps {
  activeRisikoscenario: IRisikoscenario
  userHasAccess: () => boolean
  risikoscenario: IRisikoscenario
  alleRisikoscenarioer: IRisikoscenario[]
  tiltakList: ITiltak[]
  setTiltakList: (state: ITiltak[]) => void
  setIsEditTiltakFormActive: Dispatch<SetStateAction<boolean>>
  isCreateTiltakFormActive: boolean
  isAddExistingMode: boolean
  submitDeleteTiltak: (tiltakId: string) => Promise<void>
  formRef: RefObject<any>
  setIsCreateTiltakFormActive: (value: SetStateAction<boolean>) => void
  setIsAddExisitingMode: (value: SetStateAction<boolean>) => void
  submitCreateTiltak: (submitedTiltakValues: ITiltak) => Promise<void>
  submitExistingTiltak: (request: ITiltakRisikoscenarioRelasjon) => Promise<void>
}

export const KravRisikoscenarioAccordionContentEditMode = (props: IProps) => {
  const {
    activeRisikoscenario,
    userHasAccess,
    risikoscenario,
    alleRisikoscenarioer,
    tiltakList,
    setTiltakList,
    setIsEditTiltakFormActive,
    isCreateTiltakFormActive,
    isAddExistingMode,
    submitDeleteTiltak,
    formRef,
    setIsCreateTiltakFormActive,
    setIsAddExisitingMode,
    submitCreateTiltak,
    submitExistingTiltak,
  } = props

  return (
    <div>
      <RisikoscenarioView risikoscenario={activeRisikoscenario} noCopyButton={true} />

      <div className="mt-12">
        <KravRisikoscenarioAccordionContentHeader />

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
          </div>
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
      </div>
    </div>
  )
}
