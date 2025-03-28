import { Dispatch, FunctionComponent, RefObject, SetStateAction } from 'react'
import { IRisikoscenario, ITiltak } from '../../../../constants'
import TiltakReadMoreList from '../../../tiltak/TiltakReadMoreList'
import RisikoscenarioView from '../../RisikoscenarioView'
import { RisikoscenarioTiltakHeader } from '../../common/KravRisikoscenarioHeaders'
import RedigerRisikoscenarioButtons from '../RedigerRisikoscenarioButtons/RedigerRisikoscenarioButtons'

type TProps = {
  activeRisikoscenario: IRisikoscenario
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
  etterlevelseDokumentasjonId: string
  submitDeleteTiltak: (tiltakId: string) => Promise<void>
  formRef: RefObject<any>
}

export const KravRisikoscenarioAccordionContentLimitedReadonly: FunctionComponent<TProps> = ({
  activeRisikoscenario,
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
  etterlevelseDokumentasjonId,
  setTiltakList,
  setIsEditTiltakFormActive,
  isCreateTiltakFormActive,
  isAddExistingMode,
  submitDeleteTiltak,
  formRef,
}) => (
  <div>
    <RisikoscenarioView
      risikoscenario={activeRisikoscenario}
      noCopyButton={true}
      etterlevelseDokumentasjonId={etterlevelseDokumentasjonId}
      stepUrl="0"
    />

    {userHasAccess() && (
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
      <RisikoscenarioTiltakHeader />

      {!risikoscenario.ingenTiltak && (
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
    </div>
  </div>
)

export default KravRisikoscenarioAccordionContentLimitedReadonly
