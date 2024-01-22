import { IKrav } from '../constants'
import { intl } from './intl/intl'

const start = (prefix: string) => (text: string) => {
  const startIndex = text.indexOf(prefix.toLowerCase())
  return startIndex < 0 ? Number.MAX_VALUE : startIndex
}

export const prefixBiasedSort: (prefix: string, a: string, b: string) => number = (
  prefix,
  a,
  b
) => {
  const comp = start(prefix)
  const aLower = a.toLowerCase()
  const bLower = b.toLowerCase()
  const c1 = comp(aLower) - comp(bLower)
  return c1 === 0 ? aLower.localeCompare(bLower, intl.getLanguage()) : c1
}

export const sortKraverByPriority = <T extends IKrav>(kraver: T[], tema: string) => {
  const newKravList = [...kraver]
  const pattern = new RegExp(tema.substr(0, 3).toUpperCase() + '[0-9]+')

  const getPriorityId = (unfilteredId: string) => {
    let id = 0

    const matchId = unfilteredId.match(pattern)
    if (matchId) {
      const filteredId = matchId[0] ? matchId[0].match(/[0-9]+/) : 0
      if (filteredId) {
        id = parseInt(filteredId[0])
      }
    }

    return id
  }

  return newKravList.sort((a, b) => {
    if (a.prioriteringsId && !b.prioriteringsId) {
      return -1
    } else if (!a.prioriteringsId && b.prioriteringsId) {
      return 1
    } else if (!a.prioriteringsId && !b.prioriteringsId) {
      return b.kravNummer - a.kravNummer
    } else if (a.prioriteringsId && b.prioriteringsId) {
      return getPriorityId(a.prioriteringsId) - getPriorityId(b.prioriteringsId)
    } else {
      return -1
    }
  })
}
