import ExportPvkModal from '@/components/PVK/export/exportPvkModal'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import {
  EPvkDokumentStatus,
  IMeldingTilPvo,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { Alert, Button, Loader } from '@navikt/ds-react'
import { Field, FieldProps, FormikErrors } from 'formik'
import { FunctionComponent, ReactNode, RefObject } from 'react'
import LagreOgFortsettSenereButton from '../lagreOgFortsettSenereButton'

type TProps = {
  pvkDokument: IPvkDokument
  errorSummaryComponent: ReactNode
  isLoading: boolean
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<IPvkDokument>>
  submitForm: () => Promise<void>
  initialStatus: EPvkDokumentStatus
  errorSummaryRef: RefObject<HTMLDivElement | null>
  savedAlert: ReactNode
}

export const UnderArbeidFields: FunctionComponent<TProps> = ({
  pvkDokument,
  errorSummaryComponent,
  isLoading,
  setFieldValue,
  submitForm,
  initialStatus,
  errorSummaryRef,
  savedAlert,
}) => {
  const relevantMeldingTilPvo: IMeldingTilPvo[] = pvkDokument.meldingerTilPvo.filter(
    (melding) =>
      melding.innsendingId === 1 &&
      melding.etterlevelseDokumentVersjon === pvkDokument.currentEtterlevelseDokumentVersjon
  )

  const index = pvkDokument.meldingerTilPvo.findIndex(
    (melding: IMeldingTilPvo) =>
      melding.innsendingId === 1 &&
      melding.etterlevelseDokumentVersjon === pvkDokument.currentEtterlevelseDokumentVersjon
  )

  return (
    <Field>
      {(fieldProps: FieldProps) => (
        <div className='w-full max-w-[75ch]'>
          <div className='mt-5 mb-3'>
            <TextAreaField
              height='150px'
              noPlaceholder
              label='Er det noe annet dere ønsker å formidle til Personvernombudet? (valgfritt)'
              name={`meldingerTilPvo[${index}].merknadTilPvo`}
              markdown
            />

            <Alert variant='info' inline className='my-5'>
              Når dere sender inn PVK, vil hele dokumentasjonen, inkludert
              etterlevelsesdokumentasjon ved PVK-relaterte krav, låses og ikke kunne redigeres.
              Dette innholdet forbli låst enn så lenge saken ligger hos Personvernombudet.
            </Alert>

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
                <Loader size='2xlarge' title='lagrer endringer' />
              </div>
            )}

            <div>{!fieldProps.form.dirty && savedAlert}</div>
          </div>

          <div className='mt-5 flex gap-2 items-center'>
            <LagreOgFortsettSenereButton
              setFieldValue={setFieldValue}
              submitForm={submitForm}
              initialStatus={initialStatus}
              resetForm={() => fieldProps.form.resetForm({ values: fieldProps.form.values })}
            />

            <Button
              type='button'
              onClick={async () => {
                await setFieldValue('status', EPvkDokumentStatus.SENDT_TIL_PVO)
                await setFieldValue(
                  'antallInnsendingTilPvo',
                  pvkDokument.antallInnsendingTilPvo + 1
                )
                errorSummaryRef.current?.focus()
                await submitForm()
              }}
            >
              Lagre og send til Personvernombudet
            </Button>
          </div>

          <div className='mt-5 flex gap-2 items-center'>
            <ExportPvkModal etterlevelseDokumentasjonId={pvkDokument.etterlevelseDokumentId} />
          </div>
        </div>
      )}
    </Field>
  )
}
export default UnderArbeidFields
