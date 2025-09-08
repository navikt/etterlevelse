import { TKravQL } from '@/constants/krav/kravConstants'

export const sortKrav = (kravene: TKravQL[]): TKravQL[] => {
  return [...kravene].sort((a: TKravQL, b: TKravQL) => {
    if (a.navn.toLocaleLowerCase() === b.navn.toLocaleLowerCase()) {
      return b.kravVersjon - a.kravVersjon
    }
    if (a.navn.toLocaleLowerCase() < b.navn.toLocaleLowerCase()) return -1
    if (a.navn.toLocaleLowerCase() > b.navn.toLocaleLowerCase()) return 1
    return 0
  })
}
