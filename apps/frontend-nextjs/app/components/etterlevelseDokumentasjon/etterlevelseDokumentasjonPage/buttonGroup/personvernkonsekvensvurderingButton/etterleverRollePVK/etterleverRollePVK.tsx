import { EPVKTilstandStatus } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { FunctionComponent } from 'react'
import {
  CommonVariantFivePVK,
  CommonVariantFourPVK,
  CommonVariantSevenPVK,
  CommonVariantSixPVK,
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

const EtterleverRollePVK: FunctionComponent = (
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
      return <CommonVariantFourPVK />
    case EPVKTilstandStatus.TILSTAND_STATUS_TWO:
      return <EtterleverVariantOne />
    case EPVKTilstandStatus.TILSTAND_STATUS_THREE:
      return <EtterleverVariantTwo />
    case EPVKTilstandStatus.TILSTAND_STATUS_FOUR:
      return <CommonVariantFivePVK />
    case EPVKTilstandStatus.TILSTAND_STATUS_FIVE:
      return <CommonVariantSixPVK />
    case EPVKTilstandStatus.TILSTAND_STATUS_SIX:
      return <CommonVariantSevenPVK />
    case EPVKTilstandStatus.TILSTAND_STATUS_SEVEN:
      return <CommonVariantSixPVK />
    case EPVKTilstandStatus.TILSTAND_STATUS_EIGHT:
      return <CommonVariantSixPVK />
    case EPVKTilstandStatus.TILSTAND_STATUS_NINE:
      return <EtterleverVariantThree />
    case EPVKTilstandStatus.TILSTAND_STATUS_TEN:
      return <CommonVariantFivePVK />
    case EPVKTilstandStatus.TILSTAND_STATUS_ELEVEN:
      return <CommonVariantSixPVK />
    default:
      return <></>
  }
}

export default EtterleverRollePVK
