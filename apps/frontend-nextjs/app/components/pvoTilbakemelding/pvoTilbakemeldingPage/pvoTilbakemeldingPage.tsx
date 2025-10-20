'use client'

import { getEtterlevelseDokumentasjon } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { usePvkDokument } from '@/api/pvkDokument/pvkDokumentApi'
import { usePvoTilbakemelding } from '@/api/pvoTilbakemelding/pvoTilbakemeldingApi'
import CustomizedBreadcrumbs from '@/components/common/customizedBreadcrumbs/customizedBreadcrumbs'
import {
  IDataBehandler,
  IExternalCode,
} from '@/constants/behandlingskatalogen/behandlingskatalogConstants'
import { IBreadCrumbPath } from '@/constants/commonConstants'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { CodelistContext } from '@/provider/kodeverk/kodeverkProvider'
import { UserContext } from '@/provider/user/userProvider'
import { useKravFilter } from '@/query/krav/kravQuery'
import { etterlevelseDokumentasjonIdUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { pvkDokumenteringPvoTilbakemeldingUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { pvoOversiktUrl } from '@/routes/personvernombud/personvernombudetsRoutes'
import { risikoscenarioFilterAlleUrl } from '@/routes/risikoscenario/risikoscenarioRoutes'
import { Alert, Button, Loader, Modal, Stepper } from '@navikt/ds-react'
import { uniqBy } from 'lodash'
import Image from 'next/image'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { RefObject, useContext, useEffect, useRef, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import OversiktPvoView from './stepperViews/oversiktPvoView'

export const StepTitle: string[] = [
  'Oversikt og status',
  'Behandlingens livsløp',
  'Behandlingens art og omfang',
  'Tilhørende dokumentasjon',
  'Involvering av eksterne',
  'Identifisering av risikoscenarioer og tiltak',
  'Risikobildet etter tiltak',
  'Send tilbakemelding',
]

export const PvoTilbakemeldingPage = () => {
  const params: Readonly<
    Partial<{
      pvkDokumentId?: string
    }>
  > = useParams<{ pvkDokumentId?: string }>()
  const queryParams = useSearchParams()
  const currentStep = queryParams.get('steg') || '1'
  const [currentPage, setCurrentPage] = useState<string>(
    currentStep !== null ? StepTitle[parseInt(currentStep) - 1] : 'Oversikt'
  )
  const [etterlevelseDokumentasjon, setEtterlevelseDokumentasjon] =
    useState<IEtterlevelseDokumentasjon>()
  const [isEtterlevelseDokumentaasjonLoading, setIsEtterlevelseDokumentaasjonLoading] =
    useState<boolean>(false)
  const [personkategorier, setPersonKategorier] = useState<string[]>([])
  const [pvkDokument, , isPvkDokumentLoading] = usePvkDokument(params.pvkDokumentId)
  const [pvoTilbakemelding, setPvoTilbakemelding, isPvoTilbakemeldingLoading] =
    usePvoTilbakemelding(params.pvkDokumentId)
  const [databehandlere, setDatabehandlere] = useState<string[]>([])
  const [isUnsaved, setIsUnsaved] = useState<boolean>(false)
  const [activeStep, setActiveStep] = useState<number>(
    currentStep !== null ? parseInt(currentStep) : 1
  )
  const [selectedStep, setSelectedStep] = useState<number>(1)
  const { data: pvkKrav, loading: isPvkKravLoading } = useKravFilter(
    {
      gjeldendeKrav: true,
      tagger: ['Personvernkonsekvensvurdering'],
      etterlevelseDokumentasjonId: etterlevelseDokumentasjon?.id,
    },
    { skip: !etterlevelseDokumentasjon },
    true
  )
  const router = useRouter()
  const formRef: RefObject<any> = useRef(undefined)
  const user = useContext(UserContext)
  const codelist = useContext(CodelistContext)

  const breadcrumbPaths: IBreadCrumbPath[] = [
    {
      pathName: 'Oversiktssiden for personvernombudet',
      href: pvoOversiktUrl,
    },
    {
      pathName:
        'E' +
        etterlevelseDokumentasjon?.etterlevelseNummer.toString() +
        ' ' +
        etterlevelseDokumentasjon?.title,
      href: etterlevelseDokumentasjonIdUrl(etterlevelseDokumentasjon?.id),
    },
  ]

  const updateUrlOnStepChange = (step: number) => {
    router.push(
      pvkDokumenteringPvoTilbakemeldingUrl(
        params.pvkDokumentId,
        step,
        step === 7 ? risikoscenarioFilterAlleUrl() : ''
      ),
      { scroll: false }
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
        }

        if (behandling.policies && behandling.policies.length !== 0) {
          behandling.policies.map((policy) => {
            allePersonKategorier.push(...policy.personKategorier)
          })
        }
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

  useEffect(() => {
    ;(async () => {
      if (pvkDokument && pvkDokument.id) {
        setIsEtterlevelseDokumentaasjonLoading(true)
        await getEtterlevelseDokumentasjon(pvkDokument.etterlevelseDokumentId).then((response) => {
          setEtterlevelseDokumentasjon(response)
          setIsEtterlevelseDokumentaasjonLoading(false)
        })
      }
    })()
  }, [pvkDokument])

  const isPageLoading =
    isEtterlevelseDokumentaasjonLoading || isPvkDokumentLoading || isPvoTilbakemeldingLoading

  // const isPageDoneLoading =
  //   !isEtterlevelseDokumentaasjonLoading && !isPvkDokumentLoading && !isPvoTilbakemeldingLoading

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

      {etterlevelseDokumentasjon && !user.isAdmin() && !user.isPersonvernombud() && (
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

      {isPageLoading && <div></div>}

      {
        // midlertidig gjort tilgjengelig for Chris
        // isPageDoneLoading &&
        etterlevelseDokumentasjon &&
          pvkDokument &&
          (user.isPersonvernombud() || user.isAdmin()) && (
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
                      <OversiktPvoView
                        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                        pvkDokument={pvkDokument}
                        activeStep={activeStep}
                        setSelectedStep={setSelectedStep}
                        updateTitleUrlAndStep={updateTitleUrlAndStep}
                        pvoTilbakemelding={pvoTilbakemelding}
                        formRef={formRef}
                        pvkKrav={pvkKrav}
                      />
                    )}
                    {
                      activeStep === 2 && 'BehandlingensLivslopPvoView'
                      // <BehandlingensLivslopPvoView
                      //   pvoTilbakemelding={pvoTilbakemelding}
                      //   pvkDokument={pvkDokument}
                      //   etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                      //   activeStep={activeStep}
                      //   setSelectedStep={setSelectedStep}
                      //   setActiveStep={updateTitleUrlAndStep}
                      //   formRef={formRef}
                      // />
                    }
                    {
                      activeStep === 3 && 'BehandlingensArtOgOmfangPvoView'
                      // <BehandlingensArtOgOmfangPvoView
                      //   personkategorier={personkategorier}
                      //   pvkDokument={pvkDokument}
                      //   pvoTilbakemelding={pvoTilbakemelding}
                      //   activeStep={activeStep}
                      //   setSelectedStep={setSelectedStep}
                      //   setActiveStep={updateTitleUrlAndStep}
                      //   formRef={formRef}
                      // />
                    }

                    {
                      activeStep === 4 && 'TilhorendeDokumentasjonPvoView'
                      // <TilhorendeDokumentasjonPvoView
                      //   etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                      //   pvkDokumentId={pvkDokument.id}
                      //   pvoTilbakemelding={pvoTilbakemelding}
                      //   activeStep={activeStep}
                      //   setActiveStep={updateTitleUrlAndStep}
                      //   setSelectedStep={setSelectedStep}
                      //   formRef={formRef}
                      //   pvkKrav={pvkKrav}
                      //   isPvkKravLoading={isPvkKravLoading}
                      // />
                    }
                    {
                      activeStep === 5 && 'InvolveringAvEksternePvoView'
                      // <InvolveringAvEksternePvoView
                      //   personkategorier={personkategorier}
                      //   databehandlere={databehandlere}
                      //   pvkDokument={pvkDokument}
                      //   pvoTilbakemelding={pvoTilbakemelding}
                      //   activeStep={activeStep}
                      //   setSelectedStep={setSelectedStep}
                      //   setActiveStep={updateTitleUrlAndStep}
                      //   formRef={formRef}
                      // />
                    }
                    {
                      activeStep === 6 && 'IdentifiseringAvRisikoscenarioerOgTiltakPvoView'
                      // <IdentifiseringAvRisikoscenarioerOgTiltakPvoView
                      //   etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
                      //   pvkDokument={pvkDokument}
                      //   activeStep={activeStep}
                      //   setSelectedStep={setSelectedStep}
                      //   setActiveStep={updateTitleUrlAndStep}
                      // />
                    }
                    {
                      activeStep === 7 && 'OppsummeringAvAlleRisikoscenarioerOgTiltakPvoView'
                      // <OppsummeringAvAlleRisikoscenarioerOgTiltakPvoView
                      //   etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
                      //   pvkDokument={pvkDokument}
                      //   pvoTilbakemelding={pvoTilbakemelding}
                      //   activeStep={activeStep}
                      //   setSelectedStep={setSelectedStep}
                      //   setActiveStep={updateTitleUrlAndStep}
                      //   formRef={formRef}
                      // />
                    }
                    {
                      activeStep === 8 && 'SendInnPvoView'
                      // <SendInnPvoView
                      //   etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                      //   pvkDokument={pvkDokument}
                      //   personkategorier={personkategorier}
                      //   databehandlere={databehandlere}
                      //   pvoTilbakemelding={pvoTilbakemelding}
                      //   updateTitleUrlAndStep={updateTitleUrlAndStep}
                      //   activeStep={activeStep}
                      //   setSelectedStep={setSelectedStep}
                      //   setActiveStep={updateTitleUrlAndStep}
                      //   codelistUtils={codelistUtils}
                      //   setPvoTilbakemelding={setPvoTilbakemelding}
                      // />
                    }
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
          )
      }
    </div>
  )
}

export default PvoTilbakemeldingPage
