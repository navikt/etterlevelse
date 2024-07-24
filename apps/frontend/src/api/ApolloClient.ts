import { ApolloClient, InMemoryCache } from '@apollo/client'
import { env } from '../util/env'

export const apolloClient = new ApolloClient({
  uri: env.backendBaseUrl + '/graphql',
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
})
