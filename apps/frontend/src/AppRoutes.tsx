import { Loader } from '@navikt/ds-react'
import { useEffect } from 'react'
import { Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { searchEtterlevelsedokumentasjonByBehandlingId } from './api/EtterlevelseDokumentasjonApi'
import CodeListPage from './components/admin/CodeList/CodelistPage'
import { AuditPage } from './components/admin/audit/AuditPage'
import { MailLogPage } from './components/admin/maillog/MailLogPage'
import { KravCreatePage } from './components/krav/Edit/KravCreatePage'
import { KravEditPage } from './components/krav/Edit/KravEditPage'
import { KravNyVersjonPage } from './components/krav/Edit/KravNyVersjonPage'
import ArkivAdminPage from './pages/ArkivAdminPage'
import { DokumentasjonPage } from './pages/DokumentasjonPage'
import EtterlevelseAdminPage from './pages/EtterlevelseAdminPage'
import EtterlevelseDokumentasjonAdminPage from './pages/EtterlevelseDokumentasjonAdminPage'
import { EtterlevelseDokumentasjonPage } from './pages/EtterlevelseDokumentasjonPage'
import { EtterlevelsePage } from './pages/EtterlevelsePage'
import { FAQ } from './pages/FAQ'
import Forbidden from './pages/Forbidden'
import { KravListPage } from './pages/KravListPage'
import { KravPage } from './pages/KravPage'
import { KravTablePage } from './pages/KravTablePage'
import { MainPage } from './pages/MainPage'
import { MyEtterlevelseDokumentasjonerPage } from './pages/MyEtterlevelseDokumentasjonerPage'
import NotFound from './pages/NotFound'
import QuestionAndAnswerLogPage from './pages/QuestionAndAnswerLogPage'
import { TemaPage } from './pages/TemaPage'
import { TemaOversiktPage } from './pages/TemaoversiktPage'
import { VarselPage } from './pages/VarselPage'
import { VirkemiddelListPage } from './pages/VirkemiddelListPage'
import { ampli } from './services/Amplitude'
import PrivateRoute from './util/PrivateRoute'

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
    <Routes>
      <Route path="/" element={<MainPage />} caseSensitive={true} />

      <Route
        path="/kravliste/:tab"
        element={<PrivateRoute component={<KravListPage />} kraveierPage />}
        caseSensitive={true}
      />
      <Route
        path="/kravliste/"
        element={<PrivateRoute component={<KravListPage />} kraveierPage />}
        caseSensitive={true}
      />

      <Route
        path="/kravliste/opprett"
        element={<PrivateRoute component={<KravCreatePage />} kraveierPage />}
        caseSensitive={true}
      />

      <Route path="/krav/:id" element={<KravPage />} caseSensitive={true} />
      <Route path="/krav/:kravNummer/:kravVersjon" element={<KravPage />} caseSensitive={true} />

      <Route
        path="/krav/redigering/:id"
        element={<PrivateRoute component={<KravEditPage />} kraveierPage />}
        caseSensitive={true}
      />
      <Route
        path="/krav/ny-versjon/:id"
        element={<PrivateRoute component={<KravNyVersjonPage />} kraveierPage />}
        caseSensitive={true}
      />

      <Route
        path="/virkemiddelliste/"
        element={<PrivateRoute component={<VirkemiddelListPage />} kraveierPage />}
        caseSensitive={true}
      />

      <Route path="/etterlevelse/:id" element={<EtterlevelsePage />} caseSensitive={true} />

      <Route
        path="/behandling/:id/:tema/:filter/krav/:kravNummer/:kravVersjon"
        element={<RedirectToEtterlevelseDokumentasjonPage />}
        caseSensitive={true}
      />
      <Route
        path="/behandling/:id/:tema/"
        element={<RedirectToEtterlevelseDokumentasjonPage />}
        caseSensitive={true}
      />
      <Route
        path="/behandling/:id/:tema/:filter"
        element={<RedirectToEtterlevelseDokumentasjonPage />}
        caseSensitive={true}
      />
      <Route
        path="/behandling/:id"
        element={<RedirectToEtterlevelseDokumentasjonPage />}
        caseSensitive={true}
      />
      <Route
        path="/behandling/"
        element={<RedirectToEtterlevelseDokumentasjonPage />}
        caseSensitive={true}
      />

      <Route
        path="/behandlinger/:tab"
        element={<RedirectToEtterlevelseDokumentasjonPage />}
        caseSensitive={true}
      />
      <Route
        path="/behandlinger/"
        element={<RedirectToEtterlevelseDokumentasjonPage />}
        caseSensitive={true}
      />

      <Route
        path="/dokumentasjon/:id/:tema/:filter/krav/:kravNummer/:kravVersjon"
        element={<EtterlevelseDokumentasjonPage />}
        caseSensitive={true}
      />
      {/*
        <Route path="/dokumentasjon/:id/:tema/" element={<PrivateRoute component={<EtterlevelseDokumentasjonTemaPage />} />} caseSensitive={true} />
        <Route path="/dokumentasjon/:id/:tema/:filter" element={<PrivateRoute component={<EtterlevelseDokumentasjonTemaPage />} />} caseSensitive={true} />
        */}
      <Route
        path="/dokumentasjoner/:tab"
        element={<MyEtterlevelseDokumentasjonerPage />}
        caseSensitive={true}
      />
      <Route
        path="/dokumentasjoner/"
        element={<MyEtterlevelseDokumentasjonerPage />}
        caseSensitive={true}
      />

      <Route path="/dokumentasjon/:id" element={<DokumentasjonPage />} caseSensitive={true} />
      <Route path="/dokumentasjon/:id/:tema" element={<DokumentasjonPage />} caseSensitive={true} />
      <Route
        path="/dokumentasjon/"
        element={<MyEtterlevelseDokumentasjonerPage />}
        caseSensitive={true}
      />

      <Route
        path="/admin/codelist/:listname"
        element={<PrivateRoute component={<CodeListPage />} adminPage />}
        caseSensitive={true}
      />
      <Route
        path="/admin/codelist/"
        element={<PrivateRoute component={<CodeListPage />} adminPage />}
        caseSensitive={true}
      />

      <Route
        path="/admin/audit/:id/:auditId"
        element={<PrivateRoute component={<AuditPage />} adminPage />}
        caseSensitive={true}
      />
      <Route
        path="/admin/audit/:id/"
        element={<PrivateRoute component={<AuditPage />} adminPage />}
        caseSensitive={true}
      />
      <Route
        path="/admin/audit/"
        element={<PrivateRoute component={<AuditPage />} adminPage />}
        caseSensitive={true}
      />

      <Route
        path="/admin/maillog"
        element={<PrivateRoute component={<MailLogPage />} adminPage />}
        caseSensitive={true}
      />
      <Route
        path="/admin/krav"
        element={<PrivateRoute component={<KravTablePage />} adminPage />}
        caseSensitive={true}
      />
      <Route
        path="/admin/dokumentasjon"
        element={<PrivateRoute component={<EtterlevelseDokumentasjonAdminPage />} adminPage />}
        caseSensitive={true}
      />
      <Route
        path="/admin/etterlevelse"
        element={<PrivateRoute component={<EtterlevelseAdminPage />} adminPage />}
        caseSensitive={true}
      />
      <Route
        path="/admin/arkiv"
        element={<PrivateRoute component={<ArkivAdminPage />} adminPage />}
        caseSensitive={true}
      />
      <Route
        path="/admin/messageslog"
        element={<PrivateRoute component={<QuestionAndAnswerLogPage />} adminPage />}
        caseSensitive={true}
      />
      <Route
        path="/admin/varsel"
        element={<PrivateRoute component={<VarselPage />} adminPage />}
        caseSensitive={true}
      />

      <Route path="/tema/:tema" element={<TemaPage />} caseSensitive={true} />
      <Route path="/tema/" element={<TemaOversiktPage />} caseSensitive={true} />

      <Route path="/help" element={<RedirectHelpUrl />} caseSensitive={true} />
      <Route path="/omstottetiletterlevelse" element={<FAQ />} caseSensitive={true} />

      <Route path="/forbidden" element={<Forbidden />} caseSensitive={true} />

      <Route path="*" element={<NotFound />} caseSensitive={true} />
    </Routes>
  )
}

const RedirectHelpUrl = () => {
  const navigate = useNavigate()
  navigate('/omstottetiletterlevelse')

  return (
    <div className="flex w-full justify-center">
      <Loader size="large" />
    </div>
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
