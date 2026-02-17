import { EPVKTilstandStatus } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { FunctionComponent } from 'react'
import {
  PvkIkkePabegyntActionMenuVariant,
  PvkOppdatertEtterNyVersjonActionMenuVariant,
  PvkPabegyntActionMenuVariant,
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
      return <PvkIkkePabegyntActionMenuVariant />
    case EPVKTilstandStatus.TILSTAND_STATUS_TWO:
      return <PvkIkkePabegyntActionMenuVariant />
    case EPVKTilstandStatus.TILSTAND_STATUS_THREE:
      return <PvkIkkePabegyntActionMenuVariant />
    case EPVKTilstandStatus.TILSTAND_STATUS_FOUR:
      return <PvkPabegyntActionMenuVariant />
    case EPVKTilstandStatus.TILSTAND_STATUS_FIVE:
      return <PvkPabegyntActionMenuVariant />
    case EPVKTilstandStatus.TILSTAND_STATUS_SIX:
      return <PvkPabegyntActionMenuVariant />
    case EPVKTilstandStatus.TILSTAND_STATUS_SEVEN:
      return <PvkPabegyntActionMenuVariant />
    case EPVKTilstandStatus.TILSTAND_STATUS_EIGHT:
      return <RisikoeierVariantOnePVK />
    case EPVKTilstandStatus.TILSTAND_STATUS_NINE:
      return <RisikoeierVariantTwoPVK />
    case EPVKTilstandStatus.TILSTAND_STATUS_TEN:
      return <PvkOppdatertEtterNyVersjonActionMenuVariant />
    default:
      return <></>
  }
}

export default RisikoeierRollePVK
