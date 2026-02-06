import { EPvkDokumentStatus } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { FunctionComponent } from 'react'
import { CommonVariantOne, CommonVariantTwo } from '../commonEtterlevelse/commonEtterlevelse'

// type TProps = {
//   etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
//   risikoscenarioList: IRisikoscenario[]
//   behandlingsLivslop?: IBehandlingensLivslop
//   pvkDokument?: IPvkDokument
//   isRisikoeier: boolean
// }

const test: string = EPvkDokumentStatus.VURDERT_AV_PVO

// EPVKTilstandStatus
// PVKTilstandStatusRolle

const AdminMedAlleAndreRollerOgsaSkruddPaRolle: FunctionComponent = (
  {
    //   etterlevelseDokumentasjon,
    //   behandlingsLivslop,
    //   pvkDokument,
    //   risikoscenarioList,
    //   isRisikoeier,
  }
) => {
  switch (test) {
    case EPvkDokumentStatus.UNDERARBEID:
      return <CommonVariantOne />
    case EPvkDokumentStatus.TRENGER_GODKJENNING:
      return <CommonVariantOne />
    case EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER:
      return <CommonVariantTwo />
    case EPvkDokumentStatus.VURDERT_AV_PVO:
      return <CommonVariantOne />
    default:
      return <></>
  }
}

export default AdminMedAlleAndreRollerOgsaSkruddPaRolle
