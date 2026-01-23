import { EPVKTilstandStatus } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { FunctionComponent } from 'react'
import {
  CommonVariantFive,
  CommonVariantFour,
  CommonVariantSeven,
  CommonVariantSix,
} from '../commonPVK/commonPVK'
import {
  EtterleverVariantOne,
  EtterleverVariantThree,
  EtterleverVariantTwo,
} from '../commonPVK/etterleverCommonPVK'

// type TProps = {
//   etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
//   risikoscenarioList: IRisikoscenario[]
//   behandlingsLivslop?: IBehandlingensLivslop
//   pvkDokument?: IPvkDokument
//   isRisikoeier: boolean
// }

const test: string = EPVKTilstandStatus.TILSTAND_STATUS_TEN

// EPVKTilstandStatus
// PVKTilstandStatusRolle

const EtterleverRolle: FunctionComponent = (
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
      return <CommonVariantFour />
    case EPVKTilstandStatus.TILSTAND_STATUS_TWO:
      return <EtterleverVariantOne />
    case EPVKTilstandStatus.TILSTAND_STATUS_THREE:
      return <EtterleverVariantTwo />
    case EPVKTilstandStatus.TILSTAND_STATUS_FOUR:
      return <CommonVariantFive />
    case EPVKTilstandStatus.TILSTAND_STATUS_FIVE:
      return <CommonVariantSix />
    case EPVKTilstandStatus.TILSTAND_STATUS_SIX:
      return <CommonVariantSeven />
    case EPVKTilstandStatus.TILSTAND_STATUS_SEVEN:
      return <CommonVariantSix />
    case EPVKTilstandStatus.TILSTAND_STATUS_EIGHT:
      return <CommonVariantSix />
    case EPVKTilstandStatus.TILSTAND_STATUS_NINE:
      return <EtterleverVariantThree />
    case EPVKTilstandStatus.TILSTAND_STATUS_TEN:
      return <CommonVariantFive />
    case EPVKTilstandStatus.TILSTAND_STATUS_ELEVEN:
      return <CommonVariantSix />
    default:
      return <></>
  }
}

export default EtterleverRolle
