import { Button } from '@navikt/ds-react'
import { Dispatch, RefObject, SetStateAction } from 'react'
import { IRisikoscenario, ITiltak } from '../../../../constants'
import TiltakReadMoreList from '../../../tiltak/TiltakReadMoreList'
import RisikoscenarioView from '../../RisikoscenarioView'
import IngenTiltakField from '../../edit/IngenTiltakField'
import RedigerRisikoscenarioButtons from '../RedigerRisikoscenarioButtons/RedigerRisikoscenarioButtons'
import KravRisikoscenarioAccordionContentHeader from './KravRisikoscenarioAccordionContentHeader'

interface IProps {
  activeRisikoscenario: IRisikoscenario
  isIngenTilgangFormDirty: boolean
  userHasAccess: () => boolean
  setIsEditModalOpen: Dispatch<SetStateAction<boolean>>
  kravnummer: number
  risikoscenario: IRisikoscenario
  risikoscenarioer: IRisikoscenario[]
  setRisikoscenarioer: (state: IRisikoscenario[]) => void
  risikoscenarioForKrav: IRisikoscenario[]
  setRisikoscenarioForKrav: (state: IRisikoscenario[]) => void
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
  submitIngenTiltak: (submitedValues: IRisikoscenario) => Promise<void>
  setIsIngenTilgangFormDirty: React.Dispatch<React.SetStateAction<boolean>>
}

export const KravRisikoscenarioAccordionContentLimitedReadonly = (props: IProps) => {
  const {
    activeRisikoscenario,
    isIngenTilgangFormDirty,
    userHasAccess,
    setIsEditModalOpen,
    kravnummer,
    risikoscenario,
    risikoscenarioer,
    setRisikoscenarioer,
    risikoscenarioForKrav,
    setRisikoscenarioForKrav,
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
    submitIngenTiltak,
    setIsIngenTilgangFormDirty,
  } = props
  return (
    <div>
      <RisikoscenarioView risikoscenario={activeRisikoscenario} noCopyButton={true} />

      {!isIngenTilgangFormDirty && userHasAccess() && (
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

            {!isIngenTilgangFormDirty && (
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

        {activeRisikoscenario.tiltakIds.length === 0 && (
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
    </div>
  )
}
