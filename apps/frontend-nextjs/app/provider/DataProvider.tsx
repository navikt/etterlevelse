'use client'

import { ApolloProvider } from '@apollo/client/react'
import moment from 'moment'
import 'moment/locale/nb'
import { FunctionComponent, ReactNode } from 'react'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { apolloClient } from '@/api/apolloClient/apolloClient'

// Set Norwegian locale globally for moment
moment.locale('nb')

type TProps = {
  children: ReactNode
}

const DataProvider: FunctionComponent<TProps> = ({ children }) => (
  <HelmetProvider>
    <Helmet>
      <meta charSet='utf-8' />
      <title>Etterlevelse</title>
    </Helmet>
    <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
  </HelmetProvider>
)

export default DataProvider
