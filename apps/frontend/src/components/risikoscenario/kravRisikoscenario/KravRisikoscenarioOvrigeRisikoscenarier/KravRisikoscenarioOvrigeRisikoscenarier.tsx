import { Button } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import { IPvkDokument } from '../../../../constants'
import { user } from '../../../../services/User'

type TProps = {
  pvkDokument: IPvkDokument
  pvoLink?: boolean
}

export const KravRisikoscenarioOvrigeRisikoscenarier: FunctionComponent<TProps> = ({
  pvkDokument,
  pvoLink,
}) => {
  const navigate: NavigateFunction = useNavigate()

  return (
    <div className='mt-5'>
      <Button
        variant='tertiary'
        type='button'
        onClick={() => {
          if (pvoLink && user.isPersonvernombud()) {
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
