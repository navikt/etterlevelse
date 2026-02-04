import { EPvkDokumentStatus } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { FunctionComponent } from 'react'
import { CommonVariantTwo } from '../commonEtterlevelse/commonEtterlevelse'
import { EtterleverVariantOne, EtterleverVariantTwo } from '../commonEtterlevelse/etterleverCommon'

// type TProps = {
//   etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
//   risikoscenarioList: IRisikoscenario[]
//   behandlingsLivslop?: IBehandlingensLivslop
//   pvkDokument?: IPvkDokument
//   isRisikoeier: boolean
// }

const test: string = EPvkDokumentStatus.VURDERT_AV_PVO

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
    case EPvkDokumentStatus.UNDERARBEID:
      return <EtterleverVariantOne />
    case EPvkDokumentStatus.TRENGER_GODKJENNING:
      return <EtterleverVariantTwo />
    case EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER:
      return <CommonVariantTwo />
    case EPvkDokumentStatus.VURDERT_AV_PVO:
      return <EtterleverVariantOne />
    default:
      return <></>
  }
}

export default EtterleverRolle
