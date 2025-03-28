import { Dispatch, FunctionComponent, RefObject, SetStateAction } from 'react'
import { IRisikoscenario, ITiltak } from '../../../../constants'
import TiltakReadMoreList from '../../../tiltak/TiltakReadMoreList'
import RisikoscenarioView from '../../RisikoscenarioView'
import { RisikoscenarioTiltakHeader } from '../../common/KravRisikoscenarioHeaders'

type TProps = {
  activeRisikoscenario: IRisikoscenario
  risikoscenario: IRisikoscenario
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
  risikoscenario,
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
