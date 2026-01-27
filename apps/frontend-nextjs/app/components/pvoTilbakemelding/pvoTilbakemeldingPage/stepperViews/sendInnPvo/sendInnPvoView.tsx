'use client'

import { getPvkDokument } from '@/api/pvkDokument/pvkDokumentApi'
import {
  createPvoTilbakemelding,
  getPvoTilbakemeldingByPvkDokumentId,
  mapPvoTilbakemeldingToFormValue,
  mapVurderingToFormValue,
  updatePvoTilbakemelding,
} from '@/api/pvoTilbakemelding/pvoTilbakemeldingApi'
import { sendInnCheck } from '@/components/pvoTilbakemelding/form/pvoSchema'
import { IEtterlevelseDokumentasjon } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import {
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { EListName, ICode } from '@/constants/kodeverk/kodeverkConstants'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
  IVurdering,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { ICodelistProps } from '@/provider/kodeverk/kodeverkProvider'
import { UserContext } from '@/provider/user/userProvider'
import { createNewPvoVurderning } from '@/util/pvoTilbakemelding/pvoTilbakemeldingUtils'
import { AxiosError } from 'axios'
import { Form, Formik } from 'formik'
import { FunctionComponent, RefObject, useContext, useMemo, useRef, useState } from 'react'
import SendInnPvoViewFerdig from './sendInnPvoViewFerdig'
import SendInnPvoViewIkkeFerdig from './sendInnPvoViewIkkeFerdig'

type TProps = {
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  pvkDokument: IPvkDokument
  updateTitleUrlAndStep: (step: number) => void
  personkategorier: string[]
  databehandlere: string[]
  pvoTilbakemelding: IPvoTilbakemelding
  setPvoTilbakemelding: (state: IPvoTilbakemelding) => void
  relevantVurdering: IVurdering
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  codelistUtils: ICodelistProps
}

export const SendInnPvoView: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  pvkDokument,
  pvoTilbakemelding,
  setPvoTilbakemelding,
  relevantVurdering,
  activeStep,
  setActiveStep,
  setSelectedStep,
  codelistUtils,
}) => {
  const user = useContext(UserContext)
  const [submittedStatus, setSubmittedStatus] = useState<EPvoTilbakemeldingStatus>(
    EPvoTilbakemeldingStatus.UNDERARBEID
  )
  const [isAngreInnsending, setIsAngreInnsending] = useState<boolean>(false)
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false)
  const pvoVurderingList = useMemo(() => {
    return codelistUtils
      .getCodes(EListName.PVO_VURDERING)
      .sort((a, b) => a.shortName.localeCompare(b.shortName)) as ICode[]
  }, [codelistUtils])
  const [sucessSubmit, setSuccessSubmit] = useState<boolean>(false)
  const formRef: RefObject<any> = useRef(undefined)

  const submit = async (submittedValues: IVurdering): Promise<void> => {
    //backend vil oppdatere statusen til PVk dokument til 'SENDT_TIL_PVO', dersom statusen til PVO tilbakemelding = 'ikke påbegynt' eller 'avventer'
    //backend vil oppdatere statusen til PVk dokument til 'VURDERT_AV_PVO', dersom statusen til PVO tilbakemelding = 'FERDIG', 'utgår'
    //backend vil oppdatere statusen til PVk dokument til 'PVO_UNDERARBEID', dersom statusen til PVO tilbakemelding = 'Påbegynt', 'snart ferdig' eller 'til kontroll'

    let pvkStatus = ''
    let antallInnsendingTilPvo = 0

    await getPvkDokument(pvkDokument.id).then((response) => {
      pvkStatus = response.status

      antallInnsendingTilPvo = response.antallInnsendingTilPvo
    })

    if (
      [
        EPvkDokumentStatus.UNDERARBEID,
        EPvkDokumentStatus.GODKJENT_AV_RISIKOEIER,
        EPvkDokumentStatus.TRENGER_GODKJENNING,
      ].includes(pvkStatus as EPvkDokumentStatus)
    ) {
      setIsAlertModalOpen(true)
    } else {
      await getPvoTilbakemeldingByPvkDokumentId(pvkDokument.id)
        .then(async (response: IPvoTilbakemelding) => {
          if (response) {
            if (response.status === EPvoTilbakemeldingStatus.FERDIG && !isAngreInnsending) {
              setIsAlertModalOpen(true)
            } else {
              if (
                !response.vurderinger.find(
                  (vurdering) =>
                    vurdering.innsendingId === antallInnsendingTilPvo &&
                    vurdering.etterlevelseDokumentVersjon ===
                      etterlevelseDokumentasjon.etterlevelseDokumentVersjon
                )
              ) {
                response.vurderinger.push(
                  createNewPvoVurderning(
                    antallInnsendingTilPvo,
                    etterlevelseDokumentasjon.etterlevelseDokumentVersjon
                  )
                )
              }
              const updatedValues: IPvoTilbakemelding = {
                ...response,
                status: submittedStatus,
                vurderinger: response.vurderinger.map((vurdering) => {
                  if (
                    vurdering.innsendingId === pvkDokument.antallInnsendingTilPvo &&
                    vurdering.etterlevelseDokumentVersjon ===
                      etterlevelseDokumentasjon.etterlevelseDokumentVersjon
                  ) {
                    return {
                      ...vurdering,
                      internDiskusjon: submittedValues.internDiskusjon,
                      sendtDato:
                        submittedStatus === EPvoTilbakemeldingStatus.FERDIG
                          ? new Date().toISOString()
                          : '',
                      sendtAv:
                        submittedStatus === EPvoTilbakemeldingStatus.FERDIG
                          ? user.getIdent() + ' - ' + user.getName()
                          : '',
                      merknadTilEtterleverEllerRisikoeier:
                        submittedValues.merknadTilEtterleverEllerRisikoeier,
                      arbeidGarVidere: submittedValues.arbeidGarVidere,
                      arbeidGarVidereBegrunnelse: submittedValues.arbeidGarVidereBegrunnelse,
                      behovForForhandskonsultasjon: submittedValues.behovForForhandskonsultasjon,
                      behovForForhandskonsultasjonBegrunnelse:
                        submittedValues.behovForForhandskonsultasjonBegrunnelse,
                      pvoVurdering: submittedValues.pvoVurdering,
                      pvoFolgeOppEndringer: submittedValues.pvoFolgeOppEndringer,
                      vilFaPvkIRetur: submittedValues.vilFaPvkIRetur,
                    }
                  } else {
                    return vurdering
                  }
                }),
              }
              await updatePvoTilbakemelding(updatedValues).then((response: IPvoTilbakemelding) => {
                setPvoTilbakemelding(response)
                setSuccessSubmit(true)
              })
            }
          }
        })
        .catch(async (error: AxiosError) => {
          if (error.status === 404) {
            const newVurdering = createNewPvoVurderning(
              pvkDokument.antallInnsendingTilPvo,
              etterlevelseDokumentasjon.etterlevelseDokumentVersjon
            )
            const createValue = mapPvoTilbakemeldingToFormValue({
              pvkDokumentId: pvkDokument.id,
              status: submittedStatus,
              vurderinger: [
                {
                  ...newVurdering,
                  internDiskusjon: submittedValues.internDiskusjon,
                  sendtDato:
                    submittedStatus === EPvoTilbakemeldingStatus.FERDIG
                      ? new Date().toISOString()
                      : '',
                  sendtAv:
                    submittedStatus === EPvoTilbakemeldingStatus.FERDIG
                      ? user.getIdent() + ' - ' + user.getName()
                      : '',
                  merknadTilEtterleverEllerRisikoeier:
                    submittedValues.merknadTilEtterleverEllerRisikoeier,
                  arbeidGarVidere: submittedValues.arbeidGarVidere,
                  arbeidGarVidereBegrunnelse: submittedValues.arbeidGarVidereBegrunnelse,
                  behovForForhandskonsultasjon: submittedValues.behovForForhandskonsultasjon,
                  behovForForhandskonsultasjonBegrunnelse:
                    submittedValues.behovForForhandskonsultasjonBegrunnelse,
                  pvoVurdering: submittedValues.pvoVurdering,
                  pvoFolgeOppEndringer: submittedValues.pvoFolgeOppEndringer,
                  vilFaPvkIRetur: submittedValues.vilFaPvkIRetur,
                },
              ],
            })
            await createPvoTilbakemelding(createValue).then((response: IPvoTilbakemelding) => {
              setPvoTilbakemelding(response)
              setSuccessSubmit(true)
            })
          } else {
            console.debug(error)
          }
        })
    }
  }

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      onSubmit={submit}
      initialValues={mapVurderingToFormValue(relevantVurdering)}
      validationSchema={sendInnCheck}
      innerRef={formRef}
    >
      {({ submitForm, setFieldValue, errors }) => (
        <Form>
          {pvoTilbakemelding.status !== EPvoTilbakemeldingStatus.FERDIG && (
            <SendInnPvoViewIkkeFerdig
              submitForm={submitForm}
              setFieldValue={setFieldValue}
              setSubmittedStatus={setSubmittedStatus}
              pvkDokument={pvkDokument}
              pvoTilbakemelding={pvoTilbakemelding}
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              activeStep={activeStep}
              setSelectedStep={setSelectedStep}
              setActiveStep={setActiveStep}
              isAlertModalOpen={isAlertModalOpen}
              setIsAlertModalOpen={setIsAlertModalOpen}
              pvoVurderingList={pvoVurderingList}
              errors={errors}
              formRef={formRef}
              sucessSubmit={sucessSubmit}
              setSuccessSubmit={setSuccessSubmit}
            />
          )}
          {pvoTilbakemelding.status === EPvoTilbakemeldingStatus.FERDIG && (
            <SendInnPvoViewFerdig
              submitForm={submitForm}
              setSubmittedStatus={setSubmittedStatus}
              pvkDokument={pvkDokument}
              pvoTilbakemelding={pvoTilbakemelding}
              relevantVurdering={relevantVurdering}
              activeStep={activeStep}
              setSelectedStep={setSelectedStep}
              setActiveStep={setActiveStep}
              isAlertModalOpen={isAlertModalOpen}
              setIsAlertModalOpen={setIsAlertModalOpen}
              pvoVurderingList={pvoVurderingList}
              setIsAngreInnsending={setIsAngreInnsending}
              sucessSubmit={sucessSubmit}
              setSuccessSubmit={setSuccessSubmit}
            />
          )}
        </Form>
      )}
    </Formik>
  )
}

export default SendInnPvoView
