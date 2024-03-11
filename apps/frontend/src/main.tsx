import { ApolloProvider } from '@apollo/client'
import { Helmet } from 'react-helmet'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './AppRoutes'
import { apolloClient } from './api/ApolloClient'
import Header from './components/Header'
import { Footer } from './components/Navigation/Footer'
import { codelist } from './services/Codelist'
import { useAwait, useAwaitUser } from './util/hooks/customHooks'
import { useNetworkStatus } from './util/network'

// ampli.logEvent('sidevisning', { sidetittel: 'Etterlevelse' })

const Main = () => {
  useAwaitUser()
  useAwait(codelist.wait())

  return (
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
  )
}

const ErrorModal = () => {
  return useNetworkStatus()
}

export default Main
