import {KravQL, PageResponse} from '../constants'
import {gql, useQuery} from '@apollo/client'
import {DocumentNode} from 'graphql'

const kravtableQuery = gql`query getKravByFilter ($relevans: [String!], $nummer: Int, $behandlingId: String, $underavdeling: String, $lov: String, $sistRedigert: NonNegativeInt, $pageSize: NonNegativeInt, $pageNumber: NonNegativeInt) {
  krav(filter: {relevans: $relevans, nummer: $nummer, behandlingId: $behandlingId, underavdeling: $underavdeling, lov: $lov, sistRedigert: $sistRedigert}, pageSize: $pageSize, pageNumber: $pageNumber) {
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
      etterlevelser {
        id
      }
    }
  }
}`

export type KravFilters = {
  relevans?: string[],
  nummer?: number,
  behandlingId?: string,
  underavdeling?: string,
  lov?: string,
  sistRedigert?: number
  pageNumber?: number
  pageSize?: number
}

export const useKravFilter = (variables: KravFilters, query?: DocumentNode) => {
  return useQuery<{krav: PageResponse<KravQL>}, KravFilters>(query || kravtableQuery, {
    variables
  })
}
