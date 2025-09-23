import { Loader } from '@navikt/ds-react'
import { JSX, useEffect } from 'react'
import { NavigateFunction, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { searchEtterlevelsedokumentasjonByBehandlingId } from './api/EtterlevelseDokumentasjonApi'
import CodeListPage from './components/admin/CodeList/CodelistPage'
import { AuditPage } from './components/admin/audit/AuditPage'
import { MailLogPage } from './components/admin/maillog/MailLogPage'
import {
  adminAuditUrl,
  adminCodelistUrl,
  adminDokumentasjonUrl,
  adminDokumentrelasjonUrl,
  adminEtterlevelseUrl,
  adminKravUrl,
  adminMaillog,
  adminMessagesLogUrl,
  adminPvkUrl,
  adminVarselUrl,
} from './components/common/RouteLinkAdmin'
import {
  behandlingUrl,
  behandlingerUrl,
  behandlingskatalogenBehandlingsIdUrl,
} from './components/common/RouteLinkBehandlingskatalogen'
import {
  dokumentasjonUrl,
  etterlevelseDokumentasjonCreateUrl,
  etterlevelseDokumentasjonGjenbrukUrl,
  etterlevelseDokumentasjonIdUrl,
  etterlevelseDokumentasjonRelasjonUrl,
  etterlevelseDokumentasjonerUrl,
  etterlevelseUrl,
  etterlevelsesDokumentasjonEditUrl,
  temaUrl,
} from './components/common/RouteLinkEtterlevelsesdokumentasjon'
import {
  kravNummerVersjonUrl,
  kravNyVersjonIdUrl,
  kravRedigeringIdUrl,
  kravRelevanteUrl,
  kravTemaFilterUrl,
  kravUrl,
  kravlisteOpprettUrl,
  kravlisteUrl,
} from './components/common/RouteLinkKrav'
import { pvkdokumentUrl } from './components/common/RouteLinkPvk'
import { pvoOversiktUrl, pvoUrl, pvotilbakemeldingUrl } from './components/common/RouteLinkPvo'
import CreateEtterlevelseDokumentasjonPage from './components/etterlevelseDokumentasjon/edit/CreateEtterlevelseDokumentasjonPage'
import { EditEtterlevelseDokumentasjonPage } from './components/etterlevelseDokumentasjon/edit/EditEtterlevelseDokumentasjonPage'
import GjenbrukEtterlevelseDokumentasjonPage from './components/etterlevelseDokumentasjon/edit/GjenbrukEtterlevelseDokumentasjonPage'
import { KravCreatePage } from './components/krav/Edit/KravCreatePage'
import { KravEditPage } from './components/krav/Edit/KravEditPage'
import { KravNyVersjonPage } from './components/krav/Edit/KravNyVersjonPage'
import { IEtterlevelseDokumentasjon } from './constants'
import BehandlingensLivslopPage from './pages/BehandlingensLivslopPage'
import DocumentRelationAdminPage from './pages/DocumentRelationAdminPage'
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
import OmPvk from './pages/OmPVK'
import PvkAdminPage from './pages/PvkAdminPage'
import PvkBehovPage from './pages/PvkBehovPage'
import PvkDokumentPage from './pages/PvkDokumentPage'
import PvoOversiktPage from './pages/PvoOversiktPage'
import PvoTilbakemeldingPage from './pages/PvoTilbakemeldingPage'
import QuestionAndAnswerLogPage from './pages/QuestionAndAnswerLogPage'
import { RelasjonsOversikt } from './pages/RelasjonsOversikt'
import { TemaPage } from './pages/TemaPage'
import { TemaOversiktPage } from './pages/TemaoversiktPage'
import { VarselPage } from './pages/VarselPage'
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
      <Route path='/' element={<MainPage />} caseSensitive={true} />
      <Route
        path={`${kravlisteUrl()}/:tab`}
        element={<PrivateRoute component={<KravListPage />} kraveierPage />}
        caseSensitive={true}
      />
      <Route
        path={`${kravlisteUrl()}`}
        element={<PrivateRoute component={<KravListPage />} kraveierPage />}
        caseSensitive={true}
      />
      <Route
        path={`${kravlisteOpprettUrl()}`}
        element={<PrivateRoute component={<KravCreatePage />} kraveierPage />}
        caseSensitive={true}
      />
      <Route path={`${kravUrl}/:id`} element={<KravPage />} caseSensitive={true} />
      <Route
        path={`${kravUrl}/:kravNummer/:kravVersjon`}
        element={<KravPage />}
        caseSensitive={true}
      />
      <Route
        path={`${kravRedigeringIdUrl()}/:id`}
        element={<PrivateRoute component={<KravEditPage />} kraveierPage />}
        caseSensitive={true}
      />
      <Route
        path={`${kravNyVersjonIdUrl()}/:id`}
        element={<PrivateRoute component={<KravNyVersjonPage />} kraveierPage />}
        caseSensitive={true}
      />
      <Route path={`${etterlevelseUrl}/:id`} element={<EtterlevelsePage />} caseSensitive={true} />
      <Route
        path={`${behandlingUrl}/:id/:tema/:filter${kravUrl}/:kravNummer/:kravVersjon`}
        element={<RedirectToEtterlevelseDokumentasjonPage />}
        caseSensitive={true}
      />
      <Route
        path={`${behandlingUrl}/:id/:tema/`}
        element={<RedirectToEtterlevelseDokumentasjonPage />}
        caseSensitive={true}
      />
      <Route
        path={`${behandlingUrl}/:id/:tema/:filter`}
        element={<RedirectToEtterlevelseDokumentasjonPage />}
        caseSensitive={true}
      />
      <Route
        path={`${behandlingUrl}/:id`}
        element={<RedirectToEtterlevelseDokumentasjonPage />}
        caseSensitive={true}
      />
      <Route
        path={`${behandlingUrl}`}
        element={<RedirectToEtterlevelseDokumentasjonPage />}
        caseSensitive={true}
      />
      <Route
        path={`${behandlingerUrl}/:tab`}
        element={<RedirectToEtterlevelseDokumentasjonPage />}
        caseSensitive={true}
      />
      <Route
        path={`${behandlingerUrl}`}
        element={<RedirectToEtterlevelseDokumentasjonPage />}
        caseSensitive={true}
      />
      <Route
        path={`${dokumentasjonUrl}/:id/:tema/:filter/krav/:kravNummer/:kravVersjon`}
        element={<EtterlevelseDokumentasjonPage />}
        caseSensitive={true}
      />
      {/*
        <Route path="/dokumentasjon/:id/:tema/" element={<PrivateRoute component={<EtterlevelseDokumentasjonTemaPage />} />} caseSensitive={true} />
        <Route path="/dokumentasjon/:id/:tema/:filter" element={<PrivateRoute component={<EtterlevelseDokumentasjonTemaPage />} />} caseSensitive={true} />
        */}
      <Route
        path={`${etterlevelseDokumentasjonerUrl()}/:tab`}
        element={<MyEtterlevelseDokumentasjonerPage />}
        caseSensitive={true}
      />
      <Route
        path={`${etterlevelseDokumentasjonerUrl()}`}
        element={<MyEtterlevelseDokumentasjonerPage />}
        caseSensitive={true}
      />
      <Route
        path={`${dokumentasjonUrl}/:id`}
        element={<DokumentasjonPage />}
        caseSensitive={true}
      />
      <Route
        path={`${dokumentasjonUrl}/:id/:tema`}
        element={<DokumentasjonPage />}
        caseSensitive={true}
      />
      <Route
        path={`${dokumentasjonUrl}/:id/behandlingens-livslop/:behandlingsLivslopId`}
        element={<BehandlingensLivslopPage />}
        caseSensitive={true}
      />

      <Route
        path={`${dokumentasjonUrl}/:id/pvkbehov/:pvkdokumentId`}
        element={<PvkBehovPage />}
        caseSensitive={true}
      />
      <Route
        path={`${dokumentasjonUrl}/:id${pvkdokumentUrl}/:pvkdokumentId/:steg`}
        element={<PvkDokumentPage />}
        caseSensitive={true}
      />

      <Route path='/om-pvk' element={<OmPvk />} caseSensitive={true} />

      <Route
        path={`${pvoUrl}/:tab`}
        element={<PrivateRoute component={<PvoOversiktPage />} pvoPage />}
        caseSensitive={true}
      />

      <Route
        path={pvoOversiktUrl}
        element={<PrivateRoute component={<PvoOversiktPage />} pvoPage />}
        caseSensitive={true}
      />

      <Route
        path={`${pvkdokumentUrl}/:id${pvotilbakemeldingUrl}/:steg`}
        element={<PvoTilbakemeldingPage />}
        caseSensitive={true}
      />

      <Route
        path={`${etterlevelseDokumentasjonRelasjonUrl()}/:id`}
        element={<RelasjonsOversikt />}
        caseSensitive={true}
      />

      <Route
        path={`${dokumentasjonUrl}`}
        element={<MyEtterlevelseDokumentasjonerPage />}
        caseSensitive={true}
      />
      <Route
        path={`${etterlevelsesDokumentasjonEditUrl()}/:id`}
        element={<EditEtterlevelseDokumentasjonPage />}
        caseSensitive={true}
      />
      <Route
        path={etterlevelseDokumentasjonCreateUrl}
        element={<CreateEtterlevelseDokumentasjonPage />}
        caseSensitive={true}
      />
      <Route
        path={`${etterlevelseDokumentasjonGjenbrukUrl}/:id`}
        element={<GjenbrukEtterlevelseDokumentasjonPage />}
        caseSensitive={true}
      />

      <Route
        path={`${adminCodelistUrl}/:listname`}
        element={<PrivateRoute component={<CodeListPage />} adminPage />}
        caseSensitive={true}
      />
      <Route
        path={adminCodelistUrl}
        element={<PrivateRoute component={<CodeListPage />} adminPage />}
        caseSensitive={true}
      />
      <Route
        path={`${adminAuditUrl()}/:id/:auditId`}
        element={<PrivateRoute component={<AuditPage />} adminPage />}
        caseSensitive={true}
      />
      <Route
        path={`${adminAuditUrl()}/:id`}
        element={<PrivateRoute component={<AuditPage />} adminPage />}
        caseSensitive={true}
      />
      <Route
        path={adminAuditUrl()}
        element={<PrivateRoute component={<AuditPage />} adminPage />}
        caseSensitive={true}
      />
      <Route
        path={adminMaillog}
        element={<PrivateRoute component={<MailLogPage />} adminPage />}
        caseSensitive={true}
      />
      <Route
        path={adminKravUrl}
        element={<PrivateRoute component={<KravTablePage />} adminPage />}
        caseSensitive={true}
      />
      <Route
        path={adminDokumentasjonUrl}
        element={<PrivateRoute component={<EtterlevelseDokumentasjonAdminPage />} adminPage />}
        caseSensitive={true}
      />
      <Route
        path={adminEtterlevelseUrl}
        element={<PrivateRoute component={<EtterlevelseAdminPage />} adminPage />}
        caseSensitive={true}
      />
      <Route
        path={adminMessagesLogUrl}
        element={<PrivateRoute component={<QuestionAndAnswerLogPage />} adminPage />}
        caseSensitive={true}
      />
      <Route
        path={adminVarselUrl}
        element={<PrivateRoute component={<VarselPage />} adminPage />}
        caseSensitive={true}
      />
      <Route
        path={adminDokumentrelasjonUrl}
        element={<PrivateRoute component={<DocumentRelationAdminPage />} adminPage />}
        caseSensitive={true}
      />

      <Route
        path={adminPvkUrl}
        element={<PrivateRoute component={<PvkAdminPage />} adminPage />}
        caseSensitive={true}
      />

      <Route path={`${temaUrl}/:tema`} element={<TemaPage />} caseSensitive={true} />
      <Route path={`${temaUrl}`} element={<TemaOversiktPage />} caseSensitive={true} />
      <Route path='/help' element={<RedirectHelpUrl />} caseSensitive={true} />
      <Route path='/omstottetiletterlevelse' element={<FAQ />} caseSensitive={true} />
      <Route path='/forbidden' element={<Forbidden />} caseSensitive={true} />
      <Route path='*' element={<NotFound />} caseSensitive={true} />
    </Routes>
  )
}

