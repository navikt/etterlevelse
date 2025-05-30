import { gql, useQuery } from '@apollo/client'
import { QueryHookOptions } from '@apollo/client/react/types/types'
import { IPageResponse, TKravFilters, TKravQL } from '../constants'

export const useKravFilter = (
  variables: TKravFilters,
  options?: QueryHookOptions<any, TKravFilters>,
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

export const useKravCounter = (
  variables: { lover: string[] },
  options?: QueryHookOptions<any, { lover?: string[] }>
) => {
  let filter = {}
  if (options) {
    filter = { ...options }
  }
  filter = { ...filter, variables }
  return useQuery<{ krav: IPageResponse<TKravQL> }, TKravFilters>(getKravByLovCodeQuery, filter)
}

// eslint-disable-next-line "@typescript-eslint/no-restricted-types"
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

// eslint-disable-next-line "@typescript-eslint/no-restricted-types"
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

export const getKravMedPrioriteringOgEtterlevelseQuery = gql`
  query getKravByFilter(
    $etterlevelseDokumentasjonId: ID
    $lover: [String!]
    $tema: String!
    $gjeldendeKrav: Boolean
    $etterlevelseDokumentasjonIrrevantKrav: Boolean
    $status: [String!]
  ) {
    krav(
      filter: {
        etterlevelseDokumentasjonId: $etterlevelseDokumentasjonId
        lover: $lover
        tema: $tema
        gjeldendeKrav: $gjeldendeKrav
        etterlevelseDokumentasjonIrrevantKrav: $etterlevelseDokumentasjonIrrevantKrav
        status: $status
      }
    ) {
      content {
        navn
        kravNummer
        kravVersjon
        status
        prioriteringsId
        etterlevelser(
          onlyForEtterlevelseDokumentasjon: true
          etterlevelseDokumentasjonId: $etterlevelseDokumentasjonId
        ) {
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
export const getKravWithEtterlevelseQuery = gql`
  query getKravWithEtterlevelse($id: ID, $kravNummer: Int, $kravVersjon: Int) {
    kravById(id: $id, nummer: $kravNummer, versjon: $kravVersjon) {
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
      virkemidler {
        id
        navn
      }
      virkemiddelIder
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
// eslint-enable-next-line @typescript-eslint/ban-types
