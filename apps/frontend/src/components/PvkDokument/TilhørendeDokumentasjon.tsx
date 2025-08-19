import { FunctionComponent, RefObject } from 'react'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
  TEtterlevelseDokumentasjonQL,
} from '../../constants'
import { ContentLayout } from '../layout/layout'
import { PvkSidePanelWrapper } from './common/PvkSidePanelWrapper'
import FormButtons from './edit/FormButtons'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
  pvoTilbakemelding?: IPvoTilbakemelding
}

export const TilhørendeDokumentasjon: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  activeStep,
  setActiveStep,
  setSelectedStep,
  formRef,
  pvoTilbakemelding,
}) => {
  return (
    <div className='w-full'>
      <ContentLayout>
        <div className='pt-6 pr-4 flex flex-1 flex-col gap-4 col-span-8'>
          Tilhørende dokumentasjon test
        </div>

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

export default TilhørendeDokumentasjon
