import { ContentLayout } from "@/components/others/layout/content/content"
import InvolveringAvEksterneReadOnlyContent from "@/components/PVK/pvkDokumentPage/stepperViews/readOnlyViews/involveringAvEksterneReadOnlyContent"
import { IPvkDokument } from "@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants"
import { IPvoTilbakemelding, EPvoTilbakemeldingStatus } from "@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants"
import { RefObject, FunctionComponent } from "react"
import PvoSidePanelWrapper from "../../common/pvoSidePanelWrapper"
import PvoFormButtons from "../../form/pvoFormButtons"
import PvoTilbakemeldingForm from "../../form/pvoTilbakemeldingForm"
import PvoTilbakemeldingReadOnly from "../../readOnly/pvoTilbakemeldingReadOnly"

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
      <div className='flex gap-8'>
        <div className='w-1/2'>
          <InvolveringAvEksterneReadOnlyContent
            personkategorier={personkategorier}
            databehandlere={databehandlere}
            pvkDokument={pvkDokument}
          />
        </div>
        <div className='w-1/2'>
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