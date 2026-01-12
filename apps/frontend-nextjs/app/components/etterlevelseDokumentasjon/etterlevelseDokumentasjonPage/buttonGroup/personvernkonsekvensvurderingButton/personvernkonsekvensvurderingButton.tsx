import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { FunctionComponent } from 'react'
import EtterleverPVKKnapper from './roller/etterlever/etterleverPVKKnapper'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon: (state: TEtterlevelseDokumentasjonQL) => void
  risikoscenarioList: IRisikoscenario[]
  artOgOmfang: IBehandlingensArtOgOmfang
  behandlingsLivslop?: IBehandlingensLivslop
  pvkDokument?: IPvkDokument
  isRisikoeier: boolean
}

export const PersonvernkonsekvensvurderingButton: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  setEtterlevelseDokumentasjon,
  risikoscenarioList,
  artOgOmfang,
  behandlingsLivslop,
  pvkDokument,
  isRisikoeier,
}) => (
  <>
    {/* Roller */}
    <EtterleverPVKKnapper
      etterlevelseDokumentasjon={etterlevelseDokumentasjon}
      setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
      risikoscenarioList={risikoscenarioList}
      artOgOmfang={artOgOmfang}
      behandlingsLivslop={behandlingsLivslop}
      pvkDokument={pvkDokument}
      isRisikoeier={isRisikoeier}
    />
  </>
)
