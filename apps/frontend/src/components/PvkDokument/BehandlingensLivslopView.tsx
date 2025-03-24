import { RefObject } from 'react'
import { IPvoTilbakemelding, TEtterlevelseDokumentasjonQL } from '../../constants'
import PvoSidePanelWrapper from '../PvoTilbakemelding/common/PvoSidePanelWrapper'
import PvoTilbakemeldingReadOnly from '../PvoTilbakemelding/common/PvoTilbakemeldingReadOnly'
import FormButtons from './edit/FormButtons'

interface IProps {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
  pvoTilbakemeliding?: IPvoTilbakemelding
}

export const BehandlingensLivslopView = (props: IProps) => {
  const {
    etterlevelseDokumentasjon,
    activeStep,
    setActiveStep,
    setSelectedStep,
    formRef,
    pvoTilbakemeliding,
  } = props

  return (
    <div className="w-full">
      <div className="flex w-full">
        <div className="pt-6 pr-4 flex flex-1 flex-col gap-4 col-span-8"></div>

        {/* Sidepanel */}
        {pvoTilbakemeliding && (
          <PvoSidePanelWrapper>
            <PvoTilbakemeldingReadOnly
              tilbakemeldingsinnhold={pvoTilbakemeliding.behandlingenslivslop}
              sentDate={pvoTilbakemeliding.sendtDato}
            />
          </PvoSidePanelWrapper>
        )}
      </div>
      <FormButtons
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        setSelectedStep={setSelectedStep}
        submitForm={formRef.current?.submitForm}
      />
    </div>
  )
}
export default BehandlingensLivslopView
