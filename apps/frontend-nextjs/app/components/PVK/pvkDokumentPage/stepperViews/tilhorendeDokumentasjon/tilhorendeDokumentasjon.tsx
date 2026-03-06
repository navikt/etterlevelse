import { PvkSidePanelWrapper } from '@/components/PVK/common/pvkSidePanelWrapper'
import FormButtons from '@/components/PVK/edit/formButtons'
import { TilhorendeDokumentasjonContent } from '@/components/PVK/pvkDokumentPage/stepperViews/tilhorendeDokumentasjon/tilhorendeDokumentasjonContent'
import { ContentLayout } from '@/components/others/layout/content/content'
import PvoTilhorendeDokTilbakemeldingsHistorikk from '@/components/pvoTilbakemelding/common/tilbakemeldingsHistorikk/pvoTilhorendeDokTilbakemeldingsHistorikk'
import TilhorendeDokumentasjonTilbakemeldingReadOnly from '@/components/pvoTilbakemelding/readOnly/tilhorendeDokumentasjonTilbakemeldingReadOnly'
import { IPageResponse } from '@/constants/commonConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
  IVurdering,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { FunctionComponent } from 'react'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  pvkDokument: IPvkDokument
  pvkKrav:
    | {
        krav: IPageResponse<TKravQL>
      }
    | undefined
  isPvkKravLoading: boolean
  pvoTilbakemelding?: IPvoTilbakemelding
  relevantVurdering?: IVurdering
}

export const TilhorendeDokumentasjon: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  activeStep,
  pvkDokument,
  setActiveStep,
  setSelectedStep,
  pvkKrav,
  isPvkKravLoading,
  pvoTilbakemelding,
  relevantVurdering,
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
        {pvoTilbakemelding &&
          pvoTilbakemelding.status === EPvoTilbakemeldingStatus.FERDIG &&
          relevantVurdering && (
            <div>
              <PvkSidePanelWrapper>
                <TilhorendeDokumentasjonTilbakemeldingReadOnly
                  tilbakemeldingsinnhold={relevantVurdering.tilhorendeDokumentasjon}
                  sentDate={relevantVurdering.sendtDato}
                />

                {pvkDokument.antallInnsendingTilPvo > 1 && (
                  <div className='mt-10'>
                    <PvoTilhorendeDokTilbakemeldingsHistorikk
                      pvoTilbakemelding={pvoTilbakemelding}
                      relevantVurderingsInnsendingId={relevantVurdering.innsendingId}
                      forPvo={false}
                    />
                  </div>
                )}
              </PvkSidePanelWrapper>
            </div>
          )}
      </ContentLayout>
      <FormButtons
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        setSelectedStep={setSelectedStep}
      />
    </div>
  )
}

export default TilhorendeDokumentasjon
