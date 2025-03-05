import { Heading } from '@navikt/ds-react'
import { IRisikoscenario, ITiltak } from '../../../constants'
import TiltakView from '../../tiltak/TiltakView'
import RisikoscenarioViewReadOnly from '../RisikoscenarioViewReadOnly'
import KravRisikoscenarioIngenTiltak from './KravRisikoscenarioIngenTiltak/KravRisikoscenarioIngenTiltak'

interface IProps {
  risikoscenario: IRisikoscenario
  alleRisikoscenarioer: IRisikoscenario[]
  tiltakList: ITiltak[]
}

export const KravRisikoscenarioAccordionContentReadOnly = ({
  risikoscenario,
  alleRisikoscenarioer,
  tiltakList,
}: IProps) => {
  const filterTiltakId: ITiltak[] = tiltakList.filter((tiltak: ITiltak) =>
    risikoscenario.tiltakIds.includes(tiltak.id)
  )

  return (
    <div>
      <RisikoscenarioViewReadOnly risikoscenario={risikoscenario} noCopyButton={true} />

      <div className="mt-12">
        <Heading level="3" size="small">
          Følgende tiltak gjelder for dette risikoscenarioet
        </Heading>

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
