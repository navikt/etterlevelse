'use client'

import { apolloClient } from '@/api/apolloClient/apolloClient'
import { ApolloProvider } from '@apollo/client/react'
import { FunctionComponent, ReactNode } from 'react'
import { Helmet, HelmetProvider } from 'react-helmet-async'

type TProps = {
  children: ReactNode
}

export const DataProvider: FunctionComponent<TProps> = ({ children }) => {
  return (
    <HelmetProvider>
      <Helmet>
        <meta charSet='utf-8' />
        <title>Etterlevelse</title>
      </Helmet>
      <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
    </HelmetProvider>
  )
}

export default DataProvider
