import ArtOgOmfangReadOnlyContent from '@/components/PVK/pvkDokumentPage/stepperViews/readOnlyViews/artOgOmfangReadOnlyContent'
import { ContentLayout } from '@/components/others/layout/content/content'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { FunctionComponent, RefObject } from 'react'
import PvoSidePanelWrapper from '../../common/pvoSidePanelWrapper'
import PvoFormButtons from '../../form/pvoFormButtons'
import PvoTilbakemeldingForm from '../../form/pvoTilbakemeldingForm'
import PvoTilbakemeldingReadOnly from '../../readOnly/pvoTilbakemeldingReadOnly'

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
      <div className='flex gap-8 w-full'>
        <div className='w-1/2'>
          <ArtOgOmfangReadOnlyContent
            pvkDokument={pvkDokument}
            personkategorier={personkategorier}
          />
        </div>
        <div className='w-1/2'>
          <PvoSidePanelWrapper>
            {pvoTilbakemelding.status === EPvoTilbakemeldingStatus.FERDIG && (
              <PvoTilbakemeldingReadOnly
                tilbakemeldingsinnhold={pvoTilbakemelding.behandlingensArtOgOmfang}
                sentDate={pvoTilbakemelding.sendtDato}
                forPvo={true}
              />
            )}
            {pvoTilbakemelding.status !== EPvoTilbakemeldingStatus.FERDIG && (
              <PvoTilbakemeldingForm
                pvkDokumentId={pvkDokument.id}
                fieldName='behandlingensArtOgOmfang'
                initialValue={pvoTilbakemelding.behandlingensArtOgOmfang}
                formRef={formRef}
              />
            )}
          </PvoSidePanelWrapper>
        </div>
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
