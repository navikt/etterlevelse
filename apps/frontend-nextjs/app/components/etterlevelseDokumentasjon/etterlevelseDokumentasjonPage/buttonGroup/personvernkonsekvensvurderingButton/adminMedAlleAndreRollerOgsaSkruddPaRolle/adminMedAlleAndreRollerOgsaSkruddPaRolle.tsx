import { EPVKTilstandStatus } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { FunctionComponent } from 'react'
import {
  AdminMedAlleAndreRollerOgsaSkruddPaVariantOne,
  AdminMedAlleAndreRollerOgsaSkruddPaVariantThree,
  AdminMedAlleAndreRollerOgsaSkruddPaVariantTwo,
} from '../commonPVK/adminMedAlleAndreRollerOgsaSkruddPaCommonPVK'
import {
  CommonVariantFive,
  CommonVariantFour,
  CommonVariantSeven,
  CommonVariantSix,
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
    case EPVKTilstandStatus.TILSTAND_STATUS_ONE:
      return <CommonVariantFour />
    case EPVKTilstandStatus.TILSTAND_STATUS_TWO:
      return <CommonVariantFour />
    case EPVKTilstandStatus.TILSTAND_STATUS_THREE:
      return <AdminMedAlleAndreRollerOgsaSkruddPaVariantOne />
    case EPVKTilstandStatus.TILSTAND_STATUS_FOUR:
      return <CommonVariantFive />
    case EPVKTilstandStatus.TILSTAND_STATUS_FIVE:
      return <CommonVariantSix />
    case EPVKTilstandStatus.TILSTAND_STATUS_SIX:
      return <CommonVariantSeven />
    case EPVKTilstandStatus.TILSTAND_STATUS_SEVEN:
      return <CommonVariantSix />
    case EPVKTilstandStatus.TILSTAND_STATUS_EIGHT:
      return <AdminMedAlleAndreRollerOgsaSkruddPaVariantTwo />
    case EPVKTilstandStatus.TILSTAND_STATUS_NINE:
      return <AdminMedAlleAndreRollerOgsaSkruddPaVariantThree />
    case EPVKTilstandStatus.TILSTAND_STATUS_TEN:
      return <CommonVariantFive />
    case EPVKTilstandStatus.TILSTAND_STATUS_ELEVEN:
      return <AdminMedAlleAndreRollerOgsaSkruddPaVariantTwo />
    default:
      return <></>
  }
}

export default AdminMedAlleAndreRollerOgsaSkruddPaRolle
