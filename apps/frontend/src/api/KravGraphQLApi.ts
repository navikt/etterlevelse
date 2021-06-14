import { KravQL, PageResponse } from '../constants'
import { gql, useQuery } from '@apollo/client'
import { QueryHookOptions } from '@apollo/client/react/types/types'

const kravtableQuery = gql`
  query getKravByFilter(
    $relevans: [String!]
    $nummer: Int
    $behandlingId: String
    $underavdeling: String
    $lov: String
    $lover: [String!]
    $sistRedigert: NonNegativeInt
    $gjeldendeKrav: Boolean
    $pageSize: NonNegativeInt
    $pageNumber: NonNegativeInt
  ) {
    krav(
      filter: {
        relevans: $relevans
        nummer: $nummer
        behandlingId: $behandlingId
        underavdeling: $underavdeling
        lov: $lov
        lover: $lover
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
        regelverk {
          lov {
            code
            shortName
          }
        }
        etterlevelser {
          id
        }
      }
    }
  }
`

export type KravFilters = {
  relevans?: string[]
  nummer?: number
  behandlingId?: string
  underavdeling?: string
  lov?: string
  lover?: string[]
  gjeldendeKrav?: boolean
  sistRedigert?: number
  pageNumber?: number
  pageSize?: number
}

export const useKravFilter = (variables: KravFilters, options?: QueryHookOptions<any, KravFilters>) => {
  return useQuery<{ krav: PageResponse<KravQL> }, KravFilters>(kravtableQuery, {
    ...(options || {}),
    variables,
  })
}
