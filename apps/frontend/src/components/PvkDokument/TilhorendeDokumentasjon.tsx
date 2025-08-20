import { FunctionComponent, RefObject } from 'react'
import {
  EPvoTilbakemeldingStatus,
  IPageResponse,
  IPvoTilbakemelding,
  TEtterlevelseDokumentasjonQL,
  TKravQL,
} from '../../constants'
import { ContentLayout } from '../layout/layout'
import { PvkSidePanelWrapper } from './common/PvkSidePanelWrapper'
import FormButtons from './edit/FormButtons'
import { TilhorendeDokumentasjonContent } from './readOnly/TilhorendeDokumentasjonContent'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
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
  pvoTilbakemelding?: IPvoTilbakemelding
}

export const TilhorendeDokumentasjon: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
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
        <TilhorendeDokumentasjonContent
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkKrav={pvkKrav}
          isPvkKravLoading={isPvkKravLoading}
        />

        {/* sidepanel */}
        {pvoTilbakemelding && pvoTilbakemelding.status === EPvoTilbakemeldingStatus.FERDIG && (
          <PvkSidePanelWrapper>test Tilhørende Dokumentasjon</PvkSidePanelWrapper>
        )}
      </ContentLayout>
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

export default TilhorendeDokumentasjon
