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

const test: string = EPVKTilstandStatus.IKKE_VURDERT_BEHOV_FOR_PVK

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
    case EPVKTilstandStatus.IKKE_VURDERT_BEHOV_FOR_PVK:
      return <CommonVariantOne />
    case EPVKTilstandStatus.SKAL_IKKE_GJORE_PVK:
      return <CommonVariantOne />
    case EPVKTilstandStatus.SKAL_GJORE_PVK_MEN_IKKE_PABEGYNT:
      return <CommonVariantOne />
    case EPVKTilstandStatus.PVK_UNDER_ARBEID_FOR_FORSTE_GANG_FOR_INNSENDING:
      return <CommonVariantTwo />
    case EPVKTilstandStatus.PVK_SENDT_TIL_PVO_TELLES_SOM_UNDERARBEID:
      return <PersonvernombudVariantOne />
    case EPVKTilstandStatus.PVO_HAR_GITT_TILBAKEMELDING_ETTERLEVER_KAN_REDIGERE_TELLES_SOM_UNDER_ARBEID:
      return <CommonVariantTwo />
    case EPVKTilstandStatus.ETTERLEVER_HAR_SENDT_TILBAKE_TIL_PVO_TELLES_SOM_UNDER_ARBEID:
      return <CommonVariantTwo />
    case EPVKTilstandStatus.ETTERLEVER_HAR_SENDT_TIL_RISIKOEIER_TELLES_SOM_UNDER_ARBEID:
      return <CommonVariantTwo />
    case EPVKTilstandStatus.RISIKOEIER_HAR_GODKJENT_ETTERLEVER_HAR_IKKE_ENDRET_SIDEN:
      return <CommonVariantTwo />
    case EPVKTilstandStatus.ETTERLEVER_HAR_BEGYNT_MED_NYE_ENDRINGER_TELLES_SOM_UNDER_ARBEID:
      return <CommonVariantThree />
    case EPVKTilstandStatus.ETTERLEVER_HAR_SENDT_OPPDATERT_PVK_DIREKTE_TIL_RISIKOEIER_TELLES_SOM_UNDER_ARBEID:
      return <CommonVariantTwo />
    default:
      return <></>
  }
}

export default PersonvernombudRolle
