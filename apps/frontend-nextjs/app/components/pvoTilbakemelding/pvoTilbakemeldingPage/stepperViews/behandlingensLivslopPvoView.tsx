'use client'

import {
  getBehandlingensLivslopByEtterlevelseDokumentId,
  mapBehandlingensLivslopRequestToFormValue,
} from '@/api/behandlingensLivslop/behandlingensLivslopApi'
import BehandlingensLivslopReadOnlyContent from '@/components/behandlingensLivslop/content/behandlingensLivslopReadOnlyContent'
import { ContentLayout } from '@/components/others/layout/content/content'
import { IBehandlingensLivslopRequest } from '@/constants/behandlingensLivslop/behandlingensLivslop'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
  IVurdering,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { Loader } from '@navikt/ds-react'
import { FunctionComponent, RefObject, useEffect, useState } from 'react'
import PvoSidePanelWrapper from '../../common/pvoSidePanelWrapper'
import TilbakemeldingsHistorikk from '../../common/tilbakemeldingsHistorikk'
import PvoFormButtons from '../../form/pvoFormButtons'
import PvoTilbakemeldingForm from '../../form/pvoTilbakemeldingForm'
import PvoTilbakemeldingReadOnly from '../../readOnly/pvoTilbakemeldingReadOnly'

type TProps = {
  pvoTilbakemelding: IPvoTilbakemelding
  pvkDokument: IPvkDokument
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  relevantVurdering: IVurdering
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
}

export const BehandlingensLivslopPvoView: FunctionComponent<TProps> = ({
  pvoTilbakemelding,
  pvkDokument,
  etterlevelseDokumentasjon,
  relevantVurdering,
  activeStep,
  setActiveStep,
  setSelectedStep,
  formRef,
}) => {
  const [behandlingensLivslop, setBehandlingsLivslop] = useState<IBehandlingensLivslopRequest>(
    mapBehandlingensLivslopRequestToFormValue({})
  )

  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      if (etterlevelseDokumentasjon.id) {
        setIsLoading(true)
        await getBehandlingensLivslopByEtterlevelseDokumentId(etterlevelseDokumentasjon.id)
          .then((response) => {
            const behandlingenslivslop = mapBehandlingensLivslopRequestToFormValue(response)
            setBehandlingsLivslop(behandlingenslivslop)
          })
          .finally(() => setIsLoading(false))
      }
    })()
  }, [etterlevelseDokumentasjon])

  return (
    <div className='flex justify-center'>
      {isLoading && (
        <div className='flex w-full justify-center items-center mt-5'>
          <Loader size='3xlarge' className='flex justify-self-center' />
        </div>
      )}
      {!isLoading && (
        <div className='w-full'>
          <ContentLayout>
            <div className='flex gap-8 w-full'>
              <div className='w-1/2'>
                <BehandlingensLivslopReadOnlyContent
                  etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                  behandlingensLivslop={behandlingensLivslop}
                />
              </div>
              <div className='w-1/2'>
                <PvoSidePanelWrapper>
                  {pvoTilbakemelding.status === EPvoTilbakemeldingStatus.FERDIG && (
                    <PvoTilbakemeldingReadOnly
                      tilbakemeldingsinnhold={relevantVurdering.behandlingenslivslop}
                      sentDate={relevantVurdering.sendtDato}
                      forPvo={true}
                    />
                  )}
                  {pvoTilbakemelding.status !== EPvoTilbakemeldingStatus.FERDIG && (
                    <PvoTilbakemeldingForm
                      pvkDokumentId={pvkDokument.id}
                      innsendingId={pvkDokument.antallInnsendingTilPvo}
                      fieldName='behandlingenslivslop'
                      initialValue={relevantVurdering.behandlingenslivslop}
                      formRef={formRef}
                    />
                  )}

                  {pvoTilbakemelding.vurderinger.length > 1 && (
                    <div className='mt-10'>
                      <TilbakemeldingsHistorikk
                        pvoTilbakemelding={pvoTilbakemelding}
                        fieldName='behandlingenslivslop'
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
      )}
    </div>
  )
}
export default BehandlingensLivslopPvoView
