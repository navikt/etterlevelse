import _ from 'lodash'
import {
  EEtterlevelseStatus,
  IEtterlevelse,
  IKravPriorityList,
  ISuksesskriterieBegrunnelse,
  TKravQL,
} from '../../../constants'
import { mapEtterlevelseData } from '../../../pages/EtterlevelseDokumentasjonTemaPage'
import { sortKravListeByPriority } from '../../../util/sort'

export const filterKrav = (
  kravPriority: IKravPriorityList,
  kravList?: TKravQL[],
  filterFerdigDokumentert?: boolean
) => {
  const unfilteredkraver = kravList ? _.cloneDeep(kravList) : []

  unfilteredkraver.map((krav) => {
    const priority = kravPriority.priorityList.indexOf(krav.kravNummer)
    krav.prioriteringsId = priority + 1
    return krav
  })

  const sortedKrav = sortKravListeByPriority<TKravQL>(unfilteredkraver)

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
      if (
        mapped[index].kravNummer === mapped[index - 1].kravNummer &&
        mapped[index - 1].etterlevelseStatus === EEtterlevelseStatus.FERDIG_DOKUMENTERT
      ) {
        mapped[index - 1].gammelVersjon = true
      } else if (
        mapped[index].kravNummer === mapped[index - 1].kravNummer &&
        mapped[index - 1].etterlevelseStatus !== EEtterlevelseStatus.FERDIG_DOKUMENTERT
      ) {
        mapped.splice(index - 1, 1)
      }
    }
  }
  return mapped
}

export const toKravId = (it: { kravVersjon: number; kravNummer: number }) => ({
  kravNummer: it.kravNummer,
  kravVersjon: it.kravVersjon,
})

export const syncEtterlevelseKriterieBegrunnelseWithKrav = (
  etterlevelse: IEtterlevelse,
  krav?: TKravQL
) => {
  const suksesskriterieBegrunnelse: ISuksesskriterieBegrunnelse[] = []

  krav?.suksesskriterier.forEach((k) => {
    suksesskriterieBegrunnelse.push(
      etterlevelse.suksesskriterieBegrunnelser.filter((e) => e.suksesskriterieId === k.id)[0]
    )
  })

  return suksesskriterieBegrunnelse
}
