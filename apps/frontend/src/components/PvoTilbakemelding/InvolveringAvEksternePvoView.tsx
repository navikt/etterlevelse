import { FunctionComponent, RefObject } from 'react'
import { EPvoTilbakemeldingStatus, IPvkDokument, IPvoTilbakemelding } from '../../constants'
import InvolveringAvEksterneReadOnlyContent from '../PvkDokument/readOnly/InvolveringAvEksterneReadOnlyContent'
import { ContentLayout } from '../layout/layout'
import PvoSidePanelWrapper from './common/PvoSidePanelWrapper'
import PvoTilbakemeldingReadOnly from './common/PvoTilbakemeldingReadOnly'
import PvoFormButtons from './edit/PvoFormButtons'
import PvoTilbakemeldingForm from './edit/PvoTilbakemeldingForm'

type TProps = {
  personkategorier: string[]
  databehandlere: string[]
  pvkDokument: IPvkDokument
  pvoTilbakemelding: IPvoTilbakemelding
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
}

export const InvolveringAvEksternePvoView: FunctionComponent<TProps> = ({
  personkategorier,
  databehandlere,
  pvkDokument,
  pvoTilbakemelding,
  activeStep,
  setActiveStep,
  setSelectedStep,
  formRef,
}) => (
  <div className='w-full'>
    <ContentLayout>
      <InvolveringAvEksterneReadOnlyContent
        personkategorier={personkategorier}
        databehandlere={databehandlere}
        pvkDokument={pvkDokument}
      />
      {/* PVO sidepanel */}
      <div>
        <PvoSidePanelWrapper>
          {pvoTilbakemelding.status === EPvoTilbakemeldingStatus.FERDIG && (
            <PvoTilbakemeldingReadOnly
              tilbakemeldingsinnhold={pvoTilbakemelding.innvolveringAvEksterne}
              sentDate={pvoTilbakemelding.sendtDato}
              forPvo={true}
            />
          )}
          {pvoTilbakemelding.status !== EPvoTilbakemeldingStatus.FERDIG && (
            <PvoTilbakemeldingForm
              pvkDokumentId={pvkDokument.id}
              fieldName='innvolveringAvEksterne'
              initialValue={pvoTilbakemelding.innvolveringAvEksterne}
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

export default InvolveringAvEksternePvoView
