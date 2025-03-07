import { PencilIcon } from '@navikt/aksel-icons'
import { Button } from '@navikt/ds-react'
import { IRisikoscenario } from '../../../../constants'
import FjernRisikoscenarioFraKrav from '../../edit/FjernRisikoscenarioFraKrav'

interface IProps {
  setIsEditModalOpen: (value: React.SetStateAction<boolean>) => void
  kravnummer: number
  risikoscenario: IRisikoscenario
  risikoscenarioer: IRisikoscenario[]
  setRisikoscenarioer: (state: IRisikoscenario[]) => void
  risikoscenarioForKrav: IRisikoscenario[]
  setRisikoscenarioForKrav: (state: IRisikoscenario[]) => void
}

export const RedigerRisikoscenarioButtons = (props: IProps) => {
  const {
    setIsEditModalOpen,
    kravnummer,
    risikoscenario,
    risikoscenarioer,
    setRisikoscenarioer,
    risikoscenarioForKrav,
    setRisikoscenarioForKrav,
  } = props

  return (
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
}

export default RedigerRisikoscenarioButtons
