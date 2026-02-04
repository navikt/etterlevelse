import { EPVKTilstandStatus } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { FunctionComponent } from 'react'
import {
  AdminMedAlleAndreRollerOgsaSkruddPaVariantOne,
  AdminMedAlleAndreRollerOgsaSkruddPaVariantThree,
  AdminMedAlleAndreRollerOgsaSkruddPaVariantTwo,
} from '../commonPVK/adminMedAlleAndreRollerOgsaSkruddPaCommonPVK'
import {
  CommonVariantFivePVK,
  CommonVariantFourPVK,
  CommonVariantSevenPVK,
  CommonVariantSixPVK,
} from '../commonPVK/commonPVK'

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

const AdminMedAlleAndreRollerOgsaSkruddPaRollePVK: FunctionComponent = (
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
      return <CommonVariantFourPVK />
    case EPVKTilstandStatus.TILSTAND_STATUS_THREE:
      return <AdminMedAlleAndreRollerOgsaSkruddPaVariantOne />
    case EPVKTilstandStatus.TILSTAND_STATUS_FOUR:
      return <CommonVariantFivePVK />
    case EPVKTilstandStatus.TILSTAND_STATUS_FIVE:
      return <CommonVariantSixPVK />
    case EPVKTilstandStatus.TILSTAND_STATUS_SIX:
      return <CommonVariantSevenPVK />
    case EPVKTilstandStatus.TILSTAND_STATUS_SEVEN:
      return <CommonVariantSixPVK />
    case EPVKTilstandStatus.TILSTAND_STATUS_EIGHT:
      return <AdminMedAlleAndreRollerOgsaSkruddPaVariantTwo />
    case EPVKTilstandStatus.TILSTAND_STATUS_NINE:
      return <AdminMedAlleAndreRollerOgsaSkruddPaVariantThree />
    case EPVKTilstandStatus.TILSTAND_STATUS_TEN:
      return <CommonVariantFivePVK />
    case EPVKTilstandStatus.TILSTAND_STATUS_ELEVEN:
      return <AdminMedAlleAndreRollerOgsaSkruddPaVariantTwo />
    default:
      return <></>
  }
}

export default AdminMedAlleAndreRollerOgsaSkruddPaRollePVK
