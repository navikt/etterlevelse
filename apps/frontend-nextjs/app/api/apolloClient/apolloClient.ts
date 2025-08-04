import { env } from '@/util/env/env'
import { ApolloClient, InMemoryCache, NormalizedCacheObject } from '@apollo/client'

export const apolloClient: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  uri: `${env.backendBaseUrl}/graphql`,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
})
