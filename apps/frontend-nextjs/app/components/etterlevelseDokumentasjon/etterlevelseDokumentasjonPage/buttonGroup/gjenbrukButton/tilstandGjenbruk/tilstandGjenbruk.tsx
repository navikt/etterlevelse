import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { FunctionComponent } from 'react'
import {
  EndreGjenbrukActionMenu,
  SlaPaGjenbrukActionMenu,
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

const TilstandGjenbruk: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  setEtterlevelseDokumentasjon,
}) => {
  const getTilstand = () => {
    if (etterlevelseDokumentasjon) {
      if (
        etterlevelseDokumentasjon.gjenbrukBeskrivelse &&
        etterlevelseDokumentasjon.tilgjengeligForGjenbruk
      ) {
        return EEtterlevelseGjenbruk.ENDRE_GJENBRUK
      } else {
        return EEtterlevelseGjenbruk.SLA_PA_GJENBRUK
      }
    } else {
      return EEtterlevelseGjenbruk.TILRETTELEGGING_FOR_GJENBRUK
    }
  }

  switch (getTilstand()) {
    case EEtterlevelseGjenbruk.TILRETTELEGGING_FOR_GJENBRUK:
      return (
        <TilretteleggForGjenbrukActionMenu
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
        />
      )
    case EEtterlevelseGjenbruk.SLA_PA_GJENBRUK:
      return (
        <EndreGjenbrukActionMenu
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
        />
      )
    case EEtterlevelseGjenbruk.ENDRE_GJENBRUK:
      return (
        <SlaPaGjenbrukActionMenu
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
        />
      )
    default:
      return <>Feilmelding: Denne tilstanden finnes ikke</>
  }
}

export default TilstandGjenbruk
