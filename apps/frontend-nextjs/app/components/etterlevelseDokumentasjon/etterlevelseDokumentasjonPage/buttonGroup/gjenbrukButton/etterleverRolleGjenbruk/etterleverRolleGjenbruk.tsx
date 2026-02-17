import { EPvkDokumentStatus } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { FunctionComponent } from 'react'
import { CommonVariantOneGjenbruk } from '../commonGjenbruk/commonGjenbruk'

// type TProps = {
//   etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
//   risikoscenarioList: IRisikoscenario[]
//   behandlingsLivslop?: IBehandlingensLivslop
//   pvkDokument?: IPvkDokument
//   isRisikoeier: boolean
// }

const test: string = EPvkDokumentStatus.UNDERARBEID

// EPVKTilstandStatus
// PVKTilstandStatusRolle

const EtterleverRolleGjenbruk: FunctionComponent = (
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
      return <CommonVariantOneGjenbruk />
    case EPvkDokumentStatus.TRENGER_GODKJENNING:
      return <></>
    case EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER:
      return <CommonVariantOneGjenbruk />
    case EPvkDokumentStatus.VURDERT_AV_PVO:
      return <CommonVariantOneGjenbruk />
    default:
      return <></>
  }
}

export default EtterleverRolleGjenbruk
