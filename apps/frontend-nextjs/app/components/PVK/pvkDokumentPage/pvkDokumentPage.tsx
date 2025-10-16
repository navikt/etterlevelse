'use client'

import { useEtterlevelseDokumentasjon } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { usePvkDokument } from '@/api/pvkDokument/pvkDokumentApi'
import { getPvoTilbakemeldingByPvkDokumentId } from '@/api/pvoTilbakemelding/pvoTilbakemeldingApi'
import CustomizedBreadcrumbs from '@/components/common/customizedBreadcrumbs/customizedBreadcrumbs'
import {
  IDataBehandler,
  IExternalCode,
} from '@/constants/behandlingskatalogen/behandlingskatalogConstants'
import { IBreadCrumbPath } from '@/constants/commonConstants'
import { EPvkDokumentStatus } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IPvoTilbakemelding } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { UserContext } from '@/provider/user/userProvider'
import { useKravFilter } from '@/query/krav/kravQuery'
import { etterlevelseDokumentasjonIdUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { pvkDokumentasjonStepUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { risikoscenarioFilterAlleUrl } from '@/routes/risikoscenario/risikoscenarioRoutes'
import { dokumentasjonerBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import { Alert, Button, Loader, Modal, Stepper } from '@navikt/ds-react'
import { uniqBy } from 'lodash'
import Image from 'next/image'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { RefObject, useContext, useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import BehandlingensLivslopView from './stepperViews/behandlingensLivslopView'
import OversiktView from './stepperViews/oversiktView'

export const StepTitle: string[] = [
  'Oversikt og status',
  'Behandlingens livsløp',
  'Behandlingens art og omfang',
  'Tilhørende dokumentasjon',
  'Involvering av eksterne',
  'Identifisering av risikoscenarioer og tiltak',
  'Risikobildet etter tiltak',
  'Les og send inn',
]

export const PvkDokumentPage = () => {
  const params: Readonly<
    Partial<{
      etterlevelseDokumentasjonId?: string
      pvkDokumentId?: string
    }>
  > = useParams<{ etterlevelseDokumentasjonId?: string }>()
  const query = useSearchParams()
  const currentStep = query.get('steg') || '1'
  const [currentPage, setCurrentPage] = useState<string>(
    currentStep !== null ? StepTitle[parseInt(currentStep) - 1] : 'Oversikt'
  )
  const [etterlevelseDokumentasjon] = useEtterlevelseDokumentasjon(
    params.etterlevelseDokumentasjonId
  )
  const [, setPersonKategorier] = useState<string[]>([])
  const [pvkDokument] = usePvkDokument(params.pvkDokumentId, params.etterlevelseDokumentasjonId)
  const [, setDatabehandlere] = useState<string[]>([])
  const [pvoTilbakemelding, setPvoTilbakemelding] = useState<IPvoTilbakemelding>()
  const [isUnsaved, setIsUnsaved] = useState<boolean>(false)
  const [activeStep, setActiveStep] = useState<number>(
    currentStep !== null ? parseInt(currentStep) : 1
  )
  const [selectedStep, setSelectedStep] = useState<number>(1)
  const router = useRouter()
  const user = useContext(UserContext)
  const formRef: RefObject<any> = useRef(undefined)
  const {
    data: pvkKrav,
    // ,
    // loading: isPvkKravLoading
  } = useKravFilter(
    {
      gjeldendeKrav: true,
      tagger: ['Personvernkonsekvensvurdering'],
      etterlevelseDokumentasjonId: etterlevelseDokumentasjon?.id,
    },
    { skip: !etterlevelseDokumentasjon },
    true
  )

  //const codelist = useContext(CodelistContext)

  const breadcrumbPaths: IBreadCrumbPath[] = [
    dokumentasjonerBreadCrumbPath,
    {
      pathName: `E${etterlevelseDokumentasjon?.etterlevelseNummer.toString()} ${etterlevelseDokumentasjon?.title}`,
      href: etterlevelseDokumentasjonIdUrl(params.etterlevelseDokumentasjonId),
    },
  ]

  const updateUrlOnStepChange = (step: number): void => {
    router.push(
      pvkDokumentasjonStepUrl(
        pvkDokument?.etterlevelseDokumentId,
        pvkDokument?.id,
        step,
        step === 7 ? risikoscenarioFilterAlleUrl() : ''
      )
    )
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
        if (behandling.dataBehandlerList) {
          alleDatabehandlerIds.push(...behandling.dataBehandlerList)
          behandling.policies.map((policy) => {
            allePersonKategorier.push(...policy.personKategorier)
          })
        }
      })

      const uniqPersonkategorier: string[] = uniqBy(allePersonKategorier, 'code')
        .map((personkategori) => personkategori.shortName)
        .sort((a, b) => {
          if (a === 'Annet') {
            return 1
          }
          if (b === 'Annet') {
            return 1
          } else {
            return 0
          }
        })

      const uniqDatabehandlere: string[] = uniqBy(alleDatabehandlerIds, 'id').map(
        (databehandler) => databehandler.navn
      )

      setDatabehandlere(uniqDatabehandlere)
      setPersonKategorier(uniqPersonkategorier)
    }
  }, [etterlevelseDokumentasjon])

  useEffect(() => {
    ;(async () => {
      if (pvkDokument && pvkDokument.id) {
        if (
          ![EPvkDokumentStatus.UNDERARBEID, EPvkDokumentStatus.AKTIV].includes(pvkDokument.status)
        ) {
          await getPvoTilbakemeldingByPvkDokumentId(pvkDokument.id).then(setPvoTilbakemelding)
        }
      }
    })()
  }, [pvkDokument])

  return (
    <div id='content' role='main' className='flex flex-col w-full bg-white'>
      <Helmet>
        <meta charSet='utf-8' />
        <title>Pvk Dokument</title>
      </Helmet>
      {!etterlevelseDokumentasjon && (
        <div className='flex w-full justify-center'>
          <Loader size='large' />
        </div>
      )}

      {etterlevelseDokumentasjon &&
        !etterlevelseDokumentasjon.hasCurrentUserAccess &&
        !user.isAdmin() && (
          <div className='flex w-full justify-center mt-5'>
            <div className='flex items-center flex-col gap-5'>
              <Alert variant='warning'>Du har ikke tilgang til å redigere på PVK dokument.</Alert>

              <Image
                src='https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdXMyNngxa2djMXdhOXdhcXQwNG9hbWJ3czZ4MW42bDY3ZXVkNHd3eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/zaCojXv2S01zy/giphy.webp'
                alt='no no no'
                width='400'
              />
            </div>
          </div>
        )}

      {etterlevelseDokumentasjon &&
        pvkDokument &&
        (etterlevelseDokumentasjon.hasCurrentUserAccess || user.isAdmin()) && (
          <div className='w-full'>
            <div className='min-h-48 bg-[#8269A21F] flex flex-col w-full items-center'>
              <div className='w-full max-w-7xl'>
                <div className='px-2 pb-6'>
                  <CustomizedBreadcrumbs currentPage={currentPage} paths={breadcrumbPaths} />
                  <div>
                    <Stepper
                      aria-labelledby='stepper-heading'
                      activeStep={activeStep}
                      onStepChange={(step) => {
                        setSelectedStep(step)
                        updateTitleUrlAndStep(step)
                      }}
                      orientation='horizontal'
                    >
                      {StepTitle.map((title) => {
                        return (
                          <Stepper.Step key={title} as='button'>
                            {title}
                          </Stepper.Step>
                        )
                      })}
                    </Stepper>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex flex-col w-full items-center mt-5'>
              <div className='w-full max-w-7xl'>
                <div className='px-2 pb-6'>
                  {activeStep === 1 && (
                    <OversiktView
                      etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                      pvkDokument={pvkDokument}
                      activeStep={activeStep}
                      setSelectedStep={setSelectedStep}
                      updateTitleUrlAndStep={updateTitleUrlAndStep}
                      pvkKrav={pvkKrav}
                    />
                  )}
                  {activeStep === 2 && (
                    <BehandlingensLivslopView
                      etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                      pvkDokument={pvkDokument}
                      activeStep={activeStep}
                      setActiveStep={updateTitleUrlAndStep}
                      setSelectedStep={setSelectedStep}
                      formRef={formRef}
                      pvoTilbakemelding={pvoTilbakemelding}
                    />
                  )}
                  {activeStep === 3 && (
                    <div>test 3</div>
                    // <BehandlingensArtOgOmfangView
                    //   personkategorier={personkategorier}
                    //   etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                    //   pvkDokument={pvkDokument}
                    //   setPvkDokument={setPvkDokument}
                    //   pvoTilbakemelding={pvoTilbakemelding}
                    //   activeStep={activeStep}
                    //   setActiveStep={updateTitleUrlAndStep}
                    //   setSelectedStep={setSelectedStep}
                    //   formRef={formRef}
                    // />
                  )}
                  {activeStep === 4 && (
                    <div>test 4</div>
                    // <TilhorendeDokumentasjon
                    //   etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                    //   pvoTilbakemelding={pvoTilbakemelding}
                    //   activeStep={activeStep}
                    //   setActiveStep={updateTitleUrlAndStep}
                    //   setSelectedStep={setSelectedStep}
                    //   formRef={formRef}
                    //   pvkKrav={pvkKrav}
                    //   isPvkKravLoading={isPvkKravLoading}
                    // />
                  )}
                  {activeStep === 5 && (
                    <div>test 5</div>
                    // <InvolveringAvEksterneView
                    //   personkategorier={personkategorier}
                    //   databehandlere={databehandlere}
                    //   etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                    //   pvkDokument={pvkDokument}
                    //   setPvkDokument={setPvkDokument}
                    //   pvoTilbakemelding={pvoTilbakemelding}
                    //   activeStep={activeStep}
                    //   setActiveStep={updateTitleUrlAndStep}
                    //   setSelectedStep={setSelectedStep}
                    //   formRef={formRef}
                    // />
                  )}
                  {activeStep === 6 && (
                    <div>test 6</div>
                    // <IdentifiseringAvRisikoscenarioerOgTiltak
                    //   etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
                    //   pvkDokument={pvkDokument}
                    //   activeStep={activeStep}
                    //   setSelectedStep={setSelectedStep}
                    //   setActiveStep={updateTitleUrlAndStep}
                    //   formRef={formRef}
                    // />
                  )}
                  {activeStep === 7 && (
                    <div>test 7</div>
                    // <OppsummeringAvAlleRisikoscenarioerOgTiltak
                    //   etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
                    //   pvkDokument={pvkDokument}
                    //   pvoTilbakemelding={pvoTilbakemelding}
                    //   activeStep={activeStep}
                    //   setSelectedStep={setSelectedStep}
                    //   setActiveStep={updateTitleUrlAndStep}
                    //   formRef={formRef}
                    // />
                  )}
                  {activeStep === 8 && (
                    <div>test 8</div>
                    // <SendInnView
                    //   pvkDokument={pvkDokument}
                    //   setPvkDokument={setPvkDokument}
                    //   personkategorier={personkategorier}
                    //   databehandlere={databehandlere}
                    //   updateTitleUrlAndStep={updateTitleUrlAndStep}
                    //   etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                    //   pvoTilbakemelding={pvoTilbakemelding}
                    //   activeStep={activeStep}
                    //   setSelectedStep={setSelectedStep}
                    //   setActiveStep={updateTitleUrlAndStep}
                    //   codelistUtils={codelist.utils}
                    //   pvkKrav={pvkKrav}
                    //   isPvkKravLoading={isPvkKravLoading}
                    // />
                  )}
                </div>
              </div>
            </div>

            <Modal
              onClose={() => setIsUnsaved(false)}
              open={isUnsaved}
              header={{
                heading: 'Vil du lagre endringene dine før du går videre?',
                closeButton: false,
              }}
            >
              <Modal.Body>
                <br />
              </Modal.Body>
              <Modal.Footer>
                <Button
                  type='button'
                  onClick={() => {
                    formRef.current?.submitForm()
                    setActiveStep(selectedStep)
                    updateUrlOnStepChange(selectedStep)
                    setCurrentPage(StepTitle[selectedStep - 1])
                    setIsUnsaved(false)
                  }}
                >
                  Lagre og fortsette
                </Button>
                <Button
                  type='button'
                  variant='secondary'
                  onClick={() => {
                    setActiveStep(selectedStep)
                    updateUrlOnStepChange(selectedStep)
                    setCurrentPage(StepTitle[selectedStep - 1])
                    setIsUnsaved(false)
                  }}
                >
                  Fortsett uten å lagre
                </Button>
                <Button
                  type='button'
                  variant='tertiary'
                  onClick={() => {
                    setIsUnsaved(false)
                  }}
                >
                  Avbryt
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        )}
    </div>
  )
}

export default PvkDokumentPage
