import {KravQL} from '../constants'
import {gql, useQuery} from '@apollo/client'
import {DocumentNode} from 'graphql'

const kravtableQuery = gql`query getKravByFilter ($relevans: [String!], $nummer: Int, $behandlingId: String, $underavdeling: String, $lov: String) {
  krav(filter: {relevans: $relevans, nummer: $nummer, behandlingId: $behandlingId, underavdeling: $underavdeling, lov: $lov}) {
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
}`

export type KravFilters = {relevans?: string[], nummer?: number, behandlingId?: string, underavdeling?: string, lov?: string}

export const useKravFilter = (variables: KravFilters, query?: DocumentNode) => {
  const {data, loading} = useQuery<{krav: KravQL[]}, KravFilters>(query || kravtableQuery, {
    variables
  })
  return {data: data?.krav, loading}
}
