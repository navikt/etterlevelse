import axios from 'axios'
import { emptyPage, Krav, KravQL, KravStatus, Or, PageResponse } from '../constants'
import { env } from '../util/env'
import { useEffect, useState } from 'react'
import { useDebouncedState } from '../util/hooks'
import { gql } from '@apollo/client'

export const getAllKrav = async () => {
  const PAGE_SIZE = 100
  const firstPage = await getKravPage(0, PAGE_SIZE)
  if (firstPage.pages === 1) {
    return firstPage.content.length > 0 ? [...firstPage.content] : []
  } else {
    let allKrav: Krav[] = [...firstPage.content]
    for (let currentPage = 1; currentPage < firstPage.pages; currentPage++) {
      allKrav = [...allKrav, ...(await getKravPage(currentPage, PAGE_SIZE)).content]
    }
    return allKrav
  }
}

export const getKravPage = async (pageNumber: number, pageSize: number) => {
  return (await axios.get<PageResponse<Krav>>(`${env.backendBaseUrl}/krav?pageNumber=${pageNumber}&pageSize=${pageSize}`)).data
}

export const getKrav = async (id: string) => {
  return (await axios.get<Krav>(`${env.backendBaseUrl}/krav/${id}`)).data
}

export const deleteKrav = async (id: string) => {
  return (await axios.delete<Krav>(`${env.backendBaseUrl}/krav/${id}`)).data
}

export const searchKrav = async (name: string) => {
  return (await axios.get<PageResponse<Krav>>(`${env.backendBaseUrl}/krav/search/${name}`)).data.content
}

export const searchKravByNumber = async (number: string) => {
  return (await axios.get<PageResponse<Krav>>(`${env.backendBaseUrl}/krav/search/number/${number}`)).data.content
}

export const getKravByKravNumberAndVersion = async (kravNummer: number | string, kravVersjon: number | string) => {
  return await axios
    .get<Krav>(`${env.backendBaseUrl}/krav/kravnummer/${kravNummer}/${kravVersjon}`)
    .then((resp) => {
      return resp.data
    })
    .catch(() => {
      return undefined
    })
}

export const getKravByKravNummer = async (kravNummer: number | string) => {
  return (await axios.get<PageResponse<Krav>>(`${env.backendBaseUrl}/krav/kravnummer/${kravNummer}`)).data
}

export const createKrav = async (krav: KravQL) => {
  const dto = kravToKravDto(krav)
  return (await axios.post<Krav>(`${env.backendBaseUrl}/krav`, dto)).data
}

export const updateKrav = async (krav: KravQL) => {
  const dto = kravToKravDto(krav)
  return (await axios.put<Krav>(`${env.backendBaseUrl}/krav/${krav.id}`, dto)).data
}

function kravToKravDto(krav: KravQL): Krav {
  const dto = {
    ...krav,
    avdeling: krav.avdeling?.code,
    underavdeling: krav.underavdeling?.code,
    relevansFor: krav.relevansFor.map((c) => c.code),
    regelverk: krav.regelverk.map((r) => ({ ...r, lov: r.lov.code })),
    begrepIder: krav.begreper.map((b) => b.id),
    kravIdRelasjoner: krav.kravRelasjoner.map((k) => k.id),
  } as any
  delete dto.changeStamp
  delete dto.version
  delete dto.begreper
  delete dto.kravRelasjoner
  return dto
}

export const useKravPage = (pageSize: number) => {
  const [data, setData] = useState<PageResponse<Krav>>(emptyPage)
  const [page, setPage] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getKravPage(page, pageSize).then((r) => {
      setData(r)
      setLoading(false)
    })
  }, [page, pageSize])

  const prevPage = () => setPage(Math.max(0, page - 1))
  const nextPage = () => setPage(Math.min(data?.pages ? data.pages - 1 : 0, page + 1))

  return [data, prevPage, nextPage, loading] as [PageResponse<Krav>, () => void, () => void, boolean]
}

export type KravIdParams = Or<{ id?: string }, { kravNummer: string; kravVersjon: string }>
export type KravId = Or<{ id?: string }, { kravNummer: number; kravVersjon: number }>

export const useKrav = (params: KravId | KravIdParams, onlyLoadOnce?: boolean) => {
  const isCreateNew = params.id === 'ny'
  const [data, setData] = useState<Krav | undefined>(isCreateNew ? kravMapToFormVal({}) : undefined)

  let load = () => {
    if (data && onlyLoadOnce) return
    params?.id && !isCreateNew && getKrav(params.id).then(setData)
    params?.kravNummer && getKravByKravNumberAndVersion(params.kravNummer, params.kravVersjon).then(setData)
  }
  useEffect(load, [params])

  return [data, setData, load] as [Krav | undefined, (k?: Krav) => void, () => void]
}

export const useSearchKrav = () => {
  const [search, setSearch] = useDebouncedState<string>('', 200)
  const [searchResult, setSearchResult] = useState<Krav[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      if (search && search.length > 2) {
        setLoading(true)

        if (search.toLowerCase().match(/k\d{1,3}/)) {
          let kravNumber = search
          if (kravNumber[0].toLowerCase() === 'k') {
            kravNumber = kravNumber.substring(1)
          }

          if (search.length > 3) {
            if (Number.parseFloat(kravNumber) && Number.parseFloat(kravNumber) % 1 !== 0) {
              const kravNummerMedVersjon = kravNumber.split('.')
              await getKravByKravNumberAndVersion(kravNummerMedVersjon[0], kravNummerMedVersjon[1]).then((res) => {
                if (res && res.status === KravStatus.AKTIV) {
                  setSearchResult([res])
                }
              })
            } else {
              await searchKrav(kravNumber).then((res) => {
                setSearchResult(res.filter((k) => k.status === KravStatus.AKTIV))
              })
            }
          }
        } else {
          await searchKrav(search).then((res) => {
            setSearchResult(res.filter((k) => k.status === KravStatus.AKTIV))
          })
        }

        setLoading(false)
      } else {
        setSearchResult([])
      }
    })()
  }, [search])

  return [searchResult, setSearch, loading] as [Krav[], React.Dispatch<React.SetStateAction<string>>, boolean]
}

