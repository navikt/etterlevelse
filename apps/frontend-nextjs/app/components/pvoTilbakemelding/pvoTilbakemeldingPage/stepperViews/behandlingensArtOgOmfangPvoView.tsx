import ArtOgOmfangReadOnlyContent from '@/components/PVK/pvkDokumentPage/stepperViews/readOnlyViews/artOgOmfangReadOnlyContent'
import { ContentLayout } from '@/components/others/layout/content/content'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
  IVurdering,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { FunctionComponent, RefObject } from 'react'
import PvoSidePanelWrapper from '../../common/pvoSidePanelWrapper'
import TilbakemeldingsHistorikk from '../../common/tilbakemeldingsHistorikk'
import PvoFormButtons from '../../form/pvoFormButtons'
import PvoTilbakemeldingForm from '../../form/pvoTilbakemeldingForm'
import PvoTilbakemeldingReadOnly from '../../readOnly/pvoTilbakemeldingReadOnly'

type TProps = {
  personkategorier: string[]
  pvkDokument: IPvkDokument
  pvoTilbakemelding: IPvoTilbakemelding
  relevantVurdering: IVurdering
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
}

export const BehandlingensArtOgOmfangPvoView: FunctionComponent<TProps> = ({
  personkategorier,
  pvkDokument,
  pvoTilbakemelding,
  relevantVurdering,
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
                tilbakemeldingsinnhold={relevantVurdering.behandlingensArtOgOmfang}
                sentDate={relevantVurdering.sendtDato}
                forPvo={true}
              />
            )}
            {pvoTilbakemelding.status !== EPvoTilbakemeldingStatus.FERDIG && (
              <PvoTilbakemeldingForm
                pvkDokumentId={pvkDokument.id}
                innsendingId={pvkDokument.antallInnsendingTilPvo}
                fieldName='behandlingensArtOgOmfang'
                initialValue={relevantVurdering.behandlingensArtOgOmfang}
                formRef={formRef}
              />
            )}

            {pvkDokument.antallInnsendingTilPvo > 1 && (
              <div className='mt-10'>
                <TilbakemeldingsHistorikk
                  pvoTilbakemelding={pvoTilbakemelding}
                  fieldName='behandlingensArtOgOmfang'
                  relevantVurderingsInnsendingId={relevantVurdering.innsendingId}
                />
              </div>
            )}
          </PvoSidePanelWrapper>
        </div>
      </div>
    </ContentLayout>
    <PvoFormButtons
      activeStep={activeStep}
      setActiveStep={setActiveStep}
      setSelectedStep={setSelectedStep}
    />
  </div>
)

export default BehandlingensArtOgOmfangPvoView
