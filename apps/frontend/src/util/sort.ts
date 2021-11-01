import {intl} from './intl/intl'
import {Krav} from "../constants";

const start = (prefix: string) => (text: string) => {
  const startIndex = text.indexOf(prefix.toLowerCase())
  return startIndex < 0 ? Number.MAX_VALUE : startIndex
}

export const prefixBiasedSort: (prefix: string, a: string, b: string) => number = (prefix, a, b) => {
  const comp = start(prefix)
  const aLower = a.toLowerCase()
  const bLower = b.toLowerCase()
  const c1 = comp(aLower) - comp(bLower)
  return c1 === 0 ? aLower.localeCompare(bLower, intl.getLanguage()) : c1
}

export const sortKraverByPriority = (kraver: Krav[], tema: string) => {
  console.log("kraver", kraver)
  const pattern = new RegExp(tema.substr(0, 3).toUpperCase() + '[0-9]+')
  return kraver.sort((a, b) => {
    if (a.prioriteringsId && b.prioriteringsId) {
      let aResult = a.prioriteringsId.match(pattern)
      let bResult = b.prioriteringsId.match(pattern)
      let aaResult = aResult ? aResult[0].match(/[0-9]+/) : ""
      let bbResult = bResult ? bResult[0].match(/[0-9]+/) : ""

      let aTemp = aResult ? aaResult ? parseInt(aaResult[0]) : 0 : 0
      let bTemp = bResult ? bbResult ? parseInt(bbResult[0]) : 0 : 0
      return aTemp - bTemp
    }
    return 0
  })
}
