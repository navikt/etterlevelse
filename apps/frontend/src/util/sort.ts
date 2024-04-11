import { IKrav } from '../constants'

export const sortKravListeByPriority = <T extends IKrav>(kraver: T[]) => {
  const newKravList = [...kraver]

  return newKravList.sort((a, b) => {
    if (a.prioriteringsId !== 0 && b.prioriteringsId === 0) {
      return -1
    } else if (a.prioriteringsId === 0 && b.prioriteringsId !== 0) {
      return 1
    } else if (a.prioriteringsId === 0 && b.prioriteringsId === 0) {
      return b.kravNummer - a.kravNummer
    } else if (a.prioriteringsId && b.prioriteringsId) {
      return a.prioriteringsId - b.prioriteringsId
    } else {
      return -1
    }
  })
}
