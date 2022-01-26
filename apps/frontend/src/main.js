import { ApolloProvider } from '@apollo/client'
import { BaseProvider } from 'baseui'
import { Block } from 'baseui/block'
import { Helmet } from 'react-helmet'
import {BrowserRouter} from 'react-router-dom'
import { Client as Styletron } from 'styletron-engine-atomic'
import { Provider as StyletronProvider } from 'styletron-react'
import { apolloClient } from './api/ApolloClient'
import Header from './components/Header'
import { Footer } from './components/Navigation/Footer'
import AppRoutes from './AppRoutes'
import { ampli } from './services/Amplitude'
import { codelist } from './services/Codelist'
import { useAwait, useAwaitUser } from './util/hooks'
import { useNetworkStatus } from './util/network'
import { customTheme, ettlevColors } from './util/theme'

const engine = new Styletron()

const containerProps = {
  backgroundColor: '#F8F8F8',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
}

ampli.logEvent('visit_count_etterlevelse')

const Main = (props) => {
  const { history } = props
  useAwaitUser()
  useAwait(codelist.wait())

  return (
    <StyletronProvider value={engine}>
      <BaseProvider theme={customTheme}>
        <ApolloProvider client={apolloClient}>
          <BrowserRouter history={history}>
            <Helmet>
              <meta charSet="utf-8" />
              <title>Etterlevelse Beta</title>
            </Helmet>

            <Block {...containerProps} minHeight="100vh" position="relative">
              <Block {...containerProps} display="flex" flexDirection="column">
                <Header />
                <AppRoutes />
              </Block>
              <Block backgroundColor={ettlevColors.grey25} height={'150px'} width={'100%'}>
                {/* <HeadingLarge>Hvordan opplever du løsningen?</HeadingLarge> */}
              </Block>
              <Footer />
            </Block>
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
