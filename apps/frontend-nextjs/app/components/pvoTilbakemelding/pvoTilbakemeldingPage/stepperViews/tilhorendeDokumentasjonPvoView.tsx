import { TilhorendeDokumentasjonContent } from '@/components/PVK/pvkDokumentPage/stepperViews/tilhorendeDokumentasjon/tilhorendeDokumentasjonContent'
import { ContentLayout } from '@/components/others/layout/content/content'
import { IPageResponse } from '@/constants/commonConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { FunctionComponent, RefObject } from 'react'
import PvoSidePanelWrapper from '../../common/pvoSidePanelWrapper'
import PvoFormButtons from '../../form/pvoFormButtons'
import TilhorendeDokumentasjonPvoTilbakemeldingForm from '../../form/tilhorendeDokumentasjonPvoTilbakemeldingForm'
import TilhorendeDokumentasjonTilbakemeldingReadOnly from '../../readOnly/tilhorendeDokumentasjonTilbakemeldingReadOnly'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  pvkDokumentId: string
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
}

export const TilhorendeDokumentasjonPvoView: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  pvkDokumentId,
  activeStep,
  setActiveStep,
  setSelectedStep,
  formRef,
  pvkKrav,
  isPvkKravLoading,
  pvoTilbakemelding,
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
                  pvkDokumentId={pvkDokumentId}
                  initialValue={pvoTilbakemelding.tilhorendeDokumentasjon}
                  formRef={formRef}
                />
              )}

              {pvoTilbakemelding.status === EPvoTilbakemeldingStatus.FERDIG && (
                <TilhorendeDokumentasjonTilbakemeldingReadOnly
                  tilbakemeldingsinnhold={pvoTilbakemelding.tilhorendeDokumentasjon}
                  sentDate={pvoTilbakemelding.sendtDato}
                  forPvo={true}
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
      />
    </div>
  )
}
export default TilhorendeDokumentasjonPvoView
