import { Button } from '@navikt/ds-react'
import { useNavigate } from 'react-router-dom'
import { IPvkDokument } from '../../../../constants'
import { user } from '../../../../services/User'

interface IProps {
  pvkDokument: IPvkDokument
}

export const KravRisikoscenarioOvrigeRisikoscenarier = ({ pvkDokument }: IProps) => {
  const navigate = useNavigate()

  return (
    <div className="mt-5">
      <Button
        variant="tertiary"
        type="button"
        onClick={() => {
          if (user.isPersonvernombud()) {
            navigate(`/pvkdokument/${pvkDokument.id}/pvotilbakemelding/5`)
          } else {
            navigate(
              `/dokumentasjon/${pvkDokument.etterlevelseDokumentId}/pvkdokument/${pvkDokument.id}/5`
            )
          }
        }}
      >
        Gå til liste over øvrige risikoscenarier
      </Button>
    </div>
  )
}
