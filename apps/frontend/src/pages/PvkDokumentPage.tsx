import { Alert, Button, Loader, Stepper } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import { uniqBy } from 'lodash'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate, useParams } from 'react-router-dom'
import { useEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import { mapPvkDokumentToFormValue, updatePvkDokument, usePvkDokument } from '../api/PvkDokumentApi'
import BehandlingensArtOgOmfangView from '../components/PvkDokument/BehandlingensArtOgOmfangView'
import InnvolveringAvEksterneView from '../components/PvkDokument/InnvolveringAvEksterneView'
import OversiktView from '../components/PvkDokument/OversiktView'
import SendInnView from '../components/PvkDokument/SendInnView'
import CustomizedBreadcrumbs from '../components/common/CustomizedBreadcrumbs'
import { IBreadCrumbPath, IDataBehandler, IExternalCode, IPvkDokument } from '../constants'
import { user } from '../services/User'
import { dokumentasjonerBreadCrumbPath } from './util/BreadCrumbPath'

export const StepTitle: string[] = [
  'Oversikt',
  'Behandlingens art og omfang',
  'Innvolvering av eksterne',
  'Identifisering av risikoscenarioer og tiltak',
  'Oppsummering av alle risikoscenarioer og tiltak',
  'Les og send inn',
]

export const PvkDokumentPage = () => {
  const params: Readonly<
    Partial<{
      id?: string
      pvkdokumentId?: string
    }>
  > = useParams<{ id?: string }>()
  const url = new URL(window.location.href)
  const currentStep = url.searchParams.get('steg')
  const [currentPage, setCurrentPage] = useState<string>(
    currentStep !== null ? StepTitle[parseInt(currentStep) - 1] : 'Oversikt'
  )
  const [etterlevelseDokumentasjon] = useEtterlevelseDokumentasjon(params.id)
  const [personkategorier, setPersonKategorier] = useState<string[]>([])
  const [pvkDokument, setPvkDokument] = usePvkDokument(params.pvkdokumentId)
  const [databehandlere, setDatabehandlere] = useState<string[]>([])
  const [activeStep, setActiveStep] = useState<number>(
    currentStep !== null ? parseInt(currentStep) : 1
  )
  const navigate = useNavigate()
  const breadcrumbPaths: IBreadCrumbPath[] = [
    dokumentasjonerBreadCrumbPath,
    {
      pathName:
        'E' +
        etterlevelseDokumentasjon?.etterlevelseNummer.toString() +
        ' ' +
        etterlevelseDokumentasjon?.title,
      href: '/dokumentasjon/' + params.id,
    },

    {
      pathName: 'Personvernkonsekvensvurdering',
      href: '/dokumentasjon/' + params.id + '/pvkbehov/' + params.pvkdokumentId,
    },
  ]

  const updateUrlOnStepChange = (step: number) => {
    url.searchParams.set('steg', step.toString())
    window.history.pushState({}, '', url)
  }

  const updateTitleUrlAndStep = (step: number) => {
    setActiveStep(step)
    updateUrlOnStepChange(step)
    setCurrentPage(StepTitle[step - 1])
  }

  useEffect(() => {
    if (
      etterlevelseDokumentasjon &&
      etterlevelseDokumentasjon.behandlinger &&
      etterlevelseDokumentasjon.behandlinger.length > 0
    ) {
      const allePersonKategorier: IExternalCode[] = []
      const alleDatabehandlerIds: IDataBehandler[] = []

      etterlevelseDokumentasjon.behandlinger.map((behandling) => {
        alleDatabehandlerIds.push(...behandling.dataBehandlerList)
        behandling.policies.map((policy) => {
          allePersonKategorier.push(...policy.personKategorier)
        })
      })

      const uniqPersonkategorier: string[] = uniqBy(allePersonKategorier, 'code').map(
        (personkategori) => personkategori.shortName
      )

      const uniqDatabehandlere: string[] = uniqBy(alleDatabehandlerIds, 'id').map(
        (databehandler) => databehandler.navn
      )

      setDatabehandlere(uniqDatabehandlere)
      setPersonKategorier(uniqPersonkategorier)
    }
  }, [etterlevelseDokumentasjon])

  const submit = async (pvkDokument: IPvkDokument) => {
    await updatePvkDokument(pvkDokument).then((response) => {
      setPvkDokument(response)
    })
  }

  return (
    <div id="content" role="main" className="flex flex-col w-full bg-white">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Pvk Dokument</title>
      </Helmet>
      {!etterlevelseDokumentasjon && (
        <div className="flex w-full justify-center">
          <Loader size="large" />
        </div>
      )}

      {etterlevelseDokumentasjon &&
        !etterlevelseDokumentasjon.hasCurrentUserAccess &&
        !user.isAdmin() && (
          <div className="flex w-full justify-center mt-5">
            <div className="flex items-center flex-col gap-5">
              <Alert variant="warning">Du har ikke tilgang til å redigere på PVK dokument.</Alert>

              <img
                src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdXMyNngxa2djMXdhOXdhcXQwNG9hbWJ3czZ4MW42bDY3ZXVkNHd3eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/zaCojXv2S01zy/giphy.webp"
                alt="no no no"
                width="400px"
              />
            </div>
          </div>
        )}

      {etterlevelseDokumentasjon &&
        pvkDokument &&
        (etterlevelseDokumentasjon.hasCurrentUserAccess || user.isAdmin()) && (
          <Formik
            validateOnChange={false}
            validateOnBlur={false}
            onSubmit={submit}
            initialValues={mapPvkDokumentToFormValue(pvkDokument as IPvkDokument)}
          >
            {({ submitForm }) => (
              <Form>
                <div className="h-48 bg-[#8269A21F] flex flex-col w-full items-center">
                  <div className="w-full max-w-7xl">
                    <div className="px-2 pb-6">
                      <CustomizedBreadcrumbs currentPage={currentPage} paths={breadcrumbPaths} />
                      <div>
                        <Stepper
                          aria-labelledby="stepper-heading"
                          activeStep={activeStep}
                          onStepChange={updateTitleUrlAndStep}
                          orientation="horizontal"
                        >
                          {StepTitle.map((title) => (
                            <Stepper.Step key={title}>{title}</Stepper.Step>
                          ))}
                        </Stepper>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col w-full items-center mt-5">
                  <div className="w-full max-w-7xl">
                    <div className="px-2 pb-6">
                      {activeStep === 1 && (
                        <OversiktView
                          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                          pvkDokument={pvkDokument}
                          risikoscenarioTilknyttetKrav={[]}
                          generelleRisikoscenario={[]}
                          updateTitleUrlAndStep={updateTitleUrlAndStep}
                        />
                      )}
                      {activeStep === 2 && (
                        <BehandlingensArtOgOmfangView personkategorier={personkategorier} />
                      )}
                      {activeStep === 3 && (
                        <InnvolveringAvEksterneView
                          personkategorier={personkategorier}
                          databehandlere={databehandlere}
                        />
                      )}
                      {activeStep === 4 && <div>Risikoscenarioer tilknyttet etterlevelseskrav</div>}
                      {activeStep === 5 && <div>Generelle risikoscenarioer</div>}
                      {activeStep === 6 && (
                        <SendInnView updateTitleUrlAndStep={updateTitleUrlAndStep} />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col w-full items-center mt-5 button_container sticky bottom-0  bg-bg-default">
                  <div className="w-full max-w-7xl py-4 px-4 border-t-2 z-2">
                    <div className="flex w-full gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          if (activeStep === 1) {
                            navigate('/dokumentasjon/' + etterlevelseDokumentasjon.id)
                          } else {
                            setActiveStep(activeStep - 1)
                          }
                        }}
                      >
                        {activeStep === 1 ? 'Tilbake til Temaoversikt' : 'Tilbake'}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          if (activeStep === 6) {
                            submitForm()
                          } else {
                            setActiveStep(activeStep + 1)
                          }
                        }}
                      >
                        {activeStep === 6 ? 'Lagre' : 'Fortsett'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        )}
    </div>
  )
}

export default PvkDokumentPage
