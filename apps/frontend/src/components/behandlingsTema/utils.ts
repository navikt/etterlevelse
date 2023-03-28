import {Etterlevelse, KravQL, SuksesskriterieBegrunnelse} from '../../constants'

export const toKravId = (it: { kravVersjon: number; kravNummer: number }) => ({ kravNummer: it.kravNummer, kravVersjon: it.kravVersjon })

export const syncEtterlevelseKriterieBegrunnelseWithKrav = (etterlevelse: Etterlevelse, krav?: KravQL) => {
  const suksesskriterieBegrunnelse: SuksesskriterieBegrunnelse[] = []

  krav?.suksesskriterier.forEach((k) => {
    suksesskriterieBegrunnelse.push(etterlevelse.suksesskriterieBegrunnelser.filter((e) => e.suksesskriterieId === k.id)[0])
  })

  return suksesskriterieBegrunnelse
}
