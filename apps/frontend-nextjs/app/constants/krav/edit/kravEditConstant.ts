import { ApolloClient } from '@apollo/client'
import { TKravId, TKravQL } from '../kravConstants'

export type TKravById = {
  kravById: TKravQL
}

export interface IKravDataProps {
  kravQuery: TKravById
  kravLoading: boolean
  reloadKrav: (variables?: Partial<TKravId> | undefined) => Promise<
    ApolloClient.QueryResult<{
      kravById: TKravQL
    }>
  >
}
