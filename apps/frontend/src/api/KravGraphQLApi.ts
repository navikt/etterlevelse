import { gql, useQuery } from '@apollo/client'
import { QueryHookOptions } from '@apollo/client/react/types/types'
import { IPageResponse, TKravFilters, TKravQL } from '../constants'

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

export const useKravFilter = (
  variables: TKravFilters,
  options?: QueryHookOptions<any, TKravFilters>
) => {
  return useQuery<{ krav: IPageResponse<TKravQL> }, TKravFilters>(kravtableQuery, {
    ...(options || {}),
    variables,
  })
}
