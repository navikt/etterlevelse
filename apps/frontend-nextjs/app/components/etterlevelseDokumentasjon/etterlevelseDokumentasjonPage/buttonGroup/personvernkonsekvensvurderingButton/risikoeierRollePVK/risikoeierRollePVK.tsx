import { EPVKTilstandStatus } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { FunctionComponent } from 'react'
import {
  CommonVariantOnePVK,
  CommonVariantThreePVK,
  CommonVariantTwoPVK,
} from '../commonPVK/commonPVK'
import { RisikoeierVariantOnePVK, RisikoeierVariantTwoPVK } from '../commonPVK/risikoeierCommonPVK'

// type TProps = {
//   etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
//   risikoscenarioList: IRisikoscenario[]
//   behandlingsLivslop?: IBehandlingensLivslop
//   pvkDokument?: IPvkDokument
//   isRisikoeier: boolean
// }

const test: string = EPVKTilstandStatus.TILSTAND_STATUS_SEVEN

// EPVKTilstandStatus
// PVKTilstandStatusRolle

const RisikoeierRollePVK: FunctionComponent = (
  {
    //   etterlevelseDokumentasjon,
    //   behandlingsLivslop,
    //   pvkDokument,
    //   risikoscenarioList,
    //   isRisikoeier,
  }
) => {
  switch (test) {
    case EPVKTilstandStatus.TILSTAND_STATUS_ONE:
      return <CommonVariantOnePVK />
    case EPVKTilstandStatus.TILSTAND_STATUS_TWO:
      return <CommonVariantOnePVK />
    case EPVKTilstandStatus.TILSTAND_STATUS_THREE:
      return <CommonVariantOnePVK />
    case EPVKTilstandStatus.TILSTAND_STATUS_FOUR:
      return <CommonVariantTwoPVK />
    case EPVKTilstandStatus.TILSTAND_STATUS_FIVE:
      return <CommonVariantTwoPVK />
    case EPVKTilstandStatus.TILSTAND_STATUS_SIX:
      return <CommonVariantTwoPVK />
    case EPVKTilstandStatus.TILSTAND_STATUS_SEVEN:
      return <CommonVariantTwoPVK />
    case EPVKTilstandStatus.TILSTAND_STATUS_EIGHT:
      return <RisikoeierVariantOnePVK />
    case EPVKTilstandStatus.TILSTAND_STATUS_NINE:
      return <RisikoeierVariantTwoPVK />
    case EPVKTilstandStatus.TILSTAND_STATUS_TEN:
      return <CommonVariantThreePVK />
    default:
      return <></>
  }
}

export default RisikoeierRollePVK
