import { FunctionComponent, RefObject } from 'react'
import { EPvkDokumentStatus, IPvkDokument, IPvoTilbakemelding } from '../../constants'
import ArtOgOmfangReadOnlyContent from '../PvkDokument/readOnly/ArtOgOmfangReadOnlyContent'
import { ContentLayout } from '../layout/layout'
import PvoSidePanelWrapper from './common/PvoSidePanelWrapper'
import PvoTilbakemeldingReadOnly from './common/PvoTilbakemeldingReadOnly'
import PvoFormButtons from './edit/PvoFormButtons'
import PvoTilbakemeldingForm from './edit/PvoTilbakemeldingForm'

type TProps = {
  personkategorier: string[]
  pvkDokument: IPvkDokument
  pvoTilbakemelding: IPvoTilbakemelding
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
}

export const BehandlingensArtOgOmfangPvoView: FunctionComponent<TProps> = ({
  personkategorier,
  pvkDokument,
  pvoTilbakemelding,
  activeStep,
  setActiveStep,
  setSelectedStep,
  formRef,
}) => (
  <div className='w-full'>
    <ContentLayout>
      <ArtOgOmfangReadOnlyContent pvkDokument={pvkDokument} personkategorier={personkategorier} />

      {/* PVO sidepanel */}
      <div>
        <PvoSidePanelWrapper>
          {![EPvkDokumentStatus.UNDERARBEID, EPvkDokumentStatus.AKTIV].includes(
            pvkDokument.status
          ) && (
            <PvoTilbakemeldingReadOnly
              tilbakemeldingsinnhold={pvoTilbakemelding.behandlingensArtOgOmfang}
              sentDate={pvoTilbakemelding.sendtDato}
              forPvo={true}
            />
          )}
          {[EPvkDokumentStatus.UNDERARBEID, EPvkDokumentStatus.AKTIV].includes(
            pvkDokument.status
          ) && (
            <PvoTilbakemeldingForm
              pvkDokumentId={pvkDokument.id}
              fieldName='behandlingensArtOgOmfang'
              initialValue={pvoTilbakemelding.behandlingensArtOgOmfang}
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
)

export default BehandlingensArtOgOmfangPvoView
