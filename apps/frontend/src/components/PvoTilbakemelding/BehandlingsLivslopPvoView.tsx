import { Loader } from '@navikt/ds-react'
import { FunctionComponent, RefObject, useEffect, useState } from 'react'
import {
  getBehandlingensLivslopByEtterlevelseDokumentId,
  mapBehandlingensLivslopRequestToFormValue,
} from '../../api/BehandlingensLivslopApi'
import {
  EPvoTilbakemeldingStatus,
  IBehandlingensLivslopRequest,
  IEtterlevelseDokumentasjon,
  IPvkDokument,
  IPvoTilbakemelding,
} from '../../constants'
import BehandlingensLivslopReadOnlyContent from '../behandlingensLivlop/BehandlingensLivslopReadonlyContent'
import { ContentLayout } from '../layout/layout'
import PvoSidePanelWrapper from './common/PvoSidePanelWrapper'
import PvoTilbakemeldingReadOnly from './common/PvoTilbakemeldingReadOnly'
import PvoFormButtons from './edit/PvoFormButtons'
import PvoTilbakemeldingForm from './edit/PvoTilbakemeldingForm'

type TProps = {
  pvoTilbakemelding: IPvoTilbakemelding
  pvkDokument: IPvkDokument
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
}

export const BehandlingensLivslopPvoView: FunctionComponent<TProps> = ({
  pvoTilbakemelding,
  pvkDokument,
  etterlevelseDokumentasjon,
  activeStep,
  setActiveStep,
  setSelectedStep,
  formRef,
}) => {
  const [behandlingensLivslop, setBehandlingsLivslop] = useState<IBehandlingensLivslopRequest>(
    mapBehandlingensLivslopRequestToFormValue({})
  )

  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      if (etterlevelseDokumentasjon.id) {
        setIsLoading(true)
        await getBehandlingensLivslopByEtterlevelseDokumentId(etterlevelseDokumentasjon.id)
          .then((response) => {
            const behandlingenslivslop = mapBehandlingensLivslopRequestToFormValue(response)
            setBehandlingsLivslop(behandlingenslivslop)
          })
          .finally(() => setIsLoading(false))
      }
    })()
  }, [etterlevelseDokumentasjon])

  return (
    <div className='flex justify-center'>
      {isLoading && (
        <div className='flex w-full justify-center items-center mt-5'>
          <Loader size='3xlarge' className='flex justify-self-center' />
        </div>
      )}
      {!isLoading && (
        <div className='w-full'>
          <ContentLayout>
            <BehandlingensLivslopReadOnlyContent
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              behandlingensLivslop={behandlingensLivslop}
            />

            {/* PVO sidepanel */}
            <div>
              <PvoSidePanelWrapper>
                {[EPvoTilbakemeldingStatus.FERDIG, EPvoTilbakemeldingStatus.UTGAAR].includes(
                  pvoTilbakemelding.status
                ) && (
                  <PvoTilbakemeldingReadOnly
                    tilbakemeldingsinnhold={pvoTilbakemelding.behandlingenslivslop}
                    sentDate={pvoTilbakemelding.sendtDato}
                    forPvo={true}
                  />
                )}
                {![EPvoTilbakemeldingStatus.FERDIG, EPvoTilbakemeldingStatus.UTGAAR].includes(
                  pvoTilbakemelding.status
                ) && (
                  <PvoTilbakemeldingForm
                    pvkDokumentId={pvkDokument.id}
                    fieldName='behandlingenslivslop'
                    initialValue={pvoTilbakemelding.behandlingenslivslop}
                    formRef={formRef}
                  />
                )}
              </PvoSidePanelWrapper>
            </div>
          </ContentLayout>
          <PvoFormButtons
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            setSelectedStep={setSelectedStep}
            submitForm={formRef.current?.submitForm}
          />
        </div>
      )}
    </div>
  )
}
export default BehandlingensLivslopPvoView
