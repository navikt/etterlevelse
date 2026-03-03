import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { FunctionComponent } from 'react'
import {
  GjenbrukActionMenu,
  TilretteleggForGjenbrukActionMenu,
} from '../commonGjenbruk/commonGjenbruk'

enum EEtterlevelseGjenbruk {
  TILRETTELEGGING_FOR_GJENBRUK = 'Tilrettelegging for Gjenbruk',
  SLA_PA_GJENBRUK = 'Slå på Gjenbruk',
  ENDRE_GJENBRUK = 'Endre Gjenbruk',
}

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon: (state: TEtterlevelseDokumentasjonQL) => void
}

function getTilstand(
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
): EEtterlevelseGjenbruk {
  if (etterlevelseDokumentasjon == null) {
    return EEtterlevelseGjenbruk.TILRETTELEGGING_FOR_GJENBRUK
  }

  if (
    etterlevelseDokumentasjon.gjenbrukBeskrivelse &&
    etterlevelseDokumentasjon.tilgjengeligForGjenbruk
  ) {
    return EEtterlevelseGjenbruk.ENDRE_GJENBRUK
  }

  return EEtterlevelseGjenbruk.SLA_PA_GJENBRUK
}

const TilstandGjenbruk: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  setEtterlevelseDokumentasjon,
}) => {
  switch (getTilstand(etterlevelseDokumentasjon)) {
    case EEtterlevelseGjenbruk.TILRETTELEGGING_FOR_GJENBRUK:
      return (
        <TilretteleggForGjenbrukActionMenu etterlevelseDokumentasjon={etterlevelseDokumentasjon}>
          Tilrettelegging for Gjenbruk
        </TilretteleggForGjenbrukActionMenu>
      )
    case EEtterlevelseGjenbruk.SLA_PA_GJENBRUK:
      return (
        <GjenbrukActionMenu
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
        >
          Slå på Gjenbruk
        </GjenbrukActionMenu>
      )
    case EEtterlevelseGjenbruk.ENDRE_GJENBRUK:
      return (
        <GjenbrukActionMenu
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
        >
          Endre Gjenbruk
        </GjenbrukActionMenu>
      )
    default:
      return <>Feilmelding: Denne tilstanden finnes ikke</>
  }
}

export default TilstandGjenbruk
