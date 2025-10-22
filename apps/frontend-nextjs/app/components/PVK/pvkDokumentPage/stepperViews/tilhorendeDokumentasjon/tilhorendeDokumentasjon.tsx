import { PvkSidePanelWrapper } from '@/components/PVK/common/pvkSidePanelWrapper'
import FormButtons from '@/components/PVK/edit/formButtons'
import { TilhorendeDokumentasjonContent } from '@/components/PVK/pvkDokumentPage/stepperViews/tilhorendeDokumentasjon/tilhorendeDokumentasjonContent'
import { ContentLayout } from '@/components/others/layout/content/content'
import TilhorendeDokumentasjonTilbakemeldingReadOnly from '@/components/pvoTilbakemelding/readOnly/tilhorendeDokumentasjonTilbakemeldingReadOnly'
import { IPageResponse } from '@/constants/commonConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { FunctionComponent, RefObject } from 'react'

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
          <div>
            <PvkSidePanelWrapper>
              <TilhorendeDokumentasjonTilbakemeldingReadOnly
                tilbakemeldingsinnhold={pvoTilbakemelding.tilhorendeDokumentasjon}
                sentDate={pvoTilbakemelding.sendtDato}
              />
            </PvkSidePanelWrapper>
          </div>
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
