import { ISuksesskriterieBegrunnelse } from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { ISuksesskriterie } from '@/constants/krav/kravConstants'

export const getSuksesskriterieBegrunnelse = (
  suksesskriterieBegrunnelser: ISuksesskriterieBegrunnelse[],
  suksessKriterie: ISuksesskriterie
): ISuksesskriterieBegrunnelse => {
  const suksesskriterieBegrunnelse = suksesskriterieBegrunnelser.find(
    (item: ISuksesskriterieBegrunnelse) => {
      return item.suksesskriterieId === suksessKriterie.kravId
    }
  )
  if (!suksesskriterieBegrunnelse) {
    return {
      suksesskriterieId: suksessKriterie.kravId,
      begrunnelse: '',
      behovForBegrunnelse: suksessKriterie.behovForBegrunnelse,
      suksesskriterieStatus: undefined,
      veiledning: false,
      veiledningsTekst: '',
      veiledningsTekst2: '',
    }
  } else {
    return suksesskriterieBegrunnelse
  }
}
