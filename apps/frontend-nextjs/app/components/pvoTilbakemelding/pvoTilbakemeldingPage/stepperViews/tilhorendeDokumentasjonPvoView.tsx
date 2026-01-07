import { TilhorendeDokumentasjonContent } from '@/components/PVK/pvkDokumentPage/stepperViews/tilhorendeDokumentasjon/tilhorendeDokumentasjonContent'
import { ContentLayout } from '@/components/others/layout/content/content'
import { IPageResponse } from '@/constants/commonConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
  IVurdering,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { FunctionComponent, RefObject } from 'react'
import PvoSidePanelWrapper from '../../common/pvoSidePanelWrapper'
import PvoTilhorendeTilbakemeldingdHistorikk from '../../common/tilbakemeldingsHistorikk/pvoTilhorendeTilbakemeldingdHistorikk'
import PvoFormButtons from '../../form/pvoFormButtons'
import TilhorendeDokumentasjonPvoTilbakemeldingForm from '../../form/tilhorendeDokumentasjonPvoTilbakemeldingForm'
import TilhorendeDokumentasjonTilbakemeldingReadOnly from '../../readOnly/tilhorendeDokumentasjonTilbakemeldingReadOnly'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  pvkDokument: IPvkDokument
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
  pvkKrav:
    | {
        krav: IPageResponse<TKravQL>
      }
    | undefined
  isPvkKravLoading: boolean
  pvoTilbakemelding: IPvoTilbakemelding
  setPvoTilbakemelding: (state: IPvoTilbakemelding) => void
  relevantVurdering: IVurdering
}

export const TilhorendeDokumentasjonPvoView: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  pvkDokument,
  activeStep,
  setActiveStep,
  setSelectedStep,
  formRef,
  pvkKrav,
  isPvkKravLoading,
  pvoTilbakemelding,
  setPvoTilbakemelding,
  relevantVurdering,
}) => {
  return (
    <div className='w-full'>
      <ContentLayout>
        <div className='flex gap-8 w-full'>
          <div className='w-1/2'>
            <TilhorendeDokumentasjonContent
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              pvkKrav={pvkKrav}
              isPvkKravLoading={isPvkKravLoading}
            />
          </div>
          <div className='w-1/2'>
            <PvoSidePanelWrapper>
              {pvoTilbakemelding.status !== EPvoTilbakemeldingStatus.FERDIG && (
                <TilhorendeDokumentasjonPvoTilbakemeldingForm
                  setPvoTilbakemelding={setPvoTilbakemelding}
                  pvkDokumentId={pvkDokument.id}
                  innsendingId={pvkDokument.antallInnsendingTilPvo}
                  initialValue={relevantVurdering.tilhorendeDokumentasjon}
                  formRef={formRef}
                />
              )}

              {pvoTilbakemelding.status === EPvoTilbakemeldingStatus.FERDIG && (
                <TilhorendeDokumentasjonTilbakemeldingReadOnly
                  tilbakemeldingsinnhold={relevantVurdering.tilhorendeDokumentasjon}
                  sentDate={relevantVurdering.sendtDato}
                  forPvo={true}
                />
              )}

              {pvkDokument.antallInnsendingTilPvo > 1 && (
                <div className='mt-10'>
                  <PvoTilhorendeTilbakemeldingdHistorikk
                    pvoTilbakemelding={pvoTilbakemelding}
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
export default TilhorendeDokumentasjonPvoView
