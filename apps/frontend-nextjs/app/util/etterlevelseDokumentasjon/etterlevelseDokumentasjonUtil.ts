import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'

export const etterlevelseDokumentasjonName = (
  etterlevelseDokumentasjon?: IEtterlevelseDokumentasjon
): string =>
  etterlevelseDokumentasjon
    ? `E${etterlevelseDokumentasjon.etterlevelseNummer} ${etterlevelseDokumentasjon.title}`
    : ''
