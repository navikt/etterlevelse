'use client'

import { useBehandlingensArtOgOmfang } from '@/api/behandlingensArtOgOmfang/behandlingensArtOgOmfangApi'
import ArtOgOmfangReadOnlyContent from '@/components/PVK/pvkDokumentPage/stepperViews/readOnlyViews/artOgOmfangReadOnlyContent'
import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import { ContentLayout } from '@/components/others/layout/content/content'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
  IVurdering,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { FunctionComponent, RefObject } from 'react'
import PvoSidePanelWrapper from '../../common/pvoSidePanelWrapper'
import PvoTilbakemeldingsHistorikk from '../../common/tilbakemeldingsHistorikk/pvoTilbakemeldingsHistorikk'
import PvoFormButtons from '../../form/pvoFormButtons'
import PvoTilbakemeldingForm from '../../form/pvoTilbakemeldingForm'
import PvoTilbakemeldingReadOnly from '../../readOnly/pvoTilbakemeldingReadOnly'

type TProps = {
  personkategorier: string[]
  pvkDokument: IPvkDokument
  pvoTilbakemelding: IPvoTilbakemelding
  setPvoTilbakemelding: (state: IPvoTilbakemelding) => void
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
  setPvoTilbakemelding,
  relevantVurdering,
  activeStep,
  setActiveStep,
  setSelectedStep,
  formRef,
}) => {
  const [artOgOmfang, , loading] = useBehandlingensArtOgOmfang(pvkDokument.etterlevelseDokumentId)

  console.debug(artOgOmfang)

  return (
    <div className='w-full'>
      <ContentLayout>
        <div className='flex gap-8 w-full'>
          <div className='w-1/2'>
            {loading && <CenteredLoader />}
            {!loading && (
              <ArtOgOmfangReadOnlyContent
                artOgOmfang={artOgOmfang}
                personkategorier={personkategorier}
              />
            )}
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
                  setPvoTilbakemelding={setPvoTilbakemelding}
                  pvkDokumentId={pvkDokument.id}
                  innsendingId={pvkDokument.antallInnsendingTilPvo}
                  fieldName='behandlingensArtOgOmfang'
                  initialValue={relevantVurdering.behandlingensArtOgOmfang}
                  formRef={formRef}
                />
              )}

              {pvkDokument.antallInnsendingTilPvo > 1 && (
                <div className='mt-10'>
                  <PvoTilbakemeldingsHistorikk
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
}

export default BehandlingensArtOgOmfangPvoView
