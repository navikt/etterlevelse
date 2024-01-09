import { IEtterlevelse, EtterlevelseStatus, IKravPrioritering, KravQL, ISuksesskriterieBegrunnelse } from '../../../constants'
import _ from 'lodash'
import { sortKraverByPriority } from '../../../util/sort'
import { mapEtterlevelseData } from '../../../pages/EtterlevelseDokumentasjonTemaPage'
import { TemaCode } from '../../../services/Codelist'

export const filterKrav = (allKravPriority: IKravPrioritering[], kravList?: KravQL[], temaData?: TemaCode, filterFerdigDokumentert?: boolean) => {
  const unfilteredkraver = kravList ? _.cloneDeep(kravList) : []

  unfilteredkraver.map((k) => {
    const priority = allKravPriority.filter((kp) => kp.kravNummer === k.kravNummer && kp.kravVersjon === k.kravVersjon)
    k.prioriteringsId = priority.length ? priority[0].prioriteringsId : ''
    return k
  })

  const sortedKrav = sortKraverByPriority<KravQL>(unfilteredkraver, temaData?.shortName || '')

  const mapped = sortedKrav.map((krav) => {
    const etterlevelse = krav.etterlevelser.length ? krav.etterlevelser[0] : undefined
    return {
      kravNummer: krav.kravNummer,
      kravVersjon: krav.kravVersjon,
      navn: krav.navn,
      status: krav.status,
      suksesskriterier: krav.suksesskriterier,
      varselMelding: krav.varselMelding,
      prioriteringsId: krav.prioriteringsId,
      changeStamp: krav.changeStamp,
      aktivertDato: krav.aktivertDato,
      ...mapEtterlevelseData(etterlevelse),
    }
  })

  if (filterFerdigDokumentert) {
    for (let index = mapped.length - 1; index > 0; index--) {
      if (mapped[index].kravNummer === mapped[index - 1].kravNummer && mapped[index - 1].etterlevelseStatus === EtterlevelseStatus.FERDIG_DOKUMENTERT) {
        mapped[index - 1].gammelVersjon = true
      } else if (mapped[index].kravNummer === mapped[index - 1].kravNummer && mapped[index - 1].etterlevelseStatus !== EtterlevelseStatus.FERDIG_DOKUMENTERT) {
        mapped.splice(index - 1, 1)
      }
    }
  }
  return mapped
}

export const toKravId = (it: { kravVersjon: number; kravNummer: number }) => ({ kravNummer: it.kravNummer, kravVersjon: it.kravVersjon })

export const syncEtterlevelseKriterieBegrunnelseWithKrav = (etterlevelse: IEtterlevelse, krav?: KravQL) => {
  const suksesskriterieBegrunnelse: ISuksesskriterieBegrunnelse[] = []

  krav?.suksesskriterier.forEach((k) => {
    suksesskriterieBegrunnelse.push(etterlevelse.suksesskriterieBegrunnelser.filter((e) => e.suksesskriterieId === k.id)[0])
  })

  return suksesskriterieBegrunnelse
}
