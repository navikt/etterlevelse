import { Link } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
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
  return (
    <div className='mt-5 gap-2.5'>
      <Link
        type='button'
        href={
          pvoLink && user.isPersonvernombud()
            ? pvkDokumenteringPvoTilbakemeldingUrl(pvkDokument.id, 6)
            : pvkDokumentasjonStepUrl(pvkDokument.etterlevelseDokumentId, pvkDokument.id, 6)
        }
      >
        Gå til PVK: Identifisering av risikoscenarier og tiltak
      </Link>
      <Link
        className='mt-2'
        href={etterlevelseDokumentasjonPvkTabUrl(pvkDokument.etterlevelseDokumentId)}
      >
        Gå til liste over alle PVK-relaterte krav i Temaoversikt.
      </Link>
    </div>
  )
}
