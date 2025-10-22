'use client'

import { getPvkDokument } from '@/api/pvkDokument/pvkDokumentApi'
import {
  createPvoTilbakemelding,
  getPvoTilbakemeldingByPvkDokumentId,
  mapPvoTilbakemeldingToFormValue,
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
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { ICodelistProps } from '@/provider/kodeverk/kodeverkProvider'
import { AxiosError } from 'axios'
import { Form, Formik } from 'formik'
import { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react'
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
  activeStep,
  setActiveStep,
  setSelectedStep,
  codelistUtils,
}) => {
  const [submittedStatus, setSubmittedStatus] = useState<EPvoTilbakemeldingStatus>(
    EPvoTilbakemeldingStatus.UNDERARBEID
  )
  const [isAngreInnsending, setIsAngreInnsending] = useState<boolean>(false)
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false)
  const [pvoVurderingList, setPvoVurderlist] = useState<ICode[]>([])
  const [sucessSubmit, setSuccessSubmit] = useState<boolean>(false)
  const formRef: RefObject<any> = useRef(undefined)

  const submit = async (submittedValues: IPvoTilbakemelding): Promise<void> => {
    //backend vil oppdatere statusen til PVk dokument til 'SENDT_TIL_PVO', dersom statusen til PVO tilbakemelding = 'ikke påbegynt' eller 'avventer'
    //backend vil oppdatere statusen til PVk dokument til 'VURDERT_AV_PVO', dersom statusen til PVO tilbakemelding = 'FERDIG', 'utgår'
    //backend vil oppdatere statusen til PVk dokument til 'PVO_UNDERARBEID', dersom statusen til PVO tilbakemelding = 'Påbegynt', 'snart ferdig' eller 'til kontroll'

    let pvkStatus = ''

    await getPvkDokument(pvkDokument.id).then((response) => (pvkStatus = response.status))

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
              const updatedValues: IPvoTilbakemelding = {
                ...response,
                status: submittedStatus,
                sendtDato:
                  submittedStatus === EPvoTilbakemeldingStatus.FERDIG
                    ? new Date().toISOString()
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
              await updatePvoTilbakemelding(updatedValues).then((response: IPvoTilbakemelding) => {
                setPvoTilbakemelding(response)
                setSuccessSubmit(true)
              })
            }
          }
        })
        .catch(async (error: AxiosError) => {
          if (error.status === 404) {
            const createValue = mapPvoTilbakemeldingToFormValue({
              pvkDokumentId: pvkDokument.id,
              status: submittedStatus,
              sendtDato:
                submittedStatus === EPvoTilbakemeldingStatus.FERDIG ? new Date().toISOString() : '',
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

  useEffect(() => {
    setPvoVurderlist(
      codelistUtils
        .getCodes(EListName.PVO_VURDERING)
        .sort((a, b) => a.shortName.localeCompare(b.shortName)) as ICode[]
    )
  }, [])

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      onSubmit={submit}
      initialValues={mapPvoTilbakemeldingToFormValue(pvoTilbakemelding)}
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
              setFieldValue={setFieldValue}
              setSubmittedStatus={setSubmittedStatus}
              pvkDokument={pvkDokument}
              pvoTilbakemelding={pvoTilbakemelding}
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
