import { IPageResponse } from '@/constants/commonConstants'
import { TKravFilters, TKravQL } from '@/constants/krav/kravConstants'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

export const useKravCounter = (
  variables: { lover: string[] },
  options?: useQuery.Options<any, { lover?: string[] }>
) => {
  let filter = {}
  if (options) {
    filter = { ...options }
  }
  filter = { ...filter, variables }
  return useQuery<{ krav: IPageResponse<TKravQL> }, TKravFilters>(getKravByLovCodeQuery, filter)
}

export const useKravFilter = (
  variables: TKravFilters,
  options?: useQuery.Options<any, TKravFilters>,
  onlyForEtterlevelseDokumet?: boolean
) => {
  let filter = {}
  if (options) {
    filter = { ...options }
  }
  filter = { ...filter, variables }
  return useQuery<{ krav: IPageResponse<TKravQL> }, TKravFilters>(
    onlyForEtterlevelseDokumet
      ? getKravtableQueryOnlyForEtterlevelseDokumentasjon
      : getKravtableQuery,
    filter
  )
}

const getKravByLovCodeQuery = gql`
  query countKrav($lover: [String!]) {
    krav(filter: { lover: $lover, gjeldendeKrav: true }) {
      numberOfElements
      content {
        id
        kravNummer
        kravVersjon
        navn
        relevansFor {
          code
        }
      }
    }
  }
`

export const getKravWithEtterlevelseQuery = gql`
  query getKravWithEtterlevelse($kravId: ID, $kravNummer: Int, $kravVersjon: Int) {
    kravById(id: $kravId, nummer: $kravNummer, versjon: $kravVersjon) {
      id
      kravNummer
      kravVersjon
      changeStamp {
        lastModifiedBy
        lastModifiedDate
      }
      navn
      beskrivelse
      hensikt
      notat
      varselMelding
      utdypendeBeskrivelse
      versjonEndringer
      aktivertDato
      dokumentasjon
      implementasjoner
      begrepIder
      begreper {
        id
        navn
        beskrivelse
      }
      varslingsadresserQl {
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
      regelverk {
        lov {
          code
          shortName
        }
        spesifisering
      }
      tagger

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
      status

      suksesskriterier {
        id
        navn
        beskrivelse
        behovForBegrunnelse
      }

      kravIdRelasjoner
      kravRelasjoner {
        id
        kravNummer
        kravVersjon
        navn
      }
      etterlevelser(onlyForEtterlevelseDokumentasjon: false) {
        id
        etterlevelseDokumentasjon {
          id
          etterlevelseNummer
          title
          teamsData {
            id
            name
            productAreaId
            productAreaName
          }
        }
        changeStamp {
          lastModifiedDate
          lastModifiedBy
        }
        status
        suksesskriterieBegrunnelser {
          suksesskriterieId
          begrunnelse
          suksesskriterieStatus
        }
      }
    }
  }
`

const getKravtableQueryOnlyForEtterlevelseDokumentasjon = gql`
  query getKravByFilter(
    $relevans: [String!]
    $etterlevelseDokumentasjonId: ID
    $nummer: Int
    $underavdeling: String
    $lov: String
    $status: [String!]
    $lover: [String!]
    $tagger: [String!]
    $sistRedigert: NonNegativeInt
    $gjeldendeKrav: Boolean
    $pageSize: NonNegativeInt
    $pageNumber: NonNegativeInt
  ) {
    krav(
      filter: {
        relevans: $relevans
        nummer: $nummer
        underavdeling: $underavdeling
        etterlevelseDokumentasjonId: $etterlevelseDokumentasjonId
        lov: $lov
        status: $status
        lover: $lover
        tagger: $tagger
        sistRedigert: $sistRedigert
        gjeldendeKrav: $gjeldendeKrav
      }
      pageSize: $pageSize
      pageNumber: $pageNumber
    ) {
      pages
      pageNumber
      pageSize
      paged
      numberOfElements
      totalElements
      content {
        id
        navn
        kravNummer
        kravVersjon
        status
        varselMelding
        avdeling {
          code
          shortName
        }
        regelverk {
          lov {
            code
            shortName
          }
        }
        underavdeling {
          code
          shortName
        }
        etterlevelser(onlyForEtterlevelseDokumentasjon: true) {
          id
          status
        }
        changeStamp {
          lastModifiedDate
        }
      }
    }
  }
`

const getKravtableQuery = gql`
  query getKravByFilter(
    $relevans: [String!]
    $nummer: Int
    $underavdeling: String
    $etterlevelseDokumentasjonId: ID
    $lov: String
    $status: [String!]
    $lover: [String!]
    $tagger: [String!]
    $sistRedigert: NonNegativeInt
    $gjeldendeKrav: Boolean
    $pageSize: NonNegativeInt
    $pageNumber: NonNegativeInt
  ) {
    krav(
      filter: {
        relevans: $relevans
        nummer: $nummer
        underavdeling: $underavdeling
        etterlevelseDokumentasjonId: $etterlevelseDokumentasjonId
        lov: $lov
        status: $status
        lover: $lover
        tagger: $tagger
        sistRedigert: $sistRedigert
        gjeldendeKrav: $gjeldendeKrav
      }
      pageSize: $pageSize
      pageNumber: $pageNumber
    ) {
      pages
      pageNumber
      pageSize
      paged
      numberOfElements
      totalElements
      content {
        id
        navn
        kravNummer
        kravVersjon
        status
        varselMelding
        avdeling {
          code
          shortName
        }
        regelverk {
          lov {
            code
            shortName
          }
        }
        underavdeling {
          code
          shortName
        }
        etterlevelser(onlyForEtterlevelseDokumentasjon: false) {
          id
        }
        changeStamp {
          lastModifiedDate
        }
      }
    }
  }
`
