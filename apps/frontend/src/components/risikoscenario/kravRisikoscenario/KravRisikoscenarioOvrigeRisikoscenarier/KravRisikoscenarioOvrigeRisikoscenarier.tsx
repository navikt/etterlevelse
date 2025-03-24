import { Button } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import { IPvkDokument } from '../../../../constants'

type TProps = {
  pvkDokument: IPvkDokument
}

export const KravRisikoscenarioOvrigeRisikoscenarier: FunctionComponent<TProps> = ({
  pvkDokument,
}) => {
  const navigate: NavigateFunction = useNavigate()

  return (
    <div className="mt-5">
      <Button
        variant="tertiary"
        type="button"
        onClick={() => {
          navigate(
            `/dokumentasjon/${pvkDokument.etterlevelseDokumentId}/pvkdokument/${pvkDokument.id}/4`
          )
        }}
      >
        Gå til liste over øvrige risikoscenarier
      </Button>
    </div>
  )
}
