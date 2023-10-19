import {Route, Routes, useNavigate, useParams} from 'react-router-dom'
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
import {RelevansPage} from './pages/RelevansPage'
import {UnderavdelingPage} from './pages/UnderavdelingPage'
import {TemaPage} from './pages/TemaPage'
import {LovPage} from './pages/LovPage'
import ScrollToTop from './util/ScrollToTop'
import {StatusPage} from './pages/StatusPage'
import {KravTablePage} from './pages/KravTablePage'
import {FAQ} from './pages/FAQ'
import QuestionAndAnswerLogPage from './pages/QuestionAndAnswerLogPage'
import {VarselPage} from './pages/VarselPage'
import Forbidden from './pages/Forbidden'
import EtterlevelseAdminPage from './pages/EtterlevelseAdminPage'
import PrivateRoute from './util/PrivateRoute'
import ArkivAdminPage from './pages/ArkivAdminPage'
import {MyEtterlevelseDokumentasjonerPage} from './pages/MyEtterlevelseDokumentasjonerPage'
import {DokumentasjonPage} from './pages/DokumentasjonPage'
import {EtterlevelseDokumentasjonTemaPage} from './pages/EtterlevelseDokumentasjonTemaPage'
import {EtterlevelseDokumentasjonPage} from './pages/EtterlevelseDokumentasjonPage'
import {VirkemiddelListPage} from './pages/VirkemiddelListPage'
import EtterlevelseDokumentasjonAdminPage from './pages/EtterlevelseDokumentasjonAdminPage'
import {useEffect} from 'react'
import {searchEtterlevelsedokumentasjonByBehandlingId} from './api/EtterlevelseDokumentasjonApi'
import {ampli} from './services/Amplitude'
import {Loader} from '@navikt/ds-react'

const AppRoutes = (): JSX.Element => {
  useEffect(() => {
    setTimeout(() => {
      const hash = window.location.hash.slice(1) // Remove the '#' character from the hash
      if (hash) {
        const element = document.getElementById(hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }, 100)
  }, [])

  return (
    <ScrollToTop>
      <Routes>
        <Route path="/" element={<MainPage />} caseSensitive={true} />

        <Route path="/kravliste/:tab" element={<PrivateRoute component={<KravListPage />} kraveierPage />} caseSensitive={true} />
        <Route path="/kravliste/" element={<PrivateRoute component={<KravListPage />} kraveierPage />} caseSensitive={true} />
        <Route path="/krav/:id" element={<KravPage />} caseSensitive={true} />
        <Route path="/krav/:kravNummer/:kravVersjon" element={<KravPage />} caseSensitive={true} />

        <Route path="/virkemiddelliste/" element={<PrivateRoute component={<VirkemiddelListPage />} kraveierPage />} caseSensitive={true} />

        <Route path="/etterlevelse" element={<PrivateRoute component={<EtterlevelseListPage />} adminPage />} caseSensitive={true} />
        <Route path="/etterlevelse/:id" element={<EtterlevelsePage />} caseSensitive={true} />

        <Route
          path="/behandling/:id/:tema/:filter/krav/:kravNummer/:kravVersjon"
          element={<PrivateRoute component={<RedirectToEtterlevelseDokumentasjonPage />} />}
          caseSensitive={true}
        />
        <Route path="/behandling/:id/:tema/" element={<PrivateRoute component={<RedirectToEtterlevelseDokumentasjonPage />} />} caseSensitive={true} />
        <Route path="/behandling/:id/:tema/:filter" element={<PrivateRoute component={<RedirectToEtterlevelseDokumentasjonPage />} />} caseSensitive={true} />
        <Route path="/behandling/:id" element={<PrivateRoute component={<RedirectToEtterlevelseDokumentasjonPage />} />} caseSensitive={true} />
        <Route path="/behandling/" element={<PrivateRoute component={<RedirectToEtterlevelseDokumentasjonPage />} />} caseSensitive={true} />

        <Route path="/behandlinger/:tab" element={<PrivateRoute component={<RedirectToEtterlevelseDokumentasjonPage />} />} caseSensitive={true} />
        <Route path="/behandlinger/" element={<PrivateRoute component={<RedirectToEtterlevelseDokumentasjonPage />} />} caseSensitive={true} />

        <Route
          path="/dokumentasjon/:id/:tema/:filter/krav/:kravNummer/:kravVersjon"
          element={<PrivateRoute component={<EtterlevelseDokumentasjonPage />} />}
          caseSensitive={true}
        />
        <Route path="/dokumentasjon/:id/:tema/" element={<PrivateRoute component={<EtterlevelseDokumentasjonTemaPage />} />} caseSensitive={true} />
        <Route path="/dokumentasjon/:id/:tema/:filter" element={<PrivateRoute component={<EtterlevelseDokumentasjonTemaPage />} />} caseSensitive={true} />
        <Route path="/dokumentasjoner/:tab" element={<PrivateRoute component={<MyEtterlevelseDokumentasjonerPage />} />} caseSensitive={true} />
        <Route path="/dokumentasjoner/" element={<PrivateRoute component={<MyEtterlevelseDokumentasjonerPage />} />} caseSensitive={true} />
        <Route path="/dokumentasjon/:id" element={<PrivateRoute component={<DokumentasjonPage />} />} caseSensitive={true} />
        <Route path="/dokumentasjon/" element={<PrivateRoute component={<MyEtterlevelseDokumentasjonerPage />} />} caseSensitive={true} />

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
        <Route path="/omstottetiletterlevelse" element={<FAQ />} caseSensitive={true} />

        <Route path="/forbidden" element={<Forbidden />} caseSensitive={true} />

        <Route path="*" element={<NotFound />} caseSensitive={true} />
      </Routes>
    </ScrollToTop>
  )
}

const RedirectToEtterlevelseDokumentasjonPage = () => {
  const { id, tema, filter, kravNummer, kravVersjon } = useParams()
  const navigate = useNavigate()

  ampli.logEvent('besøk', { type: 'redirect til etterlevelse' })

  if (id) {
    searchEtterlevelsedokumentasjonByBehandlingId(id).then((resp) => {
      if (resp.length === 1) {
        let redirectUrl = '/dokumentasjon/' + resp[0].id

        if (tema && !filter) {
          redirectUrl += '/' + tema.toUpperCase() + '/RELEVANTE_KRAV'
        } else if (tema && filter) {
          redirectUrl += '/' + tema.toUpperCase() + '/' + filter.toUpperCase()
        }

        if (kravNummer && kravVersjon) {
          redirectUrl += '/krav/' + kravNummer + '/' + kravVersjon
        }

        navigate(redirectUrl, { replace: true })
      } else {
        navigate('/dokumentasjoner/behandlingsok?behandlingId=' + id, { replace: true })
      }
    })
  } else {
    navigate('/dokumentasjoner', { replace: true })
  }

  return (
    <div className="flex w-full justify-center">
      <Loader size={'large'} />
    </div>
  )
}

export default AppRoutes
