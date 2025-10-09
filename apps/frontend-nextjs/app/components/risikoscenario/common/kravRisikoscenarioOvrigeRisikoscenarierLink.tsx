'use client'

import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { UserContext } from '@/provider/user/userProvider'
import {
  etterlevelseDokumentasjonPvkTabUrl,
  pvkDokumentasjonStepUrl,
  pvkDokumenteringPvoTilbakemeldingUrl,
} from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { Link } from '@navikt/ds-react'
import { FunctionComponent, useContext } from 'react'

type TProps = {
  pvkDokument: IPvkDokument
  pvoLink?: boolean
}

export const KravRisikoscenarioOvrigeRisikoscenarierLink: FunctionComponent<TProps> = ({
  pvkDokument,
  pvoLink,
}) => {
  const user = useContext(UserContext)
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
