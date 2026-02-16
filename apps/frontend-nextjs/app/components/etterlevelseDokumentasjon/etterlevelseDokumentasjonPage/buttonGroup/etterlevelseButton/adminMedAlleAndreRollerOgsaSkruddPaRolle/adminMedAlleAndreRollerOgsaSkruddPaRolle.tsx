import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { EPvkDokumentStatus } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { FunctionComponent } from 'react'
import {
  CommonVariantTwo,
  EtterlevelseReadOnlyActionMenuVariant,
} from '../commonEtterlevelse/commonEtterlevelse'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
}

const test: string = EPvkDokumentStatus.VURDERT_AV_PVO

const AdminMedAlleAndreRollerOgsaSkruddPaRolle: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
}) => {
  switch (test) {
    case EPvkDokumentStatus.UNDERARBEID:
      return (
        <EtterlevelseReadOnlyActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        />
      )
    case EPvkDokumentStatus.TRENGER_GODKJENNING:
      return (
        <EtterlevelseReadOnlyActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        />
      )
    case EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER:
      return <CommonVariantTwo />
    case EPvkDokumentStatus.VURDERT_AV_PVO:
      return (
        <EtterlevelseReadOnlyActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        />
      )
    default:
      return <></>
  }
}

export default AdminMedAlleAndreRollerOgsaSkruddPaRolle
