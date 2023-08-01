import * as React from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
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
import Forbidden from './pages/Forbidden'
import EtterlevelseAdminPage from './pages/EtterlevelseAdminPage'
import PrivateRoute from './util/PrivateRoute'
import ArkivAdminPage from './pages/ArkivAdminPage'
import { MyEtterlevelseDokumentasjonerPage } from './pages/MyEtterlevelseDokumentasjonerPage'
import { DokumentasjonPage } from './pages/DokumentasjonPage'
import { EtterlevelseDokumentasjonTemaPage } from './pages/EtterlevelseDokumentasjonTemaPage'
import { EtterlevelseDokumentasjonPageV2 } from './pages/EtterlevelseDokumentasjonPageV2'
import { VirkemiddelListPage } from './pages/VirkemiddelListPage'
import EtterlevelseDokumentasjonAdminPage from './pages/EtterlevelseDokumentasjonAdminPage'
import { useEffect, useState } from 'react'
import { searchEtterlevelsedokumentasjonByBehandlingId } from './api/EtterlevelseDokumentasjonApi'
import { Block } from 'baseui/block'
import { EtterlevelseDokumentasjon } from './constants'

const AppRoutes = (): JSX.Element => {
  return (
    <ScrollToTop>
      <Routes>
        <Route path="/old" element={<MainPage />} caseSensitive={true} />
        <Route path="/" element={<MainPage />} caseSensitive={true} />

        <Route path="/kravliste/:tab" element={<PrivateRoute component={<KravListPage />} kraveierPage />} caseSensitive={true} />
        <Route path="/kravliste/" element={<PrivateRoute component={<KravListPage />} kraveierPage />} caseSensitive={true} />
        <Route path="/krav/:id" element={<KravPage />} caseSensitive={true} />
        <Route path="/krav/:kravNummer/:kravVersjon" element={<KravPage />} caseSensitive={true} />

        <Route path="/virkemiddelliste/" element={<PrivateRoute component={<VirkemiddelListPage />} kraveierPage />} caseSensitive={true} />

        <Route path="/etterlevelse" element={<PrivateRoute component={<EtterlevelseListPage />} adminPage />} caseSensitive={true} />
        <Route path="/etterlevelse/:id" element={<EtterlevelsePage />} caseSensitive={true} />

        <Route path="/behandling/:id/:tema/:filter/krav/:kravNummer/:kravVersjon" element={<PrivateRoute component={<Redirect />} />} caseSensitive={true} />
        <Route path="/behandling/:id/:tema/" element={<PrivateRoute component={<Redirect />} />} caseSensitive={true} />
        <Route path="/behandling/:id/:tema/:filter" element={<PrivateRoute component={<Redirect />} />} caseSensitive={true} />
        <Route path="/behandling/:id" element={<PrivateRoute component={<Redirect />} />} caseSensitive={true} />
        <Route path="/behandling/" element={<MyBehandlingerPage />} caseSensitive={true} />

        <Route path="/behandlinger/:tab" element={<MyBehandlingerPage />} caseSensitive={true} />
        <Route path="/behandlinger/" element={<MyBehandlingerPage />} caseSensitive={true} />

        <Route
          path="/dokumentasjon/:id/:tema/:filter/krav/:kravNummer/:kravVersjon"
          element={<PrivateRoute component={<EtterlevelseDokumentasjonPageV2 />} adminPage />}
          caseSensitive={true}
        />
        <Route path="/dokumentasjon/:id/:tema/" element={<PrivateRoute component={<EtterlevelseDokumentasjonTemaPage />} adminPage />} caseSensitive={true} />
        <Route path="/dokumentasjon/:id/:tema/:filter" element={<PrivateRoute component={<EtterlevelseDokumentasjonTemaPage />} adminPage />} caseSensitive={true} />
        <Route path="/dokumentasjoner/:tab" element={<PrivateRoute component={<MyEtterlevelseDokumentasjonerPage />} adminPage />} caseSensitive={true} />
        <Route path="/dokumentasjoner/" element={<PrivateRoute component={<MyEtterlevelseDokumentasjonerPage />} adminPage />} caseSensitive={true} />
        <Route path="/dokumentasjon/:id" element={<PrivateRoute component={<DokumentasjonPage />} adminPage />} caseSensitive={true} />
        <Route path="/dokumentasjon/" element={<PrivateRoute component={<MyEtterlevelseDokumentasjonerPage />} adminPage />} caseSensitive={true} />

        <Route path="/relevans/:relevans" element={<PrivateRoute component={<RelevansPage />} adminPage />} caseSensitive={true} />
        <Route path="/relevans/" element={<PrivateRoute component={<RelevansPage />} adminPage />} caseSensitive={true} />

        <Route path="/underavdeling/:underavdeling" element={<PrivateRoute component={<UnderavdelingPage />} adminPage />} caseSensitive={true} />
        <Route path="/underavdeling/" element={<PrivateRoute component={<UnderavdelingPage />} adminPage />} caseSensitive={true} />

        <Route path="/lov/:lov" element={<LovPage />} caseSensitive={true} />
        <Route path="/lov/" element={<LovPage />} caseSensitive={true} />

        <Route path="/admin/codelist/:listname" element={<PrivateRoute component={<CodeListPage />} adminPage />} caseSensitive={true} />
        <Route path="/admin/codelist/" element={<PrivateRoute component={<CodeListPage />} adminPage />} caseSensitive={true} />

        <Route path="/admin/audit/:id/:auditId" element={<PrivateRoute component={<AuditPage />} adminPage />} caseSensitive={true} />
        <Route path="/admin/audit/:id/" element={<PrivateRoute component={<AuditPage />} adminPage />} caseSensitive={true} />
        <Route path="/admin/audit/" element={<PrivateRoute component={<AuditPage />} adminPage />} caseSensitive={true} />

        <Route path="/admin/settings" element={<PrivateRoute component={<SettingsPage />} adminPage />} caseSensitive={true} />
        <Route path="/admin/maillog" element={<PrivateRoute component={<MailLogPage />} adminPage />} caseSensitive={true} />
        <Route path="/admin/krav" element={<PrivateRoute component={<KravTablePage />} adminPage />} caseSensitive={true} />
        <Route path="/admin/dokumentasjon" element={<PrivateRoute component={<EtterlevelseDokumentasjonAdminPage />} adminPage />} caseSensitive={true} />
        <Route path="/admin/etterlevelse" element={<PrivateRoute component={<EtterlevelseAdminPage />} adminPage />} caseSensitive={true} />
        <Route path="/admin/arkiv" element={<PrivateRoute component={<ArkivAdminPage />} adminPage />} caseSensitive={true} />
        <Route path="/admin/messageslog" element={<PrivateRoute component={<QuestionAndAnswerLogPage />} adminPage />} caseSensitive={true} />
        <Route path="/admin/varsel" element={<PrivateRoute component={<VarselPage />} adminPage />} caseSensitive={true} />

        <Route path="/tema/:tema" element={<TemaPage />} caseSensitive={true} />
        <Route path="/tema/" element={<TemaPage />} caseSensitive={true} />

        <Route path="/status" element={<StatusPage />} caseSensitive={true} />
        <Route path="/help" element={<FAQ />} caseSensitive={true} />

        <Route path="/forbidden" element={<Forbidden />} caseSensitive={true} />

        <Route path="*" element={<NotFound />} caseSensitive={true} />
      </Routes>
    </ScrollToTop>
  )
}

