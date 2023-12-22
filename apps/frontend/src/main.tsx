import { ApolloProvider } from '@apollo/client'
import { BaseProvider } from 'baseui'
import { Helmet } from 'react-helmet'
import { BrowserRouter } from 'react-router-dom'
import { Client as Styletron } from 'styletron-engine-atomic'
import { Provider as StyletronProvider } from 'styletron-react'
import { apolloClient } from './api/ApolloClient'
import Header from './components/Header'
import AppRoutes from './AppRoutes'
import { codelist } from './services/Codelist'
import { useAwait, useAwaitUser } from './util/hooks'
import { useNetworkStatus } from './util/network'
import { customTheme } from './util/theme'
import { Footer } from './components/Navigation/Footer'

const engine = new Styletron()

// ampli.logEvent('sidevisning', { sidetittel: 'Etterlevelse' })

const Main = (props: any) => {
  useAwaitUser()
  useAwait(codelist.wait())

  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={customTheme}>
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
      </BaseProvider>
    </StyletronProvider>
  )
}

const ErrorModal = () => {
  return useNetworkStatus()
}

export default Main
