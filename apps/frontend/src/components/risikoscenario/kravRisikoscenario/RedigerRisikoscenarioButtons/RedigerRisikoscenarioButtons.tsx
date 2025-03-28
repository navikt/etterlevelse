import { PencilIcon } from '@navikt/aksel-icons'
import { Button } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { IRisikoscenario } from '../../../../constants'
import FjernRisikoscenarioFraKrav from '../../edit/FjernRisikoscenarioFraKrav'

type TProps = {
  setIsEditModalOpen: (value: React.SetStateAction<boolean>) => void
  kravnummer: number
  risikoscenario: IRisikoscenario
  risikoscenarioer: IRisikoscenario[]
  setRisikoscenarioer: (state: IRisikoscenario[]) => void
  risikoscenarioForKrav: IRisikoscenario[]
  setRisikoscenarioForKrav: (state: IRisikoscenario[]) => void
}

export const RedigerRisikoscenarioButtons: FunctionComponent<TProps> = ({
  setIsEditModalOpen,
  kravnummer,
  risikoscenario,
  risikoscenarioer,
  setRisikoscenarioer,
  risikoscenarioForKrav,
  setRisikoscenarioForKrav,
}) => (
  <div className="mt-5">
    <Button
      variant="tertiary"
      type="button"
      icon={<PencilIcon aria-hidden />}
      onClick={() => setIsEditModalOpen(true)}
      className="mb-2"
    >
      Redigèr risikoscenario
    </Button>

    <FjernRisikoscenarioFraKrav
      kravnummer={kravnummer}
      risikoscenario={risikoscenario}
      risikoscenarioer={risikoscenarioer}
      setRisikoscenarioer={setRisikoscenarioer}
      risikoscenarioForKrav={risikoscenarioForKrav}
      setRisikoscenarioForKrav={setRisikoscenarioForKrav}
    />
  </div>
)

export default RedigerRisikoscenarioButtons
