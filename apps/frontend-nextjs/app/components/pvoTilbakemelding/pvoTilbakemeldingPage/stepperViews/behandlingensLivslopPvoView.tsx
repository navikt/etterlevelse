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
import moment from 'moment'
import { FunctionComponent, RefObject, useEffect, useMemo, useState } from 'react'
import PvoSidePanelWrapper from '../../common/pvoSidePanelWrapper'
import PvoTilbakemeldingsHistorikk from '../../common/tilbakemeldingsHistorikk/pvoTilbakemeldingsHistorikk'
import PvoFormButtons from '../../form/pvoFormButtons'
import PvoTilbakemeldingForm from '../../form/pvoTilbakemeldingForm'
import PvoTilbakemeldingReadOnly from '../../readOnly/pvoTilbakemeldingReadOnly'

type TProps = {
  pvoTilbakemelding: IPvoTilbakemelding
  setPvoTilbakemelding: (state: IPvoTilbakemelding) => void
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
  setPvoTilbakemelding,
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
        moment(behandlingensLivslop.changeStamp.lastModifiedDate).isAfter(
          previousSubmission?.sendtDato
        )
      ) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }, [behandlingensLivslop, pvkDokument, pvoTilbakemelding])

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
                  isChangesMadeSinceLastSubmission={isChangesMadeSinceLastSubmission}
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
                      etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                      setPvoTilbakemelding={setPvoTilbakemelding}
                      pvkDokumentId={pvkDokument.id}
                      innsendingId={pvkDokument.antallInnsendingTilPvo}
                      fieldName='behandlingenslivslop'
                      initialValue={relevantVurdering.behandlingenslivslop}
                      formRef={formRef}
                    />
                  )}

                  {pvkDokument.antallInnsendingTilPvo > 1 && (
                    <div className='mt-10'>
                      <PvoTilbakemeldingsHistorikk
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
