import {
  EPVKTilstandStatus,
  EPvkDokumentStatus,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { FunctionComponent } from 'react'
import { CommonVariantOne } from '../commonEtterlevelse/commonEtterlevelse'
import { RisikoeierVariantOne } from '../commonEtterlevelse/risikoeierCommon'

// type TProps = {
//   etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
//   risikoscenarioList: IRisikoscenario[]
//   behandlingsLivslop?: IBehandlingensLivslop
//   pvkDokument?: IPvkDokument
//   isRisikoeier: boolean
// }

const test: string = EPVKTilstandStatus.TILSTAND_STATUS_ELEVEN

// EPVKTilstandStatus
// PVKTilstandStatusRolle

const RisikoeierRolle: FunctionComponent = (
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
      return <RisikoeierVariantOne />
    case EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER:
      return <CommonVariantOne />
    case EPvkDokumentStatus.VURDERT_AV_PVO:
      return <CommonVariantOne />
    default:
      return <></>
  }
}

export default RisikoeierRolle
