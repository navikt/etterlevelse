import { Alert, BodyLong, ReadMore } from '@navikt/ds-react'
import { RefObject, useState } from 'react'
import { IRisikoscenario, ITiltak } from '../../../constants'
import { user } from '../../../services/User'
import TiltakView from '../../tiltak/TiltakView'
import RisikoscenarioView from '../RisikoscenarioView'
import { RisikoscenarioTiltakHeader } from '../common/KravRisikoscenarioHeaders'
import VurdereTiltaksEffekt from '../edit/VurdereTiltaksEffekt'

interface IProps {
  risikoscenario: IRisikoscenario
  risikoscenarioList: IRisikoscenario[]
  setRisikosenarioList: (state: IRisikoscenario[]) => void
  allRisikoscenarioList: IRisikoscenario[]
  setAllRisikoscenarioList: (state: IRisikoscenario[]) => void
  tiltakList: ITiltak[]
  formRef: RefObject<any>
}

export const OppsumeringAccordianContent = (props: IProps) => {
  const {
    risikoscenario,
    risikoscenarioList,
    setRisikosenarioList,
    allRisikoscenarioList,
    setAllRisikoscenarioList,
    tiltakList,
    formRef,
  } = props
  const [activeRisikoscenario, setActiveRisikoscenario] = useState<IRisikoscenario>(risikoscenario)

  return (
    <div>
      <RisikoscenarioView risikoscenario={activeRisikoscenario} />

      {(!user.isPersonvernombud() || user.isAdmin()) && (
        <div className="mt-12">
          <RisikoscenarioTiltakHeader />

          {risikoscenario.ingenTiltak && <BodyLong>Vi skal ikke ha tiltak.</BodyLong>}

          {!risikoscenario.ingenTiltak && risikoscenario.tiltakIds.length !== 0 && (
            <div className="mt-5">
              {tiltakList
                .filter((tiltak) => risikoscenario.tiltakIds.includes(tiltak.id))
                .map((tiltak, index) => (
                  <ReadMore
                    key={risikoscenario.id + '_' + tiltak.id + '_' + index}
                    header={tiltak.navn}
                    className="mb-3"
                  >
                    <TiltakView tiltak={tiltak} risikoscenarioList={allRisikoscenarioList} />
                  </ReadMore>
                ))}
            </div>
          )}

          {!risikoscenario.ingenTiltak && risikoscenario.tiltakIds.length === 0 && (
            <div className="mt-5">
              <Alert className="mt-3" variant="warning">
                Dere må legge inn tiltak under Identifisering av risikoscenarioer og tiltak.
              </Alert>
            </div>
          )}

          {!risikoscenario.ingenTiltak && (
            <div className="mt-5">
              {risikoscenario.tiltakIds.length !== 0 && (
                <div>
                  <VurdereTiltaksEffekt
                    risikoscenario={activeRisikoscenario}
                    setRisikoscenario={setActiveRisikoscenario}
                    risikoscenarioList={risikoscenarioList}
                    setRisikosenarioList={setRisikosenarioList}
                    allRisikoscenarioList={allRisikoscenarioList}
                    setAllRisikoscenarioList={setAllRisikoscenarioList}
                    formRef={formRef}
                  />
                </div>
              )}

              {risikoscenario.tiltakIds.length === 0 && (
                <Alert className="mt-3" variant="warning">
                  Før dere kan vurdere tiltakenes effekt, må dere legge inn tiltak under
                  Identifisering av risikoscenarioer og tiltak.
                </Alert>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
export default OppsumeringAccordianContent
