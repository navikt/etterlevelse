import {Heading} from "@navikt/ds-react";
import {IRisikoscenario, ITiltak} from "../../../constants";
import TiltakView from "../../tiltak/TiltakView";
import RisikoscenarioViewReadOnly from "../RisikoscenarioViewReadOnly";


interface IProps {
  risikoscenario: IRisikoscenario
  alleRisikoscenarioer: IRisikoscenario[]
  tiltakList: ITiltak[]
}

export const KravRisikoscenarioAccordionContentReadOnly = ({risikoscenario, alleRisikoscenarioer, tiltakList}: IProps) => (

  <div>
    <RisikoscenarioViewReadOnly risikoscenario={risikoscenario} noCopyButton={true}/>

    <div className="mt-12">
      <Heading level="3" size="small">
        Følgende tiltak gjelder for dette risikoscenarioet
      </Heading>

      <div>
        {tiltakList
          .filter((tiltak) => risikoscenario.tiltakIds.includes(tiltak.id))
          .map((tiltak, index) => {
            return (
              <div className="mt-3" key={risikoscenario.id + '_' + tiltak.id + '_' + index}>
                {!risikoscenario.ingenTiltak && (
                  <div>
                    {risikoscenario.tiltakIds.length !== 0 && (
                      <TiltakView tiltak={tiltak} risikoscenarioList={alleRisikoscenarioer}/>
                    )}

                  </div>
                )}
              </div>
            )
          })}
      </div>


      <div className="mt-3">
        ingenTiltak
      </div>

    </div>
  </div>
)

export default KravRisikoscenarioAccordionContentReadOnly

