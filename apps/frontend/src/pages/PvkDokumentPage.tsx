import { Loader, Stepper } from '@navikt/ds-react'
import { useState } from 'react'
import { Helmet } from 'react-helmet'
import { useParams } from 'react-router-dom'
import { useEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import { usePvkDokument } from '../api/PvkDokumentApi'
import CustomizedBreadcrumbs from '../components/common/CustomizedBreadcrumbs'
import { IBreadCrumbPath } from '../constants'
import { dokumentasjonerBreadCrumbPath } from './util/BreadCrumbPath'

export const PvkDokumentPage = () => {
  const params: Readonly<
    Partial<{
      id?: string
      pvkdokumentId?: string
    }>
  > = useParams<{ id?: string }>()
  const url = new URL(window.location.href)
  const currentStep = url.searchParams.get('steg')
  const [currentPage] = useState<string>('Oversikt')
  const [etterlevelseDokumentasjon] = useEtterlevelseDokumentasjon(params.id)
  const [pvkDokument] = usePvkDokument(params.pvkdokumentId)
  const [activeStep, setActiveStep] = useState<number>(
    currentStep !== null ? parseInt(currentStep) : 1
  )
  const breadcrumbPaths: IBreadCrumbPath[] = [
    dokumentasjonerBreadCrumbPath,
    {
      pathName:
        'E' +
        etterlevelseDokumentasjon?.etterlevelseNummer.toString() +
        ' ' +
        etterlevelseDokumentasjon?.title,
      href: '/dokumentasjoner/' + params.id,
    },

    {
      pathName: 'Personvernkonsekvensvurdering',
      href: '/dokumentasjoner/' + params.id + '/pvkbehov/' + params.pvkdokumentId,
    },
  ]

  const handleStepChange = (step: number) => {
    url.searchParams.set('steg', step.toString())
    window.history.pushState({}, '', url)
  }

  return (
    <div id="content" role="main" className="flex flex-col w-full bg-white">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Pvk Dokument</title>
      </Helmet>
      {!etterlevelseDokumentasjon && <Loader size="large" />}
      {etterlevelseDokumentasjon && pvkDokument && (
        <div className="h-48 bg-[#8269A21F] flex flex-col w-full items-center">
          <div className="w-full max-w-7xl">
            <div className="px-2 pb-6">
              <CustomizedBreadcrumbs currentPage={currentPage} paths={breadcrumbPaths} />

              <div>
                <Stepper
                  aria-labelledby="stepper-heading"
                  activeStep={activeStep}
                  onStepChange={(value) => {
                    setActiveStep(value)
                    handleStepChange(value)
                  }}
                  orientation="horizontal"
                >
                  <Stepper.Step>Oversikt</Stepper.Step>
                  <Stepper.Step>Behandlingens art og omfang</Stepper.Step>
                  <Stepper.Step>Innvolvering av eksterne</Stepper.Step>
                  <Stepper.Step>Risikoscenarioer tilknyttet etterlevelseskrav</Stepper.Step>
                  <Stepper.Step>Generelle risikoscenarioer</Stepper.Step>
                  <Stepper.Step>Send inn</Stepper.Step>
                </Stepper>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PvkDokumentPage
