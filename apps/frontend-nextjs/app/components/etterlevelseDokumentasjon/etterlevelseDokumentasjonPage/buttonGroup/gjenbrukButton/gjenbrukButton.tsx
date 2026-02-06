import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { FunctionComponent } from 'react'
import AdminMedAlleAndreRollerOgsaSkruddPaRolleGjenbruk from './adminMedAlleAndreRollerOgsaSkruddPaRolleGjenbruk/adminMedAlleAndreRollerOgsaSkruddPaRolleGjenbruk'
import EtterleverRolleGjenbruk from './etterleverRolleGjenbruk/etterleverRolleGjenbruk'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  risikoscenarioList: IRisikoscenario[]
  behandlingsLivslop?: IBehandlingensLivslop
  pvkDokument?: IPvkDokument
  isRisikoeier: boolean
}

const test: string = 'Admin med alle andre roller ogsa skrudd pa'

const GjenbrukButton: FunctionComponent<TProps> = (
  {
    // etterlevelseDokumentasjon,
    // behandlingsLivslop,
    // pvkDokument,
    // risikoscenarioList,
    // isRisikoeier,
  }
) => {
  switch (test) {
    case 'Etterlever':
      return (
        <EtterleverRolleGjenbruk
        // etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        // risikoscenarioList={risikoscenarioList}
        // behandlingsLivslop={behandlingsLivslop}
        // pvkDokument={pvkDokument}
        // isRisikoeier={isRisikoeier}
        />
      )
    case 'Admin med alle andre roller ogsa skrudd pa':
      return (
        <AdminMedAlleAndreRollerOgsaSkruddPaRolleGjenbruk
        // etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        // risikoscenarioList={risikoscenarioList}
        // behandlingsLivslop={behandlingsLivslop}
        // pvkDokument={pvkDokument}
        // isRisikoeier={isRisikoeier}
        />
      )
    default:
      return <></>
  }
}

export default GjenbrukButton
