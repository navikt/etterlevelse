'use client'

import CopyAndExportButtons from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/copyAndExportButtons'
import LagreOgFortsettSenereButton from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/lagreOgFortsettSenereButton'
import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import {
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { ICode } from '@/constants/kodeverk/kodeverkConstants'
import { IPvoTilbakemelding } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { pvkDokumentStatusToText } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { Alert, Button } from '@navikt/ds-react'
import { Field, FieldProps, FormikErrors } from 'formik'
import { FunctionComponent, ReactNode, useMemo } from 'react'
import TilbakemeldingsHistorikk from './readOnly/TilbakemeldingsHistorikk'

type TProps = {
  pvkDokument: IPvkDokument
  pvoTilbakemelding: IPvoTilbakemelding
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<IPvkDokument>>
  submitForm: () => Promise<void>
  initialStatus: EPvkDokumentStatus
  isLoading: boolean
  errorSummaryComponent: ReactNode
  savedAlert: ReactNode
  pvoVurderingList: ICode[]
  userHasAccess: boolean
}

export const VurdertAvPvoOgTrengerMerArbeidFields: FunctionComponent<TProps> = ({
  pvkDokument,
  pvoTilbakemelding,
  setFieldValue,
  submitForm,
  initialStatus,
  isLoading,
  errorSummaryComponent,
  pvoVurderingList,
  savedAlert,
  userHasAccess,
}) => {
  const relevantMeldingTilPvo = pvkDokument.meldingerTilPvo.filter(
    (melding) =>
      melding.innsendingId === pvkDokument.antallInnsendingTilPvo + 1 &&
      melding.etterlevelseDokumentVersjon === pvkDokument.currentEtterlevelseDokumentVersjon
  )

  const relevantIndex = useMemo(() => {
    if (relevantMeldingTilPvo.length === 0) {
      return pvkDokument.meldingerTilPvo.length
    } else {
      return pvkDokument.meldingerTilPvo.findIndex(
        (melding) =>
          melding.innsendingId === pvkDokument.antallInnsendingTilPvo + 1 &&
          melding.etterlevelseDokumentVersjon === pvkDokument.currentEtterlevelseDokumentVersjon
      )
    }
  }, [pvkDokument])

  return (
    <Field>
      {(fieldProps: FieldProps) => (
        <div>
          <div className='flex justify-center w-full'>
            <div className='w-full max-w-[75ch]'>
              <TilbakemeldingsHistorikk
                antallInnsendingTilPvo={pvkDokument.antallInnsendingTilPvo}
                meldingerTilPvo={pvkDokument.meldingerTilPvo}
                vurderinger={pvoTilbakemelding.vurderinger}
                pvoVurderingList={pvoVurderingList}
                etterlevelseDokumentVersjon={pvkDokument.currentEtterlevelseDokumentVersjon}
                defaultFirstOpen
              />

              {userHasAccess && (
                <div className='mt-8 mb-3'>
                  <TextAreaField
                    height='150px'
                    noPlaceholder
                    label='Er det noe annet dere ønsker å formidle til Personvernombudet? (valgfritt)'
                    name={`meldingerTilPvo[${relevantIndex}].merknadTilPvo`}
                    markdown
                  />
                </div>
              )}

              {relevantMeldingTilPvo.length !== 0 &&
                !['', null].includes(relevantMeldingTilPvo[0].sendtTilPvoDato) && (
                  <Alert variant='info' className='my-5'>
                    Innsending trukket <br />
                    Etter at dere blir ferdig med endringer, må dere sende inn på nytt. PVK-en blir
                    deretter behandlet som en ny innsending
                  </Alert>
                )}

              {errorSummaryComponent}

              {isLoading && (
                <div className='flex justify-center items-center w-full'>
                  <CenteredLoader />
                </div>
              )}

              <div>
                <Alert variant='info' className='my-5 '>
                  Status: {pvkDokumentStatusToText(pvkDokument.status)}
                </Alert>
              </div>

              <div>{!fieldProps.form.dirty && savedAlert}</div>
            </div>
          </div>

          {userHasAccess && (
            <div className='mt-5 flex gap-2 items-center'>
              <LagreOgFortsettSenereButton
                setFieldValue={setFieldValue}
                submitForm={submitForm}
                initialStatus={initialStatus}
                resetForm={() => fieldProps.form.resetForm({ values: fieldProps.form.values })}
              />

              <Button
                type='button'
                variant='primary'
                onClick={async () => {
                  await setFieldValue('status', EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING)
                  await setFieldValue(
                    'antallInnsendingTilPvo',
                    pvkDokument.antallInnsendingTilPvo + 1
                  )
                  await submitForm()
                }}
              >
                Lagre og send tilbake til PVO
              </Button>
            </div>
          )}

          <CopyAndExportButtons etterlevelseDokumentasjonId={pvkDokument.etterlevelseDokumentId} />
        </div>
      )}
    </Field>
  )
}

export default VurdertAvPvoOgTrengerMerArbeidFields
