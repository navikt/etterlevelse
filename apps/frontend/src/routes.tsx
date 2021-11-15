import * as React from 'react'
import {Route, Switch} from 'react-router-dom'
import {MainPage} from './pages/MainPage'
import NotFound from './pages/NotFound'
import CodeListPage from './components/admin/CodeList/CodelistPage'
import {AuditPage} from './components/admin/audit/AuditPage'
import {SettingsPage} from './components/admin/settings/SettingsPage'
import {MailLogPage} from './components/admin/maillog/MailLogPage'
import {KravListPage} from './pages/KravListPageV2'
import {KravPage} from './pages/KravPage'
import {EtterlevelseListPage} from './pages/EtterlevelseListPage'
import {EtterlevelsePage} from './pages/EtterlevelsePage'
import {BehandlingPage} from './pages/BehandlingPage'
import {MyBehandlingerPage} from './pages/MyBehandlingerPage'
import {RelevansPage} from './pages/RelevansPage'
import {UnderavdelingPage} from './pages/UnderavdelingPage'
import {TemaPage} from './pages/TemaPage'
import {LovPage} from './pages/LovPage'
import {MainPageV2} from './pages/MainPageV2'
import {BehandlingerTemaPage} from './pages/BehandlingerTemaPage'
import ScrollToTop from './util/ScrollToTop'
import {StatusPage} from './pages/StatusPage'
import {KravTablePage} from "./pages/KravTablePage";

const Routes = (): JSX.Element => (
  <ScrollToTop>
    <Switch>
      <Route exact path="/old" component={MainPage} />
      <Route exact path="/" component={MainPageV2} />

      <Route exact path="/krav" component={KravListPage} />
      <Route exact path="/krav/:id" component={KravPage} />
      <Route exact path="/krav/:kravNummer/:kravVersjon" component={KravPage} />

      <Route exact path="/etterlevelse" component={EtterlevelseListPage} />
      <Route exact path="/etterlevelse/:id" component={EtterlevelsePage} />

      <Route exact path="/behandling/:id/:tema" component={BehandlingerTemaPage} />
      <Route exact path="/behandlinger/:tab?" component={MyBehandlingerPage} />

      <Route exact path="/relevans/:relevans?" component={RelevansPage} />
      <Route exact path="/underavdeling/:underavdeling?" component={UnderavdelingPage} />
      <Route exact path="/lov/:lov?" component={LovPage} />

      <Route exact path="/admin/codelist/:listname?" component={CodeListPage} />
      <Route exact path="/admin/audit/:id?/:auditId?" component={AuditPage} />
      <Route exact path="/admin/settings" component={SettingsPage} />
      <Route exact path="/admin/maillog" component={MailLogPage} />
      <Route exact path="/admin/krav" component={KravTablePage} />

      <Route exact path="/tema/:tema?" component={TemaPage} />
      <Route exact path="/behandling/:id" component={BehandlingPage} />
      <Route exact path="/status" component={StatusPage} />

      <Route component={NotFound} />
    </Switch>
  </ScrollToTop>
)

export default Routes
