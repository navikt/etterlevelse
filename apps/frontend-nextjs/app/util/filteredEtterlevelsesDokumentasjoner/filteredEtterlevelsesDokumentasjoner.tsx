import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { getNumberOfMonthsBetween } from '../checkAge/checkAgeUtil'

export const filteredEtterlevelsesDokumentasjoner = (
  sortedEtterlevelseDokumentasjoner: TEtterlevelseDokumentasjonQL[]
): TEtterlevelseDokumentasjonQL[] => {
  const today: Date = new Date()

  return sortedEtterlevelseDokumentasjoner
    .filter((etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL) => {
      let monthAge
      if (etterlevelseDokumentasjon.sistEndretEtterlevelseAvMeg) {
        monthAge = getNumberOfMonthsBetween(
          etterlevelseDokumentasjon.sistEndretEtterlevelseAvMeg,
          today
        )
      } else {
        monthAge = getNumberOfMonthsBetween(
          etterlevelseDokumentasjon.changeStamp.createdDate || '',
          today
        )
      }
      return monthAge <= 6
    })
    .slice(0, 2)
}
