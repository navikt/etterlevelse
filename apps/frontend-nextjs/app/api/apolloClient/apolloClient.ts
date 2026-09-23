import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { env } from '@/util/env/env'

export const apolloClient: ApolloClient = new ApolloClient({
  link: new HttpLink({
    uri: `${env.backendBaseUrl}/graphql`,
  }),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
})
