import { FunctionComponent } from 'react'
import { IRisikoscenario, ITiltak } from '../../../../constants'
import TiltakView from '../../../tiltak/TiltakView'
import RisikoscenarioViewReadOnly from '../../RisikoscenarioViewReadOnly'
import { RisikoscenarioTiltakHeader } from '../../common/KravRisikoscenarioHeaders'
import KravRisikoscenarioIngenTiltak from '../KravRisikoscenarioIngenTiltak/KravRisikoscenarioIngenTiltak'

type TProps = {
  risikoscenario: IRisikoscenario
  alleRisikoscenarioer: IRisikoscenario[]
  tiltakList: ITiltak[]
}

export const KravRisikoscenarioAccordionContentReadOnly: FunctionComponent<TProps> = ({
  risikoscenario,
  alleRisikoscenarioer,
  tiltakList,
}) => {
  const filterTiltakId: ITiltak[] = tiltakList.filter((tiltak: ITiltak) =>
    risikoscenario.tiltakIds.includes(tiltak.id)
  )

  return (
    <div>
      <RisikoscenarioViewReadOnly risikoscenario={risikoscenario} noCopyButton={true} />

      <div className="mt-12">
        <RisikoscenarioTiltakHeader />

        <div>
          {filterTiltakId.map((tiltak: ITiltak, index: number) => (
            <div className="mt-3" key={risikoscenario.id + '_' + tiltak.id + '_' + index}>
              {!risikoscenario.ingenTiltak && (
                <div>
                  {risikoscenario.tiltakIds.length !== 0 && (
                    <TiltakView tiltak={tiltak} risikoscenarioList={alleRisikoscenarioer} />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <KravRisikoscenarioIngenTiltak risikoscenario={risikoscenario} />
      </div>
    </div>
  )
}

export default KravRisikoscenarioAccordionContentReadOnly
