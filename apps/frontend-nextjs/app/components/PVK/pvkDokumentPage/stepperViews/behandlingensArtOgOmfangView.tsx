'use client'

import { useBehandlingensArtOgOmfang } from '@/api/behandlingensArtOgOmfang/behandlingensArtOgOmfangApi'
import { PvkSidePanelWrapper } from '@/components/PVK/common/pvkSidePanelWrapper'
import FormButtons from '@/components/PVK/edit/formButtons'
import ArtOgOmfangReadOnlyContent from '@/components/PVK/pvkDokumentPage/stepperViews/readOnlyViews/artOgOmfangReadOnlyContent'
import BehandlingensArtOgOmfangForm from '@/components/behandlingensArtOgOmfang/form/behandlingensArtOgOmfangForm'
import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import { ContentLayout } from '@/components/others/layout/content/content'
import AlertPvoUnderArbeidModal from '@/components/pvoTilbakemelding/common/alertPvoUnderArbeidModal'
import PvoTilbakemeldingReadOnly from '@/components/pvoTilbakemelding/readOnly/pvoTilbakemeldingReadOnly'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
  IVurdering,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { isReadOnlyPvkStatus } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { FunctionComponent, RefObject, useState } from 'react'

type TProps = {
  personkategorier: string[]
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  pvkDokument: IPvkDokument
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
  pvoTilbakemelding?: IPvoTilbakemelding
  relevantVurdering?: IVurdering
}

export const BehandlingensArtOgOmfangView: FunctionComponent<TProps> = ({
  personkategorier,
  etterlevelseDokumentasjon,
  pvkDokument,
  activeStep,
  setActiveStep,
  setSelectedStep,
  formRef,
  pvoTilbakemelding,
  relevantVurdering,
}) => {
  const [savedSuccessful, setSavedSuccessful] = useState<boolean>(false)
  const [artOgOmfang, setArtOgOmfang, loading] = useBehandlingensArtOgOmfang(
    etterlevelseDokumentasjon.id
  )

  const [isPvoAlertModalOpen, setIsPvoAlertModalOpen] = useState<boolean>(false)

  return (
    <div className='w-full'>
      <ContentLayout>
        {loading && <CenteredLoader />}

        {!loading && artOgOmfang && !isReadOnlyPvkStatus(pvkDokument.status) && (
          <div className='pt-6 pr-4 flex flex-1 flex-col gap-4 col-span-8'>
            <BehandlingensArtOgOmfangForm
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              personkategorier={personkategorier}
              artOgOmfang={artOgOmfang}
              setArtOgOmfang={setArtOgOmfang}
              savedSuccessful={savedSuccessful}
              setSavedSuccessful={setSavedSuccessful}
              setIsPvoAlertModalOpen={setIsPvoAlertModalOpen}
              formRef={formRef}
            />
            {isPvoAlertModalOpen && (
              <AlertPvoUnderArbeidModal
                isOpen={isPvoAlertModalOpen}
                onClose={() => setIsPvoAlertModalOpen(false)}
                pvkDokumentId={pvkDokument.id}
              />
            )}
          </div>
        )}

        {!loading && artOgOmfang && isReadOnlyPvkStatus(pvkDokument.status) && (
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
                <PvoTilbakemeldingReadOnly
                  tilbakemeldingsinnhold={relevantVurdering.behandlingensArtOgOmfang}
                  sentDate={relevantVurdering.sendtDato}
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
      />
    </div>
  )
}

export default BehandlingensArtOgOmfangView
