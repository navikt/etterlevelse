'use client'

import { ApolloProvider } from '@apollo/client'
import { FunctionComponent, ReactNode } from 'react'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { apolloClient } from './api/apolloClient/apolloClient'
import { Footer } from './components/others/layout/footer/footer'
import Header from './components/others/layout/header/header'
import './globals.css'
import { useAwaitUser } from './util/hooks/customHooks/customHooks'

type TProps = {
  children: ReactNode
}

const Main: FunctionComponent<TProps> = ({ children }) => {
  useAwaitUser()
  return (
    <html lang='no'>
      <body>
        <HelmetProvider>
          <ApolloProvider client={apolloClient}>
            <Helmet>
              <meta charSet='utf-8' />
              <title>Etterlevelse</title>
            </Helmet>

            <div className='flex flex-col w-full items-center min-h-screen bg-white'>
              <Header />
              {children}
              <Footer />
            </div>
          </ApolloProvider>
        </HelmetProvider>
      </body>
    </html>
  )
}

export default Main
