import axios from 'axios'
import { EKravStatus, IKrav, IPageResponse, TKravQL, TOr } from '../constants'
import { env } from '../util/env'

export const getAllKrav = async () => {
  const PAGE_SIZE = 100
  const firstPage = await getKravPage(0, PAGE_SIZE)
  if (firstPage.pages === 1) {
    return firstPage.content.length > 0 ? [...firstPage.content] : []
  } else {
    let allKrav: IKrav[] = [...firstPage.content]
    for (let currentPage = 1; currentPage < firstPage.pages; currentPage++) {
      allKrav = [...allKrav, ...(await getKravPage(currentPage, PAGE_SIZE)).content]
    }
    return allKrav
  }
}

export const getKravPage = async (pageNumber: number, pageSize: number) => {
  return (
    await axios.get<IPageResponse<IKrav>>(
      `${env.backendBaseUrl}/krav?pageNumber=${pageNumber}&pageSize=${pageSize}`
    )
  ).data
}

export const deleteKrav = async (id: string) => {
  return (await axios.delete<IKrav>(`${env.backendBaseUrl}/krav/${id}`)).data
}

export const searchKrav = async (name: string) => {
  return (await axios.get<IPageResponse<IKrav>>(`${env.backendBaseUrl}/krav/search/${name}`)).data
    .content
}

export const searchKravByNumber = async (number: string) => {
  return (
    await axios.get<IPageResponse<IKrav>>(`${env.backendBaseUrl}/krav/search/number/${number}`)
  ).data.content
}

export const getKravByKravNumberAndVersion = async (
  kravNummer: number | string,
  kravVersjon: number | string
) => {
  return await axios
    .get<IKrav>(`${env.backendBaseUrl}/krav/kravnummer/${kravNummer}/${kravVersjon}`)
    .then((resp) => {
      return resp.data
    })
    .catch(() => {
      return undefined
    })
}

export const getKravByKravNummer = async (kravNummer: number | string) => {
  return (
    await axios.get<IPageResponse<IKrav>>(`${env.backendBaseUrl}/krav/kravnummer/${kravNummer}`)
  ).data
}

export const createKrav = async (krav: TKravQL) => {
  const domainToObject = kravToKravDomainObject(krav)
  return (await axios.post<IKrav>(`${env.backendBaseUrl}/krav`, domainToObject)).data
}

export const updateKrav = async (krav: TKravQL) => {
  const domainToObject = kravToKravDomainObject(krav)
  return (await axios.put<IKrav>(`${env.backendBaseUrl}/krav/${krav.id}`, domainToObject)).data
}

function kravToKravDomainObject(krav: TKravQL): IKrav {
  const domainToObject = {
    ...krav,
    avdeling: krav.avdeling?.code,
    underavdeling: krav.underavdeling?.code,
    relevansFor: krav.relevansFor.map((relevans) => relevans.code),
    regelverk: krav.regelverk.map((regelverk) => ({ ...regelverk, lov: regelverk.lov.code })),
    begrepIder: krav.begreper.map((begrep) => begrep.id),
    virkemiddelIder: krav.virkemidler.map((virkemiddel) => virkemiddel.id),
    kravIdRelasjoner: krav.kravRelasjoner.map((kravRelasjon) => kravRelasjon.id),
  } as any
  delete domainToObject.changeStamp
  delete domainToObject.version
  delete domainToObject.begreper
  delete domainToObject.virkemidler
  delete domainToObject.kravRelasjoner
  return domainToObject
}

export type TKravIdParams = TOr<{ id?: string }, { kravNummer: string; kravVersjon: string }>
export type TKravId = TOr<{ id?: string }, { kravNummer: number; kravVersjon: number }>

export const useSearchKrav = async (searchParams: string) => {
  if (searchParams && searchParams.length > 2) {
    if (searchParams.toLowerCase().match(/k\d{1,3}/)) {
      let kravNumber = searchParams
      if (kravNumber[0].toLowerCase() === 'k') {
        kravNumber = kravNumber.substring(1)
      }

      if (searchParams.length > 3) {
        if (Number.parseFloat(kravNumber) && Number.parseFloat(kravNumber) % 1 !== 0) {
          const kravNummerMedVersjon = kravNumber.split('.')
          const kravRes = await getKravByKravNumberAndVersion(
            kravNummerMedVersjon[0],
            kravNummerMedVersjon[1]
          )
          if (kravRes && kravRes.status === EKravStatus.AKTIV) {
            return [
              {
                value: kravRes.id,
                label: 'K' + kravRes.kravNummer + '.' + kravRes.kravVersjon + ' ' + kravRes.navn,
                ...kravRes,
              },
            ]
          }
        } else {
          const kravRes = await searchKrav(kravNumber)
          return kravRes
            .filter((krav) => krav.status === EKravStatus.AKTIV)
            .map((krav) => {
              return {
                value: krav.id,
                label: 'K' + krav.kravNummer + '.' + krav.kravVersjon + ' ' + krav.navn,
                ...krav,
              }
            })
        }
      }
    } else {
      const kravRes = await searchKrav(searchParams)
      return kravRes
        .filter((krav) => krav.status === EKravStatus.AKTIV)
        .map((krav) => {
          return {
            value: krav.id,
            label: 'K' + krav.kravNummer + '.' + krav.kravVersjon + ' ' + krav.navn,
            ...krav,
          }
        })
    }
  }
  return []
}

export const kravMapToFormVal = (krav: Partial<TKravQL>): TKravQL => ({
  id: krav.id || '',
  navn: krav.navn || '',
  kravNummer: krav.kravNummer || 0,
  kravVersjon: krav.kravVersjon || 0,
  changeStamp: krav.changeStamp || { lastModifiedDate: '', lastModifiedBy: '' },
  version: -1,
  beskrivelse: krav.beskrivelse || '',
  utdypendeBeskrivelse: krav.utdypendeBeskrivelse || '',
  versjonEndringer: krav.versjonEndringer || '',
  dokumentasjon: krav.dokumentasjon || [],
  implementasjoner: krav.implementasjoner || '',
  begreper: krav.begreper || [],
  virkemidler: krav.virkemidler || [],
  varslingsadresser: krav.varslingsadresser || [],
  rettskilder: krav.rettskilder || [],
  tagger: krav.tagger || [],
  regelverk: krav.regelverk || [],
  hensikt: krav.hensikt || '',
  notat: krav.notat || '',
  varselMelding: krav.varselMelding || '',
  avdeling: krav.avdeling,
  underavdeling: krav.underavdeling,
  relevansFor: krav.relevansFor || [],
  status: krav.status || EKravStatus.UTKAST,
  suksesskriterier: krav.suksesskriterier || [
    { id: 0, navn: '', beskrivelse: '', behovForBegrunnelse: true },
  ],
  nyKravVersjon: krav.nyKravVersjon || false,
  tema:
    (krav.regelverk &&
      krav.regelverk?.length > 0 &&
      krav.regelverk[0].lov &&
      krav.regelverk[0].lov.data &&
      krav.regelverk[0].lov.data.tema) ||
    '',
  kravRelasjoner: krav.kravRelasjoner || [],
  // not used
  begrepIder: [],
  virkemiddelIder: [],
  etterlevelser: [],
  kravIdRelasjoner: [],
  aktivertDato: krav.aktivertDato || '',
  prioriteringsId: 0,
})
