import { ApolloQueryResult } from '@apollo/client'
import { TKravQL } from '../kravConstants'

export type TKravById = {
  kravById: TKravQL
}

export interface IKravDataProps {
  kravQuery: TKravById
  kravLoading: boolean
  reloadKrav: Promise<
    ApolloQueryResult<{
      kravById: TKravQL
    }>
  >
}
