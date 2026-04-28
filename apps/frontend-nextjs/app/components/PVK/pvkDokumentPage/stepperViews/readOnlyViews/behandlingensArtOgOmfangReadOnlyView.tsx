'use client'

import { useBehandlingensArtOgOmfang } from '@/api/behandlingensArtOgOmfang/behandlingensArtOgOmfangApi'
import { PvkSidePanelWrapper } from '@/components/PVK/common/pvkSidePanelWrapper'
import FormButtons from '@/components/PVK/edit/formButtons'
import ArtOgOmfangReadOnlyContent from '@/components/PVK/pvkDokumentPage/stepperViews/readOnlyViews/artOgOmfangReadOnlyContent'
import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
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
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  pvkDokument: IPvkDokument
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  pvoTilbakemelding?: IPvoTilbakemelding
  relevantVurdering?: IVurdering
}

export const BehandlingensArtOgOmfangReadOnlyView: FunctionComponent<TProps> = ({
  personkategorier,
  etterlevelseDokumentasjon,
  pvkDokument,
  activeStep,
  setActiveStep,
  setSelectedStep,
  pvoTilbakemelding,
  relevantVurdering,
}) => {
  const [artOgOmfang, , loading] = useBehandlingensArtOgOmfang(etterlevelseDokumentasjon.id)

  return (
    <div className='w-full'>
      <ContentLayout>
        {loading && <CenteredLoader />}

        {!loading && artOgOmfang && (
          <ArtOgOmfangReadOnlyContent
            artOgOmfang={artOgOmfang}
            personkategorier={personkategorier}
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
                    tilbakemeldingsinnhold={relevantVurdering.behandlingensArtOgOmfang}
                    sentDate={relevantVurdering.sendtDato}
                  />
                )}

                {pvkDokument.antallInnsendingTilPvo >= 1 && (
                  <div className='mt-10'>
                    <PvoTilbakemeldingsHistorikk
                      pvkDokument={pvkDokument}
                      pvoTilbakemelding={pvoTilbakemelding}
                      fieldName='behandlingensArtOgOmfang'
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

export default BehandlingensArtOgOmfangReadOnlyView
