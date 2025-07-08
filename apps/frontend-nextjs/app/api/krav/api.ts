import { env } from '@/components/others/utils/env/env'
import { IPageResponse } from '@/constants/common/constants'
import { EKravStatus, IKrav, TKravQL } from '@/constants/krav/constants'
import axios from 'axios'

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

export const createKrav = async (krav: TKravQL) => {
  const domainToObject = kravToKravDomainObject(krav)
  return (await axios.post<IKrav>(`${env.backendBaseUrl}/krav`, domainToObject)).data
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
    varslingsadresser: krav.varslingsadresserQl.map((varslingsadresse) => {
      return {
        adresse: varslingsadresse.adresse,
        type: varslingsadresse.type,
      }
    }),
  } as any
  delete domainToObject.changeStamp
  delete domainToObject.version
  delete domainToObject.begreper
  delete domainToObject.virkemidler
  delete domainToObject.kravRelasjoner
  return domainToObject
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
  varslingsadresserQl: krav.varslingsadresserQl || [],
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
