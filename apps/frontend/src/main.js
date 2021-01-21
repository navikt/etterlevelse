import {ApolloProvider} from '@apollo/client'
import {BaseProvider} from 'baseui'
import {Block} from 'baseui/block'
import * as React from 'react'
import {BrowserRouter as Router} from 'react-router-dom'
import {Client as Styletron} from 'styletron-engine-atomic'
import {Provider as StyletronProvider} from 'styletron-react'
import {apolloClient} from './api/ApolloClient'
import Header from './components/Header'
import SideBar from './components/Navigation/SideBar'
import Routes from './routes'
import {ampli} from './services/Amplitude'
import {codelist} from './services/Codelist'
import {user} from './services/User'
import {useAwait} from './util/hooks'
import {useNetworkStatus} from './util/network'
import {customTheme} from './util/theme'

const engine = new Styletron()

const sidebarMargin = ['5px', '5px', `${180 + 40}px`, `${210 + 60}px`] //Width of sidebar + margin

const containerProps = {
  height: '100%',
  display: 'flex',
}
const headerProps = {
  marginLeft: sidebarMargin,
  width: ['100%', '95%', '75%', '75%'],
  marginBottom: '50px',
}

const mainContentProps = {
  height: '100%',
  width: ['100%', '95%', '75%', '75%'],
  marginLeft: sidebarMargin,
  marginTop: '4rem',
}

ampli.logEvent('visit_count_etterlevelse')

const Main = (props) => {
  const {history} = props
  useAwait(user.wait())
  useAwait(codelist.wait())

  return (
    <React.Fragment>
      <StyletronProvider value={engine}>
        <BaseProvider theme={customTheme}>
          <ApolloProvider client={apolloClient}>
            <Router history={history}>
              <Block {...containerProps}>
                <Block display={['none', 'none', 'block', 'block']}>
                  <SideBar/>
                </Block>

                <Block width="100%">
                  <Block {...headerProps}>
                    <Header/>
                  </Block>
                  <Block {...mainContentProps}>
                    <Routes/>
                  </Block>
                </Block>
              </Block>
            </Router>
            <ErrorModal/>
          </ApolloProvider>
        </BaseProvider>
      </StyletronProvider>
    </React.Fragment>
  )
}

const ErrorModal = () => {
  return useNetworkStatus()
}

export default Main
