import { ApolloProvider } from '@apollo/client'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './AppRoutes'
import { apolloClient } from './api/ApolloClient'
import Header from './components/Header'
import { Footer } from './components/Navigation/Footer'
import { CodelistService } from './services/Codelist'
import { useAwait, useAwaitUser } from './util/hooks/customHooks'
import { useNetworkStatus } from './util/network'

// ampli.logEvent('sidevisning', { sidetittel: 'Etterlevelse' })

const Main = () => {
  useAwaitUser()
  const [codelistUtils] = CodelistService()
  useAwait(codelistUtils.fetchData())

  return (
    <HelmetProvider>
      <ApolloProvider client={apolloClient}>
        <BrowserRouter window={window}>
          <Helmet>
            <meta charSet='utf-8' />
            <title>Etterlevelse</title>
          </Helmet>

          <div className='flex flex-col w-full items-center min-h-screen bg-white'>
            <Header />
            <AppRoutes />
            <Footer />
          </div>
        </BrowserRouter>
        <ErrorModal />
      </ApolloProvider>
    </HelmetProvider>
  )
}

const ErrorModal = () => {
  return useNetworkStatus()
}

export default Main
