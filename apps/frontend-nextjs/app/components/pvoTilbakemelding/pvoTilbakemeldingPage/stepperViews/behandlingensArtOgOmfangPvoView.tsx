'use client'

import { useBehandlingensArtOgOmfang } from '@/api/behandlingensArtOgOmfang/behandlingensArtOgOmfangApi'
import ArtOgOmfangReadOnlyContent from '@/components/PVK/pvkDokumentPage/stepperViews/readOnlyViews/artOgOmfangReadOnlyContent'
import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import { ContentLayout } from '@/components/others/layout/content/content'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
  IVurdering,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import moment from 'moment'
import { FunctionComponent, RefObject, useMemo } from 'react'
import PvoSidePanelWrapper from '../../common/pvoSidePanelWrapper'
import PvoTilbakemeldingsHistorikk from '../../common/tilbakemeldingsHistorikk/pvoTilbakemeldingsHistorikk'
import PvoFormButtons from '../../form/pvoFormButtons'
import PvoTilbakemeldingForm from '../../form/pvoTilbakemeldingForm'
import PvoTilbakemeldingReadOnly from '../../readOnly/pvoTilbakemeldingReadOnly'

type TProps = {
  personkategorier: string[]
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  pvkDokument: IPvkDokument
  pvoTilbakemelding: IPvoTilbakemelding
  setPvoTilbakemelding: (state: IPvoTilbakemelding) => void
  relevantVurdering: IVurdering
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
}

export const BehandlingensArtOgOmfangPvoView: FunctionComponent<TProps> = ({
  personkategorier,
  pvkDokument,
  etterlevelseDokumentasjon,
  pvoTilbakemelding,
  setPvoTilbakemelding,
  relevantVurdering,
  activeStep,
  setActiveStep,
  setSelectedStep,
  formRef,
}) => {
  const [artOgOmfang, , loading] = useBehandlingensArtOgOmfang(pvkDokument.etterlevelseDokumentId)

  const isChangesMadeSinceLastSubmission = useMemo(() => {
    if (pvkDokument.antallInnsendingTilPvo > 1) {
      const previousSubmission = pvoTilbakemelding.vurderinger.find(
        (vurdering) =>
          vurdering.innsendingId === pvkDokument.antallInnsendingTilPvo - 1 &&
          vurdering.etterlevelseDokumentVersjon ===
            etterlevelseDokumentasjon.etterlevelseDokumentVersjon
      )

      if (
        previousSubmission &&
        moment(artOgOmfang.changeStamp.lastModifiedDate).isAfter(previousSubmission.sendtDato)
      ) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }, [artOgOmfang, pvkDokument, pvoTilbakemelding])

  return (
    <div className='w-full'>
      <ContentLayout>
        <div className='flex gap-8 w-full'>
          <div className='w-1/2'>
            {loading && <CenteredLoader />}
            {!loading && (
              <ArtOgOmfangReadOnlyContent
                artOgOmfang={artOgOmfang}
                personkategorier={personkategorier}
                isChangesMadeSinceLastSubmission={isChangesMadeSinceLastSubmission}
              />
            )}
          </div>
          <div className='w-1/2'>
            <PvoSidePanelWrapper>
              {pvoTilbakemelding.status === EPvoTilbakemeldingStatus.FERDIG && (
                <PvoTilbakemeldingReadOnly
                  tilbakemeldingsinnhold={relevantVurdering.behandlingensArtOgOmfang}
                  sentDate={relevantVurdering.sendtDato}
                  forPvo={true}
                />
              )}
              {pvoTilbakemelding.status !== EPvoTilbakemeldingStatus.FERDIG && (
                <PvoTilbakemeldingForm
                  etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                  setPvoTilbakemelding={setPvoTilbakemelding}
                  pvkDokumentId={pvkDokument.id}
                  innsendingId={pvkDokument.antallInnsendingTilPvo}
                  fieldName='behandlingensArtOgOmfang'
                  initialValue={relevantVurdering.behandlingensArtOgOmfang}
                  formRef={formRef}
                />
              )}

              {pvkDokument.antallInnsendingTilPvo > 1 && (
                <div className='mt-10'>
                  <PvoTilbakemeldingsHistorikk
                    pvoTilbakemelding={pvoTilbakemelding}
                    fieldName='behandlingensArtOgOmfang'
                    relevantVurderingsInnsendingId={relevantVurdering.innsendingId}
                  />
                </div>
              )}
            </PvoSidePanelWrapper>
          </div>
        </div>
      </ContentLayout>
      <PvoFormButtons
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        setSelectedStep={setSelectedStep}
      />
    </div>
  )
}

export default BehandlingensArtOgOmfangPvoView
