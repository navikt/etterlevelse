'use client'

import { codelist } from '@/services/kodeverk/kodeverkService'
import { useAwait, useAwaitUser } from '@/util/hooks/customHooks/customHooks'
import { ApolloProvider } from '@apollo/client'
import { FunctionComponent, ReactNode } from 'react'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { apolloClient } from './apolloClient/apolloClient'

type TProps = {
  children: ReactNode
}

export const DataProvider: FunctionComponent<TProps> = ({ children }) => {
  useAwaitUser()
  useAwait(codelist.wait())

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