const RedirectHelpUrl = () => {
  const navigate = useNavigate()
  navigate('/omstottetiletterlevelse')

  return (
    <div className='flex w-full justify-center'>
      <Loader size='large' />
    </div>
  )
}

const RedirectToEtterlevelseDokumentasjonPage = () => {
  const { id, tema, filter, kravNummer, kravVersjon } = useParams()
  const navigate: NavigateFunction = useNavigate()

  //ampli.logEvent('besøk', { type: 'redirect til etterlevelse' })

  if (id) {
    searchEtterlevelsedokumentasjonByBehandlingId(id).then(
      (response: IEtterlevelseDokumentasjon[]) => {
        if (response.length === 1) {
          let redirectUrl: string = etterlevelseDokumentasjonIdUrl(response[0].id)

          if (tema && !filter) {
            redirectUrl += kravRelevanteUrl(tema.toUpperCase())
          } else if (tema && filter) {
            redirectUrl += kravTemaFilterUrl(tema.toUpperCase(), filter.toUpperCase())
          }

          if (kravNummer && kravVersjon) {
            redirectUrl += kravNummerVersjonUrl(kravNummer, kravVersjon)
          }

          navigate(redirectUrl, { replace: true })
        } else {
          navigate(behandlingskatalogenBehandlingsIdUrl(id), { replace: true })
        }
      }
    )
  } else {
    navigate(etterlevelseDokumentasjonerUrl(), { replace: true })
  }

  return (
    <div className='flex w-full justify-center'>
      <Loader size='large' />
    </div>
  )
}

export default AppRoutes
