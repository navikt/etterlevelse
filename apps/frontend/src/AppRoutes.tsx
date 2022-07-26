import * as React from 'react'
import { Route, Routes } from 'react-router-dom'
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
import ScrollToTop from './util/ScrollToTop'
import { StatusPage } from './pages/StatusPage'
import { KravTablePage } from './pages/KravTablePage'
import { FAQ } from './pages/FAQ'
import QuestionAndAnswerLogPage from './pages/QuestionAndAnswerLogPage'
import { BehandlingTemaPage } from './pages/BehandlingTemaPage'
import { VarselPage } from './pages/VarselPage'
import { EtterlevelseDokumentasjonPage } from './pages/EtterlevelseDokumentasjonPage'

const AppRoutes = (): JSX.Element => {
  return (
    <ScrollToTop>
      <Routes>
        <Route path="/old" element={<MainPage />} caseSensitive={true} />
        <Route path="/" element={<MainPage />} caseSensitive={true} />

        <Route path="/kravliste/:tab" element={<KravListPage />} caseSensitive={true} />
        <Route path="/kravliste/" element={<KravListPage />} caseSensitive={true} />
        <Route path="/krav/:id" element={<KravPage />} caseSensitive={true} />
        <Route path="/krav/:kravNummer/:kravVersjon" element={<KravPage />} caseSensitive={true} />

        <Route path="/etterlevelse" element={<EtterlevelseListPage />} caseSensitive={true} />
        <Route path="/etterlevelse/:id" element={<EtterlevelsePage />} caseSensitive={true} />

        {/* <Route path="/behandlingtest/:id/:tema" element={<BehandlingTemaPage />} caseSensitive={true} /> */}
        <Route path="/behandling/:id/:tema/:filter/krav/:kravNummer/:kravVersjon" element={<EtterlevelseDokumentasjonPage />} caseSensitive={true} />
        <Route path="/behandling/:id/:tema/" element={<BehandlingTemaPage />} caseSensitive={true} />
        <Route path="/behandling/:id/:tema/:filter" element={<BehandlingTemaPage />} caseSensitive={true} />
        <Route path="/behandling/:id" element={<BehandlingPage />} caseSensitive={true} />
        <Route path="/behandling/" element={<MyBehandlingerPage />} caseSensitive={true} />

        <Route path="/behandlinger/:tab" element={<MyBehandlingerPage />} caseSensitive={true} />
        <Route path="/behandlinger/" element={<MyBehandlingerPage />} caseSensitive={true} />

        <Route path="/relevans/:relevans" element={<RelevansPage />} caseSensitive={true} />
        <Route path="/relevans/" element={<RelevansPage />} caseSensitive={true} />

        <Route path="/underavdeling/:underavdeling" element={<UnderavdelingPage />} caseSensitive={true} />
        <Route path="/underavdeling/" element={<UnderavdelingPage />} caseSensitive={true} />

        <Route path="/lov/:lov" element={<LovPage />} caseSensitive={true} />
        <Route path="/lov/" element={<LovPage />} caseSensitive={true} />

        <Route path="/admin/codelist/:listname" element={<CodeListPage />} caseSensitive={true} />
        <Route path="/admin/codelist/" element={<CodeListPage />} caseSensitive={true} />

        <Route path="/admin/audit/:id/:auditId" element={<AuditPage />} caseSensitive={true} />
        <Route path="/admin/audit/:id/" element={<AuditPage />} caseSensitive={true} />
        <Route path="/admin/audit/" element={<AuditPage />} caseSensitive={true} />

        <Route path="/admin/settings" element={<SettingsPage />} caseSensitive={true} />
        <Route path="/admin/maillog" element={<MailLogPage />} caseSensitive={true} />
        <Route path="/admin/krav" element={<KravTablePage />} caseSensitive={true} />
        <Route path="/admin/messageslog" element={<QuestionAndAnswerLogPage />} caseSensitive={true} />
        <Route path="/admin/varsel" element={<VarselPage />} caseSensitive={true} />

        <Route path="/tema/:tema" element={<TemaPage />} caseSensitive={true} />
        <Route path="/tema/" element={<TemaPage />} caseSensitive={true} />

        <Route path="/status" element={<StatusPage />} caseSensitive={true} />
        <Route path="/help" element={<FAQ />} caseSensitive={true} />

        <Route path="*" element={<NotFound />} caseSensitive={true} />
      </Routes>
    </ScrollToTop>
  )
}

export default AppRoutes
