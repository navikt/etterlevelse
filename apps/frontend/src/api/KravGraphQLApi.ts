import { gql, useQuery } from '@apollo/client'
import { QueryHookOptions } from '@apollo/client/react/types/types'
import { KravQL, IPageResponse } from '../constants'

// eslint-disable-next-line @typescript-eslint/ban-types
const kravtableQuery = gql`
  query getKravByFilter(
    $relevans: [String!]
    $nummer: Int
    $underavdeling: String
    $lov: String
    $status: [String!]
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
        underavdeling: $underavdeling
        lov: $lov
        status: $status
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
        etterlevelser {
          id
        }
        changeStamp {
          lastModifiedDate
        }
      }
    }
  }
`
// eslint-enable-next-line @typescript-eslint/ban-types

export type KravFilters = {
  relevans?: string[]
  nummer?: number
  etterlevelseDokumentasjonId?: string
  underavdeling?: string
  lov?: string
  status?: string[]
  lover?: string[]
  gjeldendeKrav?: boolean
  sistRedigert?: number
  pageNumber?: number
  pageSize?: number
}

export const useKravFilter = (
  variables: KravFilters,
  options?: QueryHookOptions<any, KravFilters>
) => {
  return useQuery<{ krav: IPageResponse<KravQL> }, KravFilters>(kravtableQuery, {
    ...(options || {}),
    variables,
  })
}