export const kravMapToFormVal = (krav: Partial<KravQL>): KravQL => ({
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
  varslingsadresser: krav.varslingsadresser || [],
  rettskilder: krav.rettskilder || [],
  tagger: krav.tagger || [],
  regelverk: krav.regelverk || [],
  hensikt: krav.hensikt || '',
  notat: krav.notat || '',
  varselMelding: krav.varselMelding || '',
  avdeling: krav.avdeling,
  underavdeling: krav.underavdeling,
  periode: krav.periode || { start: undefined, slutt: undefined },
  relevansFor: krav.relevansFor || [],
  status: krav.status || KravStatus.UTKAST,
  suksesskriterier: krav.suksesskriterier || [],
  nyKravVersjon: krav.nyKravVersjon || false,
  tema: (krav.regelverk && krav.regelverk?.length > 0 && krav.regelverk[0].lov && krav.regelverk[0].lov.data && krav.regelverk[0].lov.data.tema) || '',
  kravRelasjoner: krav.kravRelasjoner || [],
  // not used
  begrepIder: [],
  etterlevelser: [],
  kravIdRelasjoner: [],
  aktivertDato: krav.aktivertDato || '',
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
      kravIdRelasjoner
      kravRelasjoner {
        id
        kravNummer
        kravVersjon
        navn
      }
      begrepIder
      begreper {
        id
        navn
        beskrivelse
      }
      changeStamp {
        lastModifiedBy
        lastModifiedDate
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
        behovForBegrunnelse
      }
      status
      aktivertDato
    }
  }
`
export const behandlingKravQuery = gql`
  query getKravByFilter($behandlingId: String, $lover: [String!], $gjeldendeKrav: Boolean, $behandlingIrrevantKrav: Boolean, $status: [String!]) {
    krav(filter: { behandlingId: $behandlingId, lover: $lover, gjeldendeKrav: $gjeldendeKrav, behandlingIrrevantKrav: $behandlingIrrevantKrav, status: $status }) {
      content {
        id
        navn
        kravNummer
        kravVersjon
        varselMelding
        status
        aktivertDato
        kravIdRelasjoner
        kravRelasjoner {
          id
          kravNummer
          kravVersjon
          navn
        }
        suksesskriterier {
          id
          navn
          beskrivelse
        }
        relevansFor {
          code
        }
        regelverk {
          lov {
            code
            shortName
          }
        }
        changeStamp {
          lastModifiedBy
          lastModifiedDate
          createdDate
        }
        etterlevelser(onlyForBehandling: true) {
          id
          etterleves
          fristForFerdigstillelse
          status
          changeStamp {
            lastModifiedBy
            lastModifiedDate
          }
        }
      }
    }
  }
`

export const statsQuery = gql`
  query getBehandlingStats($behandlingId: ID) {
    behandling(filter: { id: $behandlingId }) {
      content {
        stats {
          fyltKrav {
            kravNummer
            kravVersjon
            status
            aktivertDato
            kravIdRelasjoner
            kravRelasjoner {
              id
              kravNummer
              kravVersjon
              navn
            }
            etterlevelser(onlyForBehandling: true) {
              behandlingId
              status
            }
            regelverk {
              lov {
                code
                shortName
              }
            }
            changeStamp {
              lastModifiedBy
              lastModifiedDate
              createdDate
            }
          }
          ikkeFyltKrav {
            kravNummer
            kravVersjon
            status
            aktivertDato
            kravIdRelasjoner
            kravRelasjoner {
              id
              kravNummer
              kravVersjon
              navn
            }
            etterlevelser(onlyForBehandling: true) {
              behandlingId
              status
            }
            regelverk {
              lov {
                code
                shortName
              }
            }
            changeStamp {
              lastModifiedBy
              lastModifiedDate
              createdDate
            }
          }
          irrelevantKrav {
            kravNummer
            kravVersjon
            status
            aktivertDato
            kravIdRelasjoner
            kravRelasjoner {
              id
              kravNummer
              kravVersjon
              navn
            }
            etterlevelser(onlyForBehandling: true) {
              behandlingId
              status
            }
            regelverk {
              lov {
                code
                shortName
              }
            }
            changeStamp {
              lastModifiedBy
              lastModifiedDate
              createdDate
            }
          }
          lovStats {
            lovCode {
              code
              shortName
            }
            fyltKrav {
              id
              kravNummer
              kravVersjon
              status
              navn
              kravIdRelasjoner
              kravRelasjoner {
                id
                kravNummer
                kravVersjon
                navn
              }
              changeStamp {
                lastModifiedBy
                lastModifiedDate
                createdDate
              }
            }
            ikkeFyltKrav {
              id
              kravNummer
              kravVersjon
              status
              aktivertDato
              navn
              kravIdRelasjoner
              kravRelasjoner {
                id
                kravNummer
                kravVersjon
                navn
              }
              changeStamp {
                lastModifiedBy
                lastModifiedDate
                createdDate
              }
            }
          }
        }
      }
    }
  }
`
