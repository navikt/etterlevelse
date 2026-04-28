'use client'

import { PvkSidePanelWrapper } from '@/components/PVK/common/pvkSidePanelWrapper'
import FormButtons from '@/components/PVK/edit/formButtons'
import InvolveringAvEksterneReadOnlyContent from '@/components/PVK/pvkDokumentPage/stepperViews/readOnlyViews/involveringAvEksterneReadOnlyContent'
import { ContentLayout } from '@/components/others/layout/content/content'
import PvoTilbakemeldingsHistorikk from '@/components/pvoTilbakemelding/common/tilbakemeldingsHistorikk/pvoTilbakemeldingsHistorikk'
import PvoTilbakemeldingReadOnly from '@/components/pvoTilbakemelding/readOnly/pvoTilbakemeldingReadOnly'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
  IVurdering,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { FunctionComponent } from 'react'

type TProps = {
  personkategorier: string[]
  databehandlere: string[]
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  pvkDokument: IPvkDokument
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  pvoTilbakemelding?: IPvoTilbakemelding
  relevantVurdering?: IVurdering
}

export const InvolveringAvEksterneReadOnlyView: FunctionComponent<TProps> = ({
  personkategorier,
  databehandlere,
  etterlevelseDokumentasjon,
  pvkDokument,
  activeStep,
  setActiveStep,
  setSelectedStep,
  pvoTilbakemelding,
  relevantVurdering,
}) => {
  return (
    <div className='w-full'>
      <ContentLayout>
        {pvkDokument && (
          <InvolveringAvEksterneReadOnlyContent
            personkategorier={personkategorier}
            databehandlere={databehandlere}
            pvkDokument={pvkDokument}
          />
        )}

        {/* sidepanel */}

        {pvoTilbakemelding &&
          pvoTilbakemelding.status === EPvoTilbakemeldingStatus.FERDIG &&
          relevantVurdering && (
            <div>
              <PvkSidePanelWrapper>
                {[undefined, null, ''].includes(pvkDokument.godkjentAvRisikoeierDato) && (
                  <PvoTilbakemeldingReadOnly
                    relevantVurdering={relevantVurdering}
                    tilbakemeldingsinnhold={relevantVurdering.innvolveringAvEksterne}
                    sentDate={relevantVurdering.sendtDato}
                  />
                )}

                {pvkDokument.antallInnsendingTilPvo >= 1 && (
                  <div className='mt-10'>
                    <PvoTilbakemeldingsHistorikk
                      pvkDokument={pvkDokument}
                      pvoTilbakemelding={pvoTilbakemelding}
                      fieldName='innvolveringAvEksterne'
                      relevantVurdering={relevantVurdering}
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

export default InvolveringAvEksterneReadOnlyView
