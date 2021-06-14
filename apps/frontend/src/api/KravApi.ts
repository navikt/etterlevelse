import axios from 'axios'
import {
  emptyPage,
  Krav,
  KravQL,
  KravStatus,
  Or,
  PageResponse,
} from '../constants'
import {env} from '../util/env'
import {useEffect, useState} from 'react'
import {useSearch} from '../util/hooks'
import {gql} from '@apollo/client'

export const getKravPage = async (pageNumber: number, pageSize: number) => {
  return (
    await axios.get<PageResponse<Krav>>(
      `${env.backendBaseUrl}/krav?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    )
  ).data
}

export const getKrav = async (id: string) => {
  return (await axios.get<Krav>(`${env.backendBaseUrl}/krav/${id}`)).data
}

export const deleteKrav = async (id: string) => {
  return (await axios.delete<Krav>(`${env.backendBaseUrl}/krav/${id}`)).data
}

export const searchKrav = async (name: string) => {
  return (
    await axios.get<PageResponse<Krav>>(
      `${env.backendBaseUrl}/krav/search/${name}`,
    )
  ).data.content
}

export const getKravByKravNummer = async (
  kravNummer: number | string,
  kravVersjon: number | string,
) => {
  return (
    await axios.get<Krav>(
      `${env.backendBaseUrl}/krav/kravnummer/${kravNummer}/${kravVersjon}`,
    )
  ).data
}

export const createKrav = async (krav: KravQL) => {
  const dto = kravToKravDto(krav)
  return (await axios.post<Krav>(`${env.backendBaseUrl}/krav`, dto)).data
}

export const updateKrav = async (krav: KravQL) => {
  const dto = kravToKravDto(krav)
  return (await axios.put<Krav>(`${env.backendBaseUrl}/krav/${krav.id}`, dto))
    .data
}

function kravToKravDto(krav: KravQL): Krav {
  const dto = {
    ...krav,
    avdeling: krav.avdeling?.code,
    underavdeling: krav.underavdeling?.code,
    relevansFor: krav.relevansFor.map(c => c.code),
    regelverk: krav.regelverk.map(r => ({...r, lov: r.lov.code})),
    begrepIder: krav.begreper.map(b => b.id),
  } as any
  delete dto.changeStamp
  delete dto.version
  delete dto.begreper
  return dto
}

export const useKravPage = (pageSize: number) => {
  const [data, setData] = useState<PageResponse<Krav>>(emptyPage)
  const [page, setPage] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getKravPage(page, pageSize).then(r => {
      setData(r)
      setLoading(false)
    })
  }, [page, pageSize])

  const prevPage = () => setPage(Math.max(0, page - 1))
  const nextPage = () =>
    setPage(Math.min(data?.pages ? data.pages - 1 : 0, page + 1))

  return [data, prevPage, nextPage, loading] as [
    PageResponse<Krav>,
    () => void,
    () => void,
    boolean,
  ]
}

export type KravIdParams = Or<
  {id?: string},
  {kravNummer: string; kravVersjon: string}
>
export type KravId = Or<
  {id?: string},
  {kravNummer: number; kravVersjon: number}
>

export const useKrav = (
  params: KravId | KravIdParams,
  onlyLoadOnce?: boolean,
) => {
  const isCreateNew = params.id === 'ny'
  const [data, setData] = useState<Krav | undefined>(
    isCreateNew ? mapToFormVal({}) : undefined,
  )

  let load = () => {
    if (data && onlyLoadOnce) return
    params?.id && !isCreateNew && getKrav(params.id).then(setData)
    params?.kravNummer &&
      getKravByKravNummer(params.kravNummer, params.kravVersjon).then(setData)
  }
  useEffect(load, [params])

  return [data, setData, load] as [
    Krav | undefined,
    (k?: Krav) => void,
    () => void,
  ]
}

export const useSearchKrav = () => useSearch(searchKrav)

export const mapToFormVal = (krav: Partial<KravQL>): KravQL => ({
  id: krav.id || '',
  navn: krav.navn || '',
  kravNummer: krav.kravNummer || 0,
  kravVersjon: krav.kravVersjon || 0,
  changeStamp: krav.changeStamp || {lastModifiedDate: '', lastModifiedBy: ''},
  version: -1,
  beskrivelse: krav.beskrivelse || '',
  utdypendeBeskrivelse: krav.utdypendeBeskrivelse || '',
  versjonEndringer: krav.versjonEndringer || '',
  dokumentasjon: krav.dokumentasjon || [],
  implementasjoner: krav.implementasjoner || '',
  begreper: krav.begreper || [],
  varslingsadresser: krav.varslingsadresser || [],
  rettskilder: krav.rettskilder || [],
  tagger: krav.tagger || [],
  regelverk: krav.regelverk || [],
  hensikt: krav.hensikt || '',
  avdeling: krav.avdeling,
  underavdeling: krav.underavdeling,
  periode: krav.periode || {start: undefined, slutt: undefined},
  relevansFor: krav.relevansFor || [],
  status: krav.status || KravStatus.UTKAST,
  suksesskriterier: krav.suksesskriterier || [],
  nyKravVersjon: krav.nyKravVersjon || false,

  // not used
  begrepIder: [],
  etterlevelser: [],
})

export const kravFullQuery = gql`
  query getKrav($id: ID, $kravNummer: Int, $kravVersjon: Int) {
    kravById(id: $id, nummer: $kravNummer, versjon: $kravVersjon) {
      id
      kravNummer
      kravVersjon

      navn
      beskrivelse
      hensikt
      utdypendeBeskrivelse
      versjonEndringer

      dokumentasjon
      implementasjoner
      begrepIder
      begreper {
        id
        navn
        beskrivelse
      }
      varslingsadresser {
        adresse
        type
        slackChannel {
          id
          name
          numMembers
        }
        slackUser {
          id
          name
        }
      }
      rettskilder
      tagger
      regelverk {
        lov {
          code
          shortName
        }
        spesifisering
      }
      periode {
        start
        slutt
      }

      avdeling {
        code
        shortName
      }
      underavdeling {
        code
        shortName
      }
      relevansFor {
        code
        shortName
      }
      suksesskriterier {
        id
        navn
        beskrivelse
      }
      status
    }
  }
`
