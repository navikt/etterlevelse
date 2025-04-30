import { Button, Link } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import { IPvkDokument } from '../../../../constants'
import { user } from '../../../../services/User'
import {
  etterlevelseDokumentasjonPvkTabUrl,
  pvkDokumentasjonStepUrl,
  pvkDokumenteringPvoTilbakemeldingUrl,
} from '../../../common/RouteLinkPvk'

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
            navigate(pvkDokumenteringPvoTilbakemeldingUrl(pvkDokument.id, 5))
          } else {
            navigate(pvkDokumentasjonStepUrl(pvkDokument.etterlevelseDokumentId, pvkDokument.id, 5))
          }
        }}
      >
        Gå til liste over øvrige risikoscenarier
      </Button>
      <Link href={etterlevelseDokumentasjonPvkTabUrl(pvkDokument.etterlevelseDokumentId)}>
        Tilbake til liste over alle PVK-relaterte krav
      </Link>
      <Link href={pvkDokumentasjonStepUrl(pvkDokument.etterlevelseDokumentId, pvkDokument.id, 1)}>
        Tilbake til PVK-oversikt
      </Link>
    </div>
  )
}
