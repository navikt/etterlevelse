import * as React from 'react'
import { Route, BrowserRouter } from 'react-router-dom'
import { MainPage } from './pages/MainPage'
import NotFound from './pages/NotFound'
import CodeListPage from './components/admin/CodeList/CodelistPage'
import { AuditPage } from './components/admin/audit/AuditPage'
import { SettingsPage } from './components/admin/settings/SettingsPage'
import { MailLogPage } from './components/admin/maillog/MailLogPage'
import { KravListPage } from './pages/KravListPage'
import { KravPage } from './pages/KravPage'
import { EtterlevelseListPage } from './pages/EtterlevelseListPage'
import { EtterlevelsePage } from './pages/EtterlevelsePage'
import { BehandlingPage } from './pages/BehandlingPage'
import { MyBehandlingerPage } from './pages/MyBehandlingerPage'
import { RelevansPage } from './pages/RelevansPage'
import { UnderavdelingPage } from './pages/UnderavdelingPage'
import { TemaPage } from './pages/TemaPage'
import { LovPage } from './pages/LovPage'
import { MainPageV2 } from './pages/MainPageV2'
import { BehandlingerTemaPage } from './pages/BehandlingerTemaPage'
import ScrollToTop from './util/ScrollToTop'
import { StatusPage } from './pages/StatusPage'
import { KravTablePage } from './pages/KravTablePage'
import { FAQ } from './pages/FAQ'
import SpørsmålOgSvarLogPage from './pages/SpørsmålOgSvarLogPage'
import { BehandlingerTemaPageV2 } from './pages/BehandlingerTemaPageV2'

const Routes = (): JSX.Element => (
  <ScrollToTop>
    <BrowserRouter>
      <Route path="/old" element={MainPage} />
      <Route path="/" element={MainPageV2} />

      <Route path="/kraver/:tab?" element={KravListPage} />
      <Route path="/krav/:id" element={KravPage} />
      <Route path="/krav/:kravNummer/:kravVersjon" element={KravPage} />

      <Route path="/etterlevelse" element={EtterlevelseListPage} />
      <Route path="/etterlevelse/:id" element={EtterlevelsePage} />

      <Route path="/behandling/:id/:tema" element={BehandlingerTemaPage} />
      <Route path="/behandlingtest/:id/:tema" element={BehandlingerTemaPageV2} />
      <Route path="/behandlinger/:tab?" element={MyBehandlingerPage} />

      <Route path="/relevans/:relevans?" element={RelevansPage} />
      <Route path="/underavdeling/:underavdeling?" element={UnderavdelingPage} />
      <Route path="/lov/:lov?" element={LovPage} />

      <Route path="/admin/codelist/:listname?" element={CodeListPage} />
      <Route path="/admin/audit/:id?/:auditId?" element={AuditPage} />
      <Route path="/admin/settings" element={SettingsPage} />
      <Route path="/admin/maillog" element={MailLogPage} />
      <Route path="/admin/krav" element={KravTablePage} />
      <Route path="/admin/messageslog" element={SpørsmålOgSvarLogPage} />

      <Route path="/tema/:tema?" element={TemaPage} />
      <Route path="/behandling/:id" element={BehandlingPage} />
      <Route path="/status" element={StatusPage} />
      <Route path="/help" element={FAQ} />

      <Route element={NotFound} />
    </BrowserRouter>
  </ScrollToTop>
)

export default Routes