const Redirect = () => {
  const { id, tema, filter, kravNummer, kravVersjon } = useParams()
  const [url, setUrl] = useState('')
  const [etterlevelseDokumentasjoner, setEtterlevelseDokumentasjoner] = useState<EtterlevelseDokumentasjon[]>([])

  useEffect(() => {
    if (id) {
      ;(async () => {
        await searchEtterlevelsedokumentasjonByBehandlingId(id).then((resp) => {
          if (resp.length === 1) {
            let redirectUrl = '/dokumentasjon/' + resp[0].id
            if (tema && !filter) {
              redirectUrl += '/' + tema.toUpperCase() + '/RELEVANTE_KRAV'
            }
            else if (tema && filter ) {
              redirectUrl += '/' + tema.toUpperCase() + '/' + filter.toUpperCase()
            }
            if (kravNummer && kravVersjon) {
              redirectUrl += '/krav/' + kravNummer + '/' + kravVersjon
            }
            setUrl(redirectUrl)
          } else if (resp.length >= 2) {
            setEtterlevelseDokumentasjoner(resp)
          } else {
            console.log(resp)
          }
        })
      })()
    }
  }, [id])

  if (url) {
    return <Navigate to={url} replace />
  }

  return <Block>test redirect</Block>
}

export default AppRoutes
