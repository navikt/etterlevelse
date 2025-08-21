import { FunctionComponent, RefObject } from 'react'
import {
  EPvoTilbakemeldingStatus,
  IPageResponse,
  IPvoTilbakemelding,
  TEtterlevelseDokumentasjonQL,
  TKravQL,
} from '../../constants'
import { TilhorendeDokumentasjonContent } from '../PvkDokument/readOnly/TilhorendeDokumentasjonContent'
import { ContentLayout } from '../layout/layout'
import PvoSidePanelWrapper from './common/PvoSidePanelWrapper'
import TilhorendeDokumentasjonTilbakemeldingReadOnly from './common/TilhorendeDokumentasjonTilbakemeldingReadOnly'
import PvoFormButtons from './edit/PvoFormButtons'
import TilhorendeDokumentasjonForm from './edit/TilhorendeDokumentasjonForm'

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
        <div className='flex gap-8'>
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
                <TilhorendeDokumentasjonForm
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
        submitForm={formRef.current?.submitForm}
      />
    </div>
  )
}
export default TilhorendeDokumentasjonPvoView
