import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import moment from 'moment'
import { FunctionComponent } from 'react'
import { PvkGodkjentReadOnlyActionMenuVariant } from '../commonActionMenuPVK/etterleverCommonPVK'

type TProps = {
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  pvkDokument?: IPvkDokument
  behandlingensArtOgOmfang?: IBehandlingensArtOgOmfang
  behandlingsLivslop?: IBehandlingensLivslop
}

const LesRollePvk: FunctionComponent<TProps> = ({
  pvkDokument,
  etterlevelseDokumentasjon,
  behandlingensArtOgOmfang,
  behandlingsLivslop,
}) => {
  if (!pvkDokument) {
    return undefined
  }

  const { etterlevelseDokumentVersjon, versjonHistorikk } = etterlevelseDokumentasjon
  const erGodkjent = pvkDokument.status === EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER

  let kanVises = false

  if (etterlevelseDokumentVersjon === 1 && erGodkjent) {
    kanVises = true
  } else if (etterlevelseDokumentVersjon > 1) {
    const nyVersjonOpprettetDato = versjonHistorikk.find(
      (historikk) => historikk.versjon === etterlevelseDokumentVersjon - 1
    )?.nyVersjonOpprettetDato

    if (erGodkjent) {
      kanVises = true
    } else if (moment(pvkDokument.changeStamp.createdDate).isBefore(nyVersjonOpprettetDato)) {
      kanVises = true
    }
  }

  if (!kanVises) {
    return undefined
  }

  return (
    <PvkGodkjentReadOnlyActionMenuVariant
      etterlevelseDokumentasjon={etterlevelseDokumentasjon}
      pvkDokument={pvkDokument}
      behandlingensArtOgOmfang={behandlingensArtOgOmfang}
      behandlingsLivslop={behandlingsLivslop}
    />
  )
}

export default LesRollePvk
