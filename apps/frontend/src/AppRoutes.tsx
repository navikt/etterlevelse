import * as React from 'react'
import {Route, Routes} from 'react-router-dom'
import {MainPage} from './pages/MainPage'
import NotFound from './pages/NotFound'
import CodeListPage from './components/admin/CodeList/CodelistPage'
import {AuditPage} from './components/admin/audit/AuditPage'
import {SettingsPage} from './components/admin/settings/SettingsPage'
import {MailLogPage} from './components/admin/maillog/MailLogPage'
import {KravListPage} from './pages/KravListPage'
import {KravPage} from './pages/KravPage'
import {EtterlevelseListPage} from './pages/EtterlevelseListPage'
import {EtterlevelsePage} from './pages/EtterlevelsePage'
import {BehandlingPage} from './pages/BehandlingPage'
import {MyBehandlingerPage} from './pages/MyBehandlingerPage'
import {RelevansPage} from './pages/RelevansPage'
import {UnderavdelingPage} from './pages/UnderavdelingPage'
import {TemaPage} from './pages/TemaPage'
import {LovPage} from './pages/LovPage'
import ScrollToTop from './util/ScrollToTop'
import {StatusPage} from './pages/StatusPage'
import {KravTablePage} from './pages/KravTablePage'
import {FAQ} from './pages/FAQ'
import QuestionAndAnswerLogPage from './pages/QuestionAndAnswerLogPage'
import {BehandlingTemaPage} from './pages/BehandlingTemaPage'
import {VarselPage} from './pages/VarselPage'
import {EtterlevelseDokumentasjonPage} from './pages/EtterlevelseDokumentasjonPage'
import Forbidden from './pages/Forbidden'
import EtterlevelseAdminPage from './pages/EtterlevelseAdminPage'
import PrivateRoute from './util/PrivateRoute'
import ArkivAdminPage from './pages/ArkivAdminPage'

const AppRoutes = (): JSX.Element => {
  return (
    <ScrollToTop>
      <Routes>
        <Route path="/old" element={<MainPage/>} caseSensitive={true}/>
        <Route path="/" element={<MainPage/>} caseSensitive={true}/>

        <Route path="/kravliste/:tab" element={<PrivateRoute component={<KravListPage/>} kraveierPage/>} caseSensitive={true}/>
        <Route path="/kravliste/" element={<PrivateRoute component={<KravListPage/>} kraveierPage/>} caseSensitive={true}/>
        <Route path="/krav/:id" element={<KravPage/>} caseSensitive={true}/>
        <Route path="/krav/:kravNummer/:kravVersjon" element={<KravPage/>} caseSensitive={true}/>

        <Route path="/etterlevelse" element={<EtterlevelseListPage/>} caseSensitive={true}/>
        <Route path="/etterlevelse/:id" element={<EtterlevelsePage/>} caseSensitive={true}/>

        <Route path="/behandling/:id/:tema/:filter/krav/:kravNummer/:kravVersjon" element={<PrivateRoute component={<EtterlevelseDokumentasjonPage/>}/>} caseSensitive={true}/>
        <Route path="/behandling/:id/:tema/" element={<PrivateRoute component={<BehandlingTemaPage/>}/>} caseSensitive={true}/>
        <Route path="/behandling/:id/:tema/:filter" element={<PrivateRoute component={<BehandlingTemaPage/>}/>} caseSensitive={true}/>
        <Route path="/behandling/:id" element={<PrivateRoute component={<BehandlingPage/>}/>} caseSensitive={true}/>
        <Route path="/behandling/" element={<MyBehandlingerPage/>} caseSensitive={true}/>

        <Route path="/behandlinger/:tab" element={<MyBehandlingerPage/>} caseSensitive={true}/>
        <Route path="/behandlinger/" element={<MyBehandlingerPage/>} caseSensitive={true}/>

        <Route path="/relevans/:relevans" element={<RelevansPage/>} caseSensitive={true}/>
        <Route path="/relevans/" element={<RelevansPage/>} caseSensitive={true}/>

        <Route path="/underavdeling/:underavdeling" element={<UnderavdelingPage/>} caseSensitive={true}/>
        <Route path="/underavdeling/" element={<UnderavdelingPage/>} caseSensitive={true}/>

        <Route path="/lov/:lov" element={<LovPage/>} caseSensitive={true}/>
        <Route path="/lov/" element={<LovPage/>} caseSensitive={true}/>

        <Route path="/admin/codelist/:listname" element={<PrivateRoute component={<CodeListPage/>} adminPage/>} caseSensitive={true}/>
        <Route path="/admin/codelist/" element={<PrivateRoute component={<CodeListPage/>} adminPage/>} caseSensitive={true}/>

        <Route path="/admin/audit/:id/:auditId" element={<PrivateRoute component={<AuditPage/>} adminPage/>} caseSensitive={true}/>
        <Route path="/admin/audit/:id/" element={<PrivateRoute component={<AuditPage/>} adminPage/>} caseSensitive={true}/>
        <Route path="/admin/audit/" element={<PrivateRoute component={<AuditPage/>} adminPage/>} caseSensitive={true}/>

        <Route path="/admin/settings" element={<PrivateRoute component={<SettingsPage/>} adminPage/>} caseSensitive={true}/>
        <Route path="/admin/maillog" element={<PrivateRoute component={<MailLogPage/>} adminPage/>} caseSensitive={true}/>
        <Route path="/admin/krav" element={<PrivateRoute component={<KravTablePage/>} adminPage/>} caseSensitive={true}/>
        <Route path="/admin/etterlevelse" element={<PrivateRoute component={<EtterlevelseAdminPage/>} adminPage/>} caseSensitive={true}/>
        <Route path="/admin/arkiv" element={<PrivateRoute component={<ArkivAdminPage/>} adminPage/>} caseSensitive={true}/>
        <Route path="/admin/messageslog" element={<PrivateRoute component={<QuestionAndAnswerLogPage/>} adminPage/>} caseSensitive={true}/>
        <Route path="/admin/varsel" element={<PrivateRoute component={<VarselPage/>} adminPage/>} caseSensitive={true}/>

        <Route path="/tema/:tema" element={<TemaPage/>} caseSensitive={true}/>
        <Route path="/tema/" element={<TemaPage/>} caseSensitive={true}/>

        <Route path="/status" element={<StatusPage/>} caseSensitive={true}/>
        <Route path="/help" element={<FAQ/>} caseSensitive={true}/>

        <Route path="/forbidden" element={<Forbidden/>} caseSensitive={true}/>

        <Route path="*" element={<NotFound/>} caseSensitive={true}/>
      </Routes>
    </ScrollToTop>
  )
}

export default AppRoutes
