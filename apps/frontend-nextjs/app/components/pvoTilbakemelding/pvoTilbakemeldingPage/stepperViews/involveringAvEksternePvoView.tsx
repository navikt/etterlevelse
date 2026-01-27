'use client'

import { getAuditByTableIdAndTimeStamp } from '@/api/audit/auditApi'
import InvolveringAvEksterneReadOnlyContent from '@/components/PVK/pvkDokumentPage/stepperViews/readOnlyViews/involveringAvEksterneReadOnlyContent'
import { ContentLayout } from '@/components/others/layout/content/content'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
  IVurdering,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { FunctionComponent, RefObject, useEffect, useState } from 'react'
import PvoSidePanelWrapper from '../../common/pvoSidePanelWrapper'
import PvoTilbakemeldingsHistorikk from '../../common/tilbakemeldingsHistorikk/pvoTilbakemeldingsHistorikk'
import PvoFormButtons from '../../form/pvoFormButtons'
import PvoTilbakemeldingForm from '../../form/pvoTilbakemeldingForm'
import PvoTilbakemeldingReadOnly from '../../readOnly/pvoTilbakemeldingReadOnly'

type TProps = {
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  personkategorier: string[]
  databehandlere: string[]
  pvkDokument: IPvkDokument
  pvoTilbakemelding: IPvoTilbakemelding
  setPvoTilbakemelding: (state: IPvoTilbakemelding) => void
  relevantVurdering: IVurdering
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  formRef: RefObject<any>
}

export const InvolveringAvEksternePvoView: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  personkategorier,
  databehandlere,
  pvkDokument,
  pvoTilbakemelding,
  setPvoTilbakemelding,
  relevantVurdering,
  activeStep,
  setActiveStep,
  setSelectedStep,
  formRef,
}) => {
  const [isChangesMadeSinceLastSubmission, setIsChangesMadeSinceLastSubmission] =
    useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      if (pvkDokument.antallInnsendingTilPvo > 1) {
        const previousSubmission = pvoTilbakemelding.vurderinger.find(
          (vurdering) =>
            vurdering.innsendingId === pvkDokument.antallInnsendingTilPvo - 1 &&
            vurdering.etterlevelseDokumentVersjon ===
              etterlevelseDokumentasjon.etterlevelseDokumentVersjon
        )
        if (previousSubmission && previousSubmission.sendtDato) {
          await getAuditByTableIdAndTimeStamp(pvkDokument.id, previousSubmission?.sendtDato).then(
            (previousPvkDokument) => {
              if (previousPvkDokument.length !== 0) {
                const previousData = (
                  previousPvkDokument[0].data as { pvkDokumentData?: IPvkDokument }
                )['pvkDokumentData']
                if (
                  previousData &&
                  (previousData.harInvolvertRepresentant !== pvkDokument.harInvolvertRepresentant ||
                    previousData.representantInvolveringsBeskrivelse !==
                      pvkDokument.representantInvolveringsBeskrivelse ||
                    previousData.harDatabehandlerRepresentantInvolvering !==
                      pvkDokument.harDatabehandlerRepresentantInvolvering ||
                    previousData.dataBehandlerRepresentantInvolveringBeskrivelse !==
                      pvkDokument.dataBehandlerRepresentantInvolveringBeskrivelse)
                ) {
                  setIsChangesMadeSinceLastSubmission(true)
                } else {
                  setIsChangesMadeSinceLastSubmission(false)
                }
              } else {
                setIsChangesMadeSinceLastSubmission(false)
              }
            }
          )
        } else {
          setIsChangesMadeSinceLastSubmission(false)
        }
      } else {
        setIsChangesMadeSinceLastSubmission(false)
      }
    })()
  }, [pvkDokument, pvoTilbakemelding])

  return (
    <div className='w-full'>
      <ContentLayout>
        <div className='flex gap-8'>
          <div className='w-1/2'>
            <InvolveringAvEksterneReadOnlyContent
              personkategorier={personkategorier}
              databehandlere={databehandlere}
              pvkDokument={pvkDokument}
              isChangesMadeSinceLastSubmission={isChangesMadeSinceLastSubmission}
            />
          </div>
          <div className='w-1/2'>
            <PvoSidePanelWrapper>
              {pvoTilbakemelding.status === EPvoTilbakemeldingStatus.FERDIG && (
                <PvoTilbakemeldingReadOnly
                  tilbakemeldingsinnhold={relevantVurdering.innvolveringAvEksterne}
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
                  fieldName='innvolveringAvEksterne'
                  initialValue={relevantVurdering.innvolveringAvEksterne}
                  formRef={formRef}
                />
              )}

              {pvkDokument.antallInnsendingTilPvo > 1 && (
                <div className='mt-10'>
                  <PvoTilbakemeldingsHistorikk
                    pvoTilbakemelding={pvoTilbakemelding}
                    fieldName='innvolveringAvEksterne'
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

export default InvolveringAvEksternePvoView
