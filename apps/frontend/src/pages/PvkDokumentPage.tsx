import { Alert, BodyLong, Button, Loader, Modal, Stepper } from '@navikt/ds-react'
import { uniqBy } from 'lodash'
import { RefObject, useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams } from 'react-router-dom'
import { useEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import { usePvkDokument } from '../api/PvkDokumentApi'
import BehandlingensArtOgOmfangView from '../components/PvkDokument/BehandlingensArtOgOmfangView'
import IdentifiseringAvRisikoscenarioerOgTiltak from '../components/PvkDokument/IdentifiseringAvRisikoscenarioerOgTiltak'
import InnvolveringAvEksterneView from '../components/PvkDokument/InnvolveringAvEksterneView'
import OppsummeringAvAlleRisikoscenarioerOgTiltak from '../components/PvkDokument/OppsummeringAvAlleRisikoscenarioerOgTiltak'
import OversiktView from '../components/PvkDokument/OversiktView'
import SendInnView from '../components/PvkDokument/SendInnView'
import CustomizedBreadcrumbs from '../components/common/CustomizedBreadcrumbs'
import { IBreadCrumbPath, IDataBehandler, IExternalCode } from '../constants'
import { user } from '../services/User'
import { dokumentasjonerBreadCrumbPath } from './util/BreadCrumbPath'

export const StepTitle: string[] = [
  'Oversikt og status',
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
  const [isUnsaved, setIsUnsaved] = useState<boolean>(false)
  const [activeStep, setActiveStep] = useState<number>(
    currentStep !== null ? parseInt(currentStep) : 1
  )
  const formRef: RefObject<any> = useRef(undefined)

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
    if (formRef.current?.dirty) {
      setIsUnsaved(true)
    } else {
      setActiveStep(step)
      updateUrlOnStepChange(step)
      setCurrentPage(StepTitle[step - 1])
    }
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
          <div className="w-full">
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
                      activeStep={activeStep}
                      updateTitleUrlAndStep={updateTitleUrlAndStep}
                    />
                  )}
                  {activeStep === 2 && (
                    <BehandlingensArtOgOmfangView
                      personkategorier={personkategorier}
                      etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                      pvkDokument={pvkDokument}
                      setPvkDokument={setPvkDokument}
                      activeStep={activeStep}
                      setActiveStep={updateTitleUrlAndStep}
                      formRef={formRef}
                    />
                  )}
                  {activeStep === 3 && (
                    <InnvolveringAvEksterneView
                      personkategorier={personkategorier}
                      databehandlere={databehandlere}
                      etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                      pvkDokument={pvkDokument}
                      setPvkDokument={setPvkDokument}
                      activeStep={activeStep}
                      setActiveStep={updateTitleUrlAndStep}
                      formRef={formRef}
                    />
                  )}
                  {activeStep === 4 && (
                    <IdentifiseringAvRisikoscenarioerOgTiltak
                      etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
                      pvkDokument={pvkDokument}
                      activeStep={activeStep}
                      setActiveStep={updateTitleUrlAndStep}
                    />
                  )}
                  {activeStep === 5 && (
                    <OppsummeringAvAlleRisikoscenarioerOgTiltak
                      etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
                      activeStep={activeStep}
                      setActiveStep={updateTitleUrlAndStep}
                    />
                  )}
                  {activeStep === 6 && (
                    <SendInnView
                      pvkDokument={pvkDokument}
                      personkategorier={personkategorier}
                      databehandlere={databehandlere}
                      updateTitleUrlAndStep={updateTitleUrlAndStep}
                      etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
                      activeStep={activeStep}
                      setActiveStep={updateTitleUrlAndStep}
                    />
                  )}
                </div>
              </div>
            </div>

            <Modal
              onClose={() => setIsUnsaved(false)}
              open={isUnsaved}
              header={{ heading: 'Varsel' }}
            >
              <Modal.Body>
                <BodyLong>Endringene som er gjort er ikke lagret.</BodyLong>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  type="button"
                  onClick={() => {
                    //submit coden
                    //nesteSteg koden
                  }}
                >
                  Lagre og fortsette
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    //neste steg koden
                  }}
                >
                  Fortsett uten å lagre
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        )}
    </div>
  )
}

export default PvkDokumentPage
