import { ApolloProvider } from '@apollo/client'
import { Helmet } from 'react-helmet'
import { BrowserRouter } from 'react-router-dom'
import { Client as Styletron } from 'styletron-engine-atomic'
import { Provider as StyletronProvider } from 'styletron-react'
import AppRoutes from './AppRoutes'
import { apolloClient } from './api/ApolloClient'
import Header from './components/Header'
import { Footer } from './components/Navigation/Footer'
import { codelist } from './services/Codelist'
import { useAwait, useAwaitUser } from './util/hooks/customHooks'
import { useNetworkStatus } from './util/network'

const engine = new Styletron()

// ampli.logEvent('sidevisning', { sidetittel: 'Etterlevelse' })

const Main = () => {
  useAwaitUser()
  useAwait(codelist.wait())

  return (
    <StyletronProvider value={engine}>
        <ApolloProvider client={apolloClient}>
          <BrowserRouter window={window}>
            <Helmet>
              <meta charSet="utf-8" />
              <title>Etterlevelse</title>
            </Helmet>

            <div className="flex flex-col w-full items-center min-h-screen bg-white">
              <Header />
              <AppRoutes />
              <Footer />
            </div>
          </BrowserRouter>
          <ErrorModal />
        </ApolloProvider>
    </StyletronProvider>
  )
}

const ErrorModal = () => {
  return useNetworkStatus()
}

export default Main
