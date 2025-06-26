import { AxiosError } from 'axios'
import { Form, Formik } from 'formik'
import { FunctionComponent, useEffect, useState } from 'react'
import { getPvkDokument } from '../../api/PvkDokumentApi'
import {
  createPvoTilbakemelding,
  getPvoTilbakemeldingByPvkDokumentId,
  mapPvoTilbakemeldingToFormValue,
  updatePvoTilbakemelding,
} from '../../api/PvoApi'
import {
  EPvkDokumentStatus,
  EPvoTilbakemeldingStatus,
  IEtterlevelseDokumentasjon,
  IPvkDokument,
  IPvoTilbakemelding,
} from '../../constants'
import { EListName, ICode, ICodelistProps } from '../../services/Codelist'
import SendInnPvoViewFerdig from './SendInnPvoViewFerdig'
import SendInnPvoViewIkkeFerdig from './SendInnPvoViewIkkeFerdig'
import { sendInnCheck } from './edit/pvoFromSchema'

type TProps = {
  etterlevelseDokumentasjon: IEtterlevelseDokumentasjon
  pvkDokument: IPvkDokument
  updateTitleUrlAndStep: (step: number) => void
  personkategorier: string[]
  databehandlere: string[]
  pvoTilbakemelding: IPvoTilbakemelding
  activeStep: number
  setActiveStep: (step: number) => void
  setSelectedStep: (step: number) => void
  codelistUtils: ICodelistProps
}

export const SendInnPvoView: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  pvkDokument,
  pvoTilbakemelding,
  activeStep,
  setActiveStep,
  setSelectedStep,
  codelistUtils,
}) => {
  const [submittedStatus, setSubmittedStatus] = useState<EPvoTilbakemeldingStatus>(
    EPvoTilbakemeldingStatus.UNDERARBEID
  )
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false)
  const [pvoVurderingList, setPvoVurderlist] = useState<ICode[]>([])

  const submit = async (submittedValues: IPvoTilbakemelding): Promise<void> => {
    //backend vil oppdatere statusen til PVk dokument til 'SENDT_TIL_PVO', dersom statusen til PVO tilbakemelding = 'ikke påbegynt' eller 'avventer'
    //backend vil oppdatere statusen til PVk dokument til 'VURDERT_AV_PVO', dersom statusen til PVO tilbakemelding = 'FERDIG', 'utgår'
    //backend vil oppdatere statusen til PVk dokument til 'PVO_UNDERARBEID', dersom statusen til PVO tilbakemelding = 'Påbegynt', 'snart ferdig' eller 'til kontroll'

    let pvkStatus = ''

    await getPvkDokument(pvkDokument.id).then((response) => (pvkStatus = response.status))

    if (pvkStatus === EPvkDokumentStatus.UNDERARBEID) {
      setIsAlertModalOpen(true)
    } else {
      await getPvoTilbakemeldingByPvkDokumentId(pvkDokument.id)
        .then(async (response: IPvoTilbakemelding) => {
          if (response) {
            const updatedValues: IPvoTilbakemelding = {
              ...response,
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
            }
            await updatePvoTilbakemelding(updatedValues).then(() => window.location.reload())
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
            await createPvoTilbakemelding(createValue).then(() => window.location.reload())
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
    >
      {({ submitForm, setFieldValue }) => (
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
            />
          )}
        </Form>
      )}
    </Formik>
  )
}

export default SendInnPvoView
