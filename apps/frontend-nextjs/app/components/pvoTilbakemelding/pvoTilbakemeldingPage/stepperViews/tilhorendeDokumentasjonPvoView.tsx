import { getAuditByTableIdAndTimeStamp } from '@/api/audit/auditApi'
import { TilhorendeDokumentasjonContent } from '@/components/PVK/pvkDokumentPage/stepperViews/tilhorendeDokumentasjon/tilhorendeDokumentasjonContent'
import { ContentLayout } from '@/components/others/layout/content/content'
import { IPageResponse } from '@/constants/commonConstants'
import {
  IEtterlevelseDokumentasjon,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
  IVurdering,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { FunctionComponent, RefObject, useEffect, useState } from 'react'
import PvoSidePanelWrapper from '../../common/pvoSidePanelWrapper'
import PvoTilhorendeDokTilbakemeldingsHistorikk from '../../common/tilbakemeldingsHistorikk/pvoTilhorendeDokTilbakemeldingsHistorikk'
import PvoFormButtons from '../../form/pvoFormButtons'
import TilhorendeDokumentasjonPvoTilbakemeldingForm from '../../form/tilhorendeDokumentasjonPvoTilbakemeldingForm'
import TilhorendeDokumentasjonTilbakemeldingReadOnly from '../../readOnly/tilhorendeDokumentasjonTilbakemeldingReadOnly'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  pvkDokument: IPvkDokument
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
  pvoTilbakemelding: IPvoTilbakemelding
  setPvoTilbakemelding: (state: IPvoTilbakemelding) => void
  relevantVurdering: IVurdering
}

export const TilhorendeDokumentasjonPvoView: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  pvkDokument,
  activeStep,
  setActiveStep,
  setSelectedStep,
  formRef,
  pvkKrav,
  isPvkKravLoading,
  pvoTilbakemelding,
  setPvoTilbakemelding,
  relevantVurdering,
}) => {
  const [isChangesMadeSinceLastSubmission, setIsChangesMadeSinceLastSubmission] =
    useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      if (pvkDokument.antallInnsendingTilPvo > 1) {
        const previousSubmission = pvoTilbakemelding.vurderinger.find(
          (vurdering) => vurdering.innsendingId === pvkDokument.antallInnsendingTilPvo - 1
        )
        if (previousSubmission && previousSubmission.sendtDato) {
          await getAuditByTableIdAndTimeStamp(
            etterlevelseDokumentasjon.id,
            previousSubmission?.sendtDato
          ).then((previousEtterlevelseDokument) => {
            if (previousEtterlevelseDokument.length !== 0) {
              console.log(previousEtterlevelseDokument)
              const previousData = (
                previousEtterlevelseDokument[0].data as {
                  etterlevelseDokumentasjonData?: IEtterlevelseDokumentasjon
                }
              )['etterlevelseDokumentasjonData']
              if (
                previousData &&
                (previousData.behandlingIds !== etterlevelseDokumentasjon.behandlingIds ||
                  previousData.risikovurderinger !== etterlevelseDokumentasjon.risikovurderinger)
              ) {
                setIsChangesMadeSinceLastSubmission(true)
              } else {
                setIsChangesMadeSinceLastSubmission(false)
              }
            } else {
              setIsChangesMadeSinceLastSubmission(false)
            }
          })
        } else {
          setIsChangesMadeSinceLastSubmission(false)
        }
      } else {
        setIsChangesMadeSinceLastSubmission(false)
      }
    })()
  }, [etterlevelseDokumentasjon, pvkDokument, pvoTilbakemelding])

  return (
    <div className='w-full'>
      <ContentLayout>
        <div className='flex gap-8 w-full'>
          <div className='w-1/2'>
            <TilhorendeDokumentasjonContent
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              pvkKrav={pvkKrav}
              isPvkKravLoading={isPvkKravLoading}
              isChangesMadeSinceLastSubmission={isChangesMadeSinceLastSubmission}
            />
          </div>
          <div className='w-1/2'>
            <PvoSidePanelWrapper>
              {pvoTilbakemelding.status !== EPvoTilbakemeldingStatus.FERDIG && (
                <TilhorendeDokumentasjonPvoTilbakemeldingForm
                  etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                  setPvoTilbakemelding={setPvoTilbakemelding}
                  pvkDokumentId={pvkDokument.id}
                  innsendingId={pvkDokument.antallInnsendingTilPvo}
                  initialValue={relevantVurdering.tilhorendeDokumentasjon}
                  formRef={formRef}
                />
              )}

              {pvoTilbakemelding.status === EPvoTilbakemeldingStatus.FERDIG && (
                <TilhorendeDokumentasjonTilbakemeldingReadOnly
                  tilbakemeldingsinnhold={relevantVurdering.tilhorendeDokumentasjon}
                  sentDate={relevantVurdering.sendtDato}
                  forPvo={true}
                />
              )}

              {pvkDokument.antallInnsendingTilPvo > 1 && (
                <div className='mt-10'>
                  <PvoTilhorendeDokTilbakemeldingsHistorikk
                    pvoTilbakemelding={pvoTilbakemelding}
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
export default TilhorendeDokumentasjonPvoView
