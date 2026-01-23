import { EPVKTilstandStatus } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { FunctionComponent } from 'react'
import { CommonVariantOne, CommonVariantThree, CommonVariantTwo } from '../commonPVK/commonPVK'
import { RisikoeierVariantOne, RisikoeierVariantTwo } from '../commonPVK/risikoeierCommonPVK'

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
    case EPVKTilstandStatus.TILSTAND_STATUS_ONE:
      return <CommonVariantOne />
    case EPVKTilstandStatus.TILSTAND_STATUS_TWO:
      return <CommonVariantOne />
    case EPVKTilstandStatus.TILSTAND_STATUS_THREE:
      return <CommonVariantOne />
    case EPVKTilstandStatus.TILSTAND_STATUS_FOUR:
      return <CommonVariantTwo />
    case EPVKTilstandStatus.TILSTAND_STATUS_FIVE:
      return <CommonVariantTwo />
    case EPVKTilstandStatus.TILSTAND_STATUS_SIX:
      return <CommonVariantTwo />
    case EPVKTilstandStatus.TILSTAND_STATUS_SEVEN:
      return <CommonVariantTwo />
    case EPVKTilstandStatus.TILSTAND_STATUS_EIGHT:
      return <RisikoeierVariantOne />
    case EPVKTilstandStatus.TILSTAND_STATUS_NINE:
      return <RisikoeierVariantTwo />
    case EPVKTilstandStatus.TILSTAND_STATUS_TEN:
      return <CommonVariantThree />
    case EPVKTilstandStatus.TILSTAND_STATUS_ELEVEN:
      return <RisikoeierVariantOne />
    default:
      return <></>
  }
}

export default RisikoeierRolle
