'use client'

import {
  getBehandlingensLivslopByEtterlevelseDokumentId,
  mapBehandlingensLivslopRequestToFormValue,
  mapBehandlingensLivslopToFormValue,
} from '@/api/behandlingensLivslop/behandlingensLivslopApi'
import BehandlingensLivslopReadOnlyContent from '@/components/behandlingensLivslop/content/behandlingensLivslopReadOnlyContent'
import BehandlingensLivsLopSidePanel from '@/components/behandlingensLivslop/sidePanel/BehandlingensLivsLopSidePanel'
import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import { ContentLayout } from '@/components/others/layout/content/content'
import PvoTilbakemeldingsHistorikk from '@/components/pvoTilbakemelding/common/tilbakemeldingsHistorikk/pvoTilbakemeldingsHistorikk'
import PvoTilbakemeldingReadOnly from '@/components/pvoTilbakemelding/readOnly/pvoTilbakemeldingReadOnly'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
  IVurdering,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { AxiosError } from 'axios'
import { FunctionComponent, useEffect, useState } from 'react'
import { PvkSidePanelWrapper } from '../../../common/pvkSidePanelWrapper'
import FormButtons from '../../../edit/formButtons'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  pvkDokument: IPvkDokument
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  pvoTilbakemelding?: IPvoTilbakemelding
  relevantVurdering?: IVurdering
}

export const BehandlingensLivslopReadOnlyView: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  pvkDokument,
  activeStep,
  setActiveStep,
  setSelectedStep,
  pvoTilbakemelding,
  relevantVurdering,
}) => {
  const [behandlingensLivslop, setBehandlingensLivslop] = useState<IBehandlingensLivslop>()
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      if (etterlevelseDokumentasjon && etterlevelseDokumentasjon.id) {
        setIsLoading(true)
        await getBehandlingensLivslopByEtterlevelseDokumentId(etterlevelseDokumentasjon.id)
          .then((response: IBehandlingensLivslop) => {
            setBehandlingensLivslop(response)
          })
          .catch((error: AxiosError) => {
            if (error.status === 404) {
              setBehandlingensLivslop(mapBehandlingensLivslopToFormValue({}))
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
      {isLoading && <CenteredLoader />}
      {!isLoading && behandlingensLivslop && (
        <ContentLayout>
          {pvkDokument && (
            <BehandlingensLivslopReadOnlyContent
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              behandlingensLivslop={mapBehandlingensLivslopRequestToFormValue(behandlingensLivslop)}
              noSidePanelContent
            />
          )}

          {/* Sidepanel */}
          <div>
            {pvoTilbakemelding &&
              pvoTilbakemelding.status === EPvoTilbakemeldingStatus.FERDIG &&
              relevantVurdering && (
                <PvkSidePanelWrapper>
                  {[undefined, null, ''].includes(pvkDokument.godkjentAvRisikoeierDato) && (
                    <PvoTilbakemeldingReadOnly
                      relevantVurdering={relevantVurdering}
                      tilbakemeldingsinnhold={relevantVurdering.behandlingenslivslop}
                      sentDate={relevantVurdering.sendtDato}
                    />
                  )}
                  {pvkDokument.antallInnsendingTilPvo >= 1 && (
                    <div className='mt-10'>
                      <PvoTilbakemeldingsHistorikk
                        pvkDokument={pvkDokument}
                        pvoTilbakemelding={pvoTilbakemelding}
                        fieldName='behandlingenslivslop'
                        relevantVurdering={relevantVurdering}
                        forPvo={false}
                      />
                    </div>
                  )}
                </PvkSidePanelWrapper>
              )}

            {(!pvoTilbakemelding ||
              (pvoTilbakemelding &&
                pvoTilbakemelding.status !== EPvoTilbakemeldingStatus.FERDIG)) && (
              // Don't remove this div. Sticky will not work without it.
              <div>
                <div className='pl-6 border-l border-[#071a3636] w-full max-w-lg sticky top-4'>
                  <div className='overflow-auto h-[90vh]'>
                    <BehandlingensLivsLopSidePanel
                      etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Slutt på sidepanel innhold*/}
        </ContentLayout>
      )}
      <FormButtons
        etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        setSelectedStep={setSelectedStep}
      />
    </div>
  )
}

export default BehandlingensLivslopReadOnlyView
