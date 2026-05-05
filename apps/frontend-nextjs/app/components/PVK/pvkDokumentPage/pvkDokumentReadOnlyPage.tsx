'use client'

import { useEtterlevelseDokumentasjon } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { usePvkDokument } from '@/api/pvkDokument/pvkDokumentApi'
import { getPvoTilbakemeldingByPvkDokumentId } from '@/api/pvoTilbakemelding/pvoTilbakemeldingApi'
import TilhorendeDokumentasjon from '@/components/PVK/pvkDokumentPage/stepperViews/tilhorendeDokumentasjon/tilhorendeDokumentasjon'
import CustomizedBreadcrumbs from '@/components/common/customizedBreadcrumbs/customizedBreadcrumbs'
import {
  IDataBehandler,
  IExternalCode,
} from '@/constants/behandlingskatalogen/behandlingskatalogConstants'
import { IBreadCrumbPath } from '@/constants/commonConstants'
import { EPvkDokumentStatus } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  IPvoTilbakemelding,
  IVurdering,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { CodelistContext } from '@/provider/kodeverk/kodeverkProvider'
import { useKravFilter } from '@/query/krav/kravQuery'
import { etterlevelseDokumentasjonIdUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { pvkDokumentasjonReadOnlyStepUrl } from '@/routes/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensvurderingRoutes'
import { risikoscenarioFilterAlleUrl } from '@/routes/risikoscenario/risikoscenarioRoutes'
import { dokumentasjonerBreadCrumbPath } from '@/util/breadCrumbPath/breadCrumbPath'
import { createNewPvoVurderning } from '@/util/pvoTilbakemelding/pvoTilbakemeldingUtils'
import { Loader, Stepper } from '@navikt/ds-react'
import { uniqBy } from 'lodash'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useContext, useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import OversiktView from './stepperViews/oversiktView'
import BehandlingensArtOgOmfangReadOnlyView from './stepperViews/readOnlyViews/behandlingensArtOgOmfangReadOnlyView'
import BehandlingensLivslopReadOnlyView from './stepperViews/readOnlyViews/behandlingensLivslopReadOnlyView'
import IdentifiseringAvRisikoscenarioerOgTiltakReadOnlyView from './stepperViews/readOnlyViews/identifiseringAvRisikoscenarioerOgTiltak/identifiseringAvRisikoscenarioerOgTiltakReadOnlyView'
import InvolveringAvEksterneReadOnlyView from './stepperViews/readOnlyViews/involveringAvEksterneReadOnlyView'
import OppsummeringAvAlleRisikoscenarioerOgTiltakReadOnlyView from './stepperViews/readOnlyViews/oppsummeringAvAlleRisikoscenarioerOgTiltak/oppsummeringAvAlleRisikoscenarioerOgTiltakReadOnlyView'
import { SendInnReadOnlyView } from './stepperViews/readOnlyViews/sendInn/sendInnReadOnlyView'

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

export const PvkDokumentReadOnlyPage = () => {
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
  const [pvkDokument, setPvkDokument] = usePvkDokument(
    params.pvkDokumentId,
    params.etterlevelseDokumentasjonId
  )
  const [pvoTilbakemelding, setPvoTilbakemelding] = useState<IPvoTilbakemelding>()
  const [activeStep, setActiveStep] = useState<number>(
    currentStep !== null ? parseInt(currentStep) : 1
  )
  const [, setSelectedStep] = useState<number>(1)
  const router = useRouter()
  const { data: pvkKrav, loading: isPvkKravLoading } = useKravFilter(
    {
      gjeldendeKrav: true,
      tagger: ['Personvernkonsekvensvurdering'],
      etterlevelseDokumentasjonId: etterlevelseDokumentasjon?.id,
    },
    { skip: !etterlevelseDokumentasjon },
    true
  )
  const codelist = useContext(CodelistContext)

  const readOnlyData: { databehandlere: string[]; personkategorier: string[] } = useMemo(() => {
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

      return {
        databehandlere: uniqDatabehandlere,
        personkategorier: uniqPersonkategorier,
      }
    } else {
      return {
        databehandlere: [],
        personkategorier: [],
      }
    }
  }, [etterlevelseDokumentasjon])

  const relevantVurdering: IVurdering | undefined = useMemo(() => {
    if (pvkDokument && pvoTilbakemelding && etterlevelseDokumentasjon) {
      const vurdering = pvoTilbakemelding.vurderinger.find(
        (vurdering) =>
          vurdering.innsendingId === pvkDokument.antallInnsendingTilPvo &&
          vurdering.etterlevelseDokumentVersjon ===
            etterlevelseDokumentasjon.etterlevelseDokumentVersjon
      )
      if (vurdering) {
        return vurdering
      } else {
        return createNewPvoVurderning(
          pvkDokument.antallInnsendingTilPvo,
          etterlevelseDokumentasjon.etterlevelseDokumentVersjon
        )
      }
    }
  }, [etterlevelseDokumentasjon, pvoTilbakemelding, pvkDokument])

  const breadcrumbPaths: IBreadCrumbPath[] = [
    dokumentasjonerBreadCrumbPath,
    {
      pathName: `E${etterlevelseDokumentasjon?.etterlevelseNummer.toString()}.${etterlevelseDokumentasjon?.etterlevelseDokumentVersjon} ${etterlevelseDokumentasjon?.title}`,
      href: etterlevelseDokumentasjonIdUrl(params.etterlevelseDokumentasjonId),
    },
  ]

  const updateUrlOnStepChange = (step: number): void => {
    router.push(
      pvkDokumentasjonReadOnlyStepUrl(
        pvkDokument?.etterlevelseDokumentId,
        pvkDokument?.id,
        step,
        step === 7 ? risikoscenarioFilterAlleUrl() : ''
      )
    )
  }

  const updateTitleUrlAndStep = (step: number) => {
    setActiveStep(step)
    updateUrlOnStepChange(step)
    setCurrentPage(StepTitle[step - 1])
  }

  useEffect(() => {
    ;(async () => {
      if (pvkDokument && pvkDokument.id) {
        if (![EPvkDokumentStatus.UNDERARBEID].includes(pvkDokument.status)) {
          await getPvoTilbakemeldingByPvkDokumentId(pvkDokument.id)
            .then(setPvoTilbakemelding)
            .catch(() => undefined)
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

      {etterlevelseDokumentasjon && pvkDokument && (
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
                    setPvkDokument={setPvkDokument}
                    pvoTilbakemelding={pvoTilbakemelding}
                    activeStep={activeStep}
                    setSelectedStep={setSelectedStep}
                    updateTitleUrlAndStep={updateTitleUrlAndStep}
                    pvkKrav={pvkKrav}
                  />
                )}
                {activeStep === 2 && (
                  <BehandlingensLivslopReadOnlyView
                    etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                    pvkDokument={pvkDokument}
                    activeStep={activeStep}
                    setActiveStep={updateTitleUrlAndStep}
                    setSelectedStep={setSelectedStep}
                    pvoTilbakemelding={pvoTilbakemelding}
                    relevantVurdering={relevantVurdering}
                  />
                )}
                {activeStep === 3 && (
                  <BehandlingensArtOgOmfangReadOnlyView
                    personkategorier={readOnlyData.personkategorier}
                    etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                    pvkDokument={pvkDokument}
                    pvoTilbakemelding={pvoTilbakemelding}
                    relevantVurdering={relevantVurdering}
                    activeStep={activeStep}
                    setActiveStep={updateTitleUrlAndStep}
                    setSelectedStep={setSelectedStep}
                  />
                )}
                {activeStep === 4 && (
                  <TilhorendeDokumentasjon
                    etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                    pvoTilbakemelding={pvoTilbakemelding}
                    relevantVurdering={relevantVurdering}
                    activeStep={activeStep}
                    setActiveStep={updateTitleUrlAndStep}
                    setSelectedStep={setSelectedStep}
                    pvkKrav={pvkKrav}
                    pvkDokument={pvkDokument}
                    isPvkKravLoading={isPvkKravLoading}
                    readOnly={true}
                  />
                )}
                {activeStep === 5 && (
                  <InvolveringAvEksterneReadOnlyView
                    personkategorier={readOnlyData.personkategorier}
                    databehandlere={readOnlyData.databehandlere}
                    etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                    pvkDokument={pvkDokument}
                    pvoTilbakemelding={pvoTilbakemelding}
                    relevantVurdering={relevantVurdering}
                    activeStep={activeStep}
                    setActiveStep={updateTitleUrlAndStep}
                    setSelectedStep={setSelectedStep}
                  />
                )}
                {activeStep === 6 && (
                  <IdentifiseringAvRisikoscenarioerOgTiltakReadOnlyView
                    etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                    pvkDokument={pvkDokument}
                    activeStep={activeStep}
                    setSelectedStep={setSelectedStep}
                    setActiveStep={updateTitleUrlAndStep}
                  />
                )}
                {activeStep === 7 && (
                  <OppsummeringAvAlleRisikoscenarioerOgTiltakReadOnlyView
                    etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                    pvkDokument={pvkDokument}
                    pvoTilbakemelding={pvoTilbakemelding}
                    relevantVurdering={relevantVurdering}
                    activeStep={activeStep}
                    setSelectedStep={setSelectedStep}
                    setActiveStep={updateTitleUrlAndStep}
                  />
                )}
                {activeStep === 8 && (
                  <SendInnReadOnlyView
                    pvkDokument={pvkDokument}
                    setPvkDokument={setPvkDokument}
                    personkategorier={readOnlyData.personkategorier}
                    databehandlere={readOnlyData.databehandlere}
                    updateTitleUrlAndStep={updateTitleUrlAndStep}
                    etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                    pvoTilbakemelding={pvoTilbakemelding}
                    activeStep={activeStep}
                    setSelectedStep={setSelectedStep}
                    setActiveStep={updateTitleUrlAndStep}
                    codelistUtils={codelist.utils}
                    pvkKrav={pvkKrav}
                    isPvkKravLoading={isPvkKravLoading}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PvkDokumentReadOnlyPage
