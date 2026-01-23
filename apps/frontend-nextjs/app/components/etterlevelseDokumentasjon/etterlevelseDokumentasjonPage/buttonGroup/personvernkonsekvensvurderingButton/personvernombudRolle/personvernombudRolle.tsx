import { EPVKTilstandStatus } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { FunctionComponent } from 'react'
import { CommonVariantOne, CommonVariantThree, CommonVariantTwo } from '../commonPVK/commonPVK'
import { PersonvernombudVariantOne } from '../commonPVK/personvernombudCommonPVK'

// type TProps = {
//   etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
//   risikoscenarioList: IRisikoscenario[]
//   behandlingsLivslop?: IBehandlingensLivslop
//   pvkDokument?: IPvkDokument
//   isRisikoeier: boolean
// }

const test: string = EPVKTilstandStatus.TILSTAND_STATUS_ONE

// EPVKTilstandStatus
// PVKTilstandStatusRolle

const PersonvernombudRolle: FunctionComponent = (
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
      return <PersonvernombudVariantOne />
    case EPVKTilstandStatus.TILSTAND_STATUS_SIX:
      return <CommonVariantTwo />
    case EPVKTilstandStatus.TILSTAND_STATUS_SEVEN:
      return <CommonVariantTwo />
    case EPVKTilstandStatus.TILSTAND_STATUS_EIGHT:
      return <CommonVariantTwo />
    case EPVKTilstandStatus.TILSTAND_STATUS_NINE:
      return <CommonVariantTwo />
    case EPVKTilstandStatus.TILSTAND_STATUS_TEN:
      return <CommonVariantThree />
    case EPVKTilstandStatus.TILSTAND_STATUS_ELEVEN:
      return <CommonVariantTwo />
    default:
      return <></>
  }
}

export default PersonvernombudRolle
