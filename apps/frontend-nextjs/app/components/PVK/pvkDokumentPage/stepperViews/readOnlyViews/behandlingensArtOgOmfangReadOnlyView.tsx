'use client'

import { AxiosError } from 'axios'
import { FunctionComponent, useEffect, useState } from 'react'
import {
  getBehandlingensArtOgOmfangByEtterlevelseDokumentIdAndTimestamp,
  mapBehandlingensArtOgOmfangToFormValue,
} from '@/api/behandlingensArtOgOmfang/behandlingensArtOgOmfangApi'
import { PvkSidePanelWrapper } from '@/components/PVK/common/pvkSidePanelWrapper'
import FormButtons from '@/components/PVK/edit/formButtons'
import ArtOgOmfangReadOnlyContent from '@/components/PVK/pvkDokumentPage/stepperViews/readOnlyViews/artOgOmfangReadOnlyContent'
import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import { ContentLayout } from '@/components/others/layout/content/content'
import PvoTilbakemeldingsHistorikk from '@/components/pvoTilbakemelding/common/tilbakemeldingsHistorikk/pvoTilbakemeldingsHistorikk'
import { PvoTilbakemeldingReadOnly } from '@/components/pvoTilbakemelding/readOnly/pvoTilbakemeldingReadOnly'
import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
  IVurdering,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'

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

const BehandlingensArtOgOmfangReadOnlyView: FunctionComponent<TProps> = ({
  personkategorier,
  etterlevelseDokumentasjon,
  pvkDokument,
  activeStep,
  setActiveStep,
  setSelectedStep,
  pvoTilbakemelding,
  relevantVurdering,
}) => {
  const [artOgOmfang, setArtOgOmfang] = useState<IBehandlingensArtOgOmfang>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const brukerAlleOpplysningstyper =
    etterlevelseDokumentasjon.behandlinger?.some(
      (behandling) => behandling.brukerAlleOpplysningstyper === true
    ) ?? false

  const hasPvoComment = !!(
    pvoTilbakemelding &&
    pvoTilbakemelding.status === EPvoTilbakemeldingStatus.FERDIG &&
    relevantVurdering
  )

  useEffect(() => {
    ;(async () => {
      if (etterlevelseDokumentasjon && etterlevelseDokumentasjon.id) {
        setIsLoading(true)
        await getBehandlingensArtOgOmfangByEtterlevelseDokumentIdAndTimestamp(
          etterlevelseDokumentasjon.id,
          pvkDokument.changeStamp.lastModifiedDate
        )
          .then((response: IBehandlingensArtOgOmfang) => {
            setArtOgOmfang(response)
          })
          .catch((error: AxiosError) => {
            if (error.status === 404) {
              setArtOgOmfang(mapBehandlingensArtOgOmfangToFormValue({}))
            } else {
              console.debug(error)
            }
          })
          .finally(() => setIsLoading(false))
      }
    })()
  }, [etterlevelseDokumentasjon])

  return (
    <div className='w-full'>
      <ContentLayout>
        {isLoading && <CenteredLoader />}

        {!isLoading && artOgOmfang && (
          <div className={hasPvoComment ? 'w-1/2' : 'w-full'}>
            <ArtOgOmfangReadOnlyContent
              artOgOmfang={artOgOmfang}
              personkategorier={personkategorier}
              brukerAlleOpplysningstyper={brukerAlleOpplysningstyper}
            />
          </div>
        )}

        {/* sidepanel */}
        {hasPvoComment && relevantVurdering && (
          <div className='w-1/2'>
            <PvkSidePanelWrapper wide>
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
