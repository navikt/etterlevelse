import axios from "axios";
import {emptyPage, Krav, KravStatus, Or, PageResponse} from '../constants'
import {env} from '../util/env'
import {useEffect, useState} from 'react'

export const getKravPage = async (pageNumber: number, pageSize: number) => {
  return (await axios.get<PageResponse<Krav>>(`${env.backendBaseUrl}/krav?pageNumber=${pageNumber}&pageSize=${pageSize}`)).data
}

export const getKrav = async (id: string) => {
  return (await axios.get<Krav>(`${env.backendBaseUrl}/krav/${id}`)).data
}

export const getKravByKravNummer = async (kravNummer: string, kravVersjon: string) => {
  return (await axios.get<Krav>(`${env.backendBaseUrl}/krav/${kravNummer}/${kravVersjon}`)).data
}

export const createKrav = async (krav: Krav) => {
  const dto = kravToKravDto(krav)
  return (await axios.post<Krav>(`${env.backendBaseUrl}/krav`, dto)).data
}

export const updateKrav = async (krav: Krav) => {
  const dto = kravToKravDto(krav)
  return (await axios.put<Krav>(`${env.backendBaseUrl}/krav/${krav.id}`, dto)).data
}

function kravToKravDto(krav: Krav) {
  const dto = {
    ...krav,
    relevansFor: krav.relevansFor?.code
  }
  delete dto.changeStamp
  delete dto.version
  return dto
}

export const useKravPage = (pageSize: number) => {
  const [data, setData] = useState<PageResponse<Krav>>(emptyPage)
  const [page, setPage] = useState<number>(0)

  useEffect(() => {
    getKravPage(page, pageSize).then(setData)
  }, [page, pageSize])

  const prevPage = () => setPage(Math.max(0, page - 1))
  const nextPage = () => setPage(Math.min(data?.pages ? data.pages - 1 : 0, page + 1))

  return [data, prevPage, nextPage] as [PageResponse<Krav>, () => void, () => void]
}

export type KravId = Or<{id?: string}, {kravNummer: string, kravVersjon: string}>

export const useKrav = (params?: KravId, krav?: Krav) => {
  const [data, setData] = useState<Krav | undefined>(krav)

  useEffect(() => {
    params?.id && getKrav(params.id).then(setData)
    params?.kravNummer && getKravByKravNummer(params.kravNummer, params.kravVersjon).then(setData)
  }, [params])

  return [data, setData] as [Krav | undefined, (k: Krav) => void]
}
export const mapToFormVal = (krav: Partial<Krav>): Krav => ({
  id: krav.id || '',
  navn: krav.navn || '',
  kravNummer: krav.kravNummer || 0,
  kravVersjon: krav.kravVersjon || 0,
  changeStamp: krav.changeStamp || {lastModifiedDate: '', lastModifiedBy: ''},
  version: -1,
  beskrivelse: krav.beskrivelse || '',
  utdypendeBeskrivelse: krav.utdypendeBeskrivelse || '',
  dokumentasjon: krav.dokumentasjon || [],
  implementasjoner: krav.implementasjoner || [],
  begreper: krav.begreper || [],
  kontaktPersoner: krav.kontaktPersoner || [],
  rettskilder: krav.rettskilder || [],
  tagger: krav.tagger || [],
  hensikt: krav.hensikt || '',
  avdeling: krav.avdeling || '',
  underavdeling: krav.underavdeling || '',
  periode: krav.periode,
  relevansFor: krav.relevansFor,
  status: krav.status || KravStatus.UNDER_REDIGERING,
  nyKravVersjon: krav.nyKravVersjon || false
})
