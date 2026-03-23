import { etterlevelseDokumentasjonMapToFormVal } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import {
  EEtterlevelseDokumentasjonStatus,
  IEtterlevelseDokumentasjon,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { Alert, Button, ErrorSummary } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import _ from 'lodash'
import { Dispatch, FunctionComponent, RefObject, SetStateAction, useRef } from 'react'
import { sendTilRisikoGodkjenningSchema } from '../sendTilrisikoeierGodkjenningSchema'

type TProp = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  saveSuccessful: boolean
  setSaveSuccessful: Dispatch<SetStateAction<boolean>>
  submitAlert: string
  setSubmitAlert: Dispatch<SetStateAction<string>>
  submit: (submitValues: IEtterlevelseDokumentasjon, skipSaveAlert?: boolean) => Promise<void>
  trekkInnsendingSuccessful: boolean
  setTrekkInnsendingSuccessful: Dispatch<SetStateAction<boolean>>
  pvkBlocksSending: boolean
}

const SendTilRisikoeierGodkjenningUnderArbeid: FunctionComponent<TProp> = ({
  etterlevelseDokumentasjon,
  saveSuccessful,
  setSaveSuccessful,
  submitAlert,
  setSubmitAlert,
  submit,
  trekkInnsendingSuccessful,
  setTrekkInnsendingSuccessful,
  pvkBlocksSending,
}) => {
  const formRef: RefObject<any> = useRef(undefined)
  const errorSummaryRef = useRef<HTMLDivElement>(null)

  return (
    <Formik
      validateOnChange={false}
      validateOnBlur={false}
      initialValues={etterlevelseDokumentasjonMapToFormVal(etterlevelseDokumentasjon)}
      onSubmit={(values) => submit(values)}
      validationSchema={sendTilRisikoGodkjenningSchema()}
      innerRef={formRef}
    >
      {({ submitForm, setFieldValue, errors }) => (
        <Form>
          <div className='mt-3 max-w-[75ch]'>
            <TextAreaField
              rows={5}
              height='12.5rem'
              noPlaceholder
              label='Oppsummer for risikoeier hvorfor det er aktuelt med godkjenning'
              name='meldingEtterlevelerTilRisikoeier'
              markdown
            />
          </div>

          <div>
            <div className='my-10 max-w-[75ch]'>
              <Alert variant='info' inline>
                Når dere sender etterlevelsen til godkjenning, vil hele dokumentasjonen låses og
                ikke kunne redigeres. Etter at risikoeier har godkjent, vil dere kunne redigere på
                nytt.
              </Alert>
            </div>

            <div className='my-10 max-w-[75ch]'>
              {!_.isEmpty(errors) && (
                <ErrorSummary
                  className='mt-3'
                  ref={errorSummaryRef}
                  heading='Før dere sender inn, må dere fylle ut følgende felt'
                >
                  <ErrorSummary.Item href={'#meldingEtterlevelerTilRisikoeier'}>
                    Oppsummere for risikoeier hvorfor det er aktuelt med godkjenning
                  </ErrorSummary.Item>
                </ErrorSummary>
              )}
            </div>

            {saveSuccessful && (
              <div className='my-5 max-w-[75ch]'>
                <Alert
                  size='small'
                  variant='success'
                  closeButton
                  onClose={() => setSaveSuccessful(false)}
                >
                  Lagring vellykket
                </Alert>
              </div>
            )}

            {trekkInnsendingSuccessful && (
              <div className='my-5 max-w-[75ch]'>
                <Alert
                  size='small'
                  variant='success'
                  closeButton
                  onClose={() => setTrekkInnsendingSuccessful(false)}
                >
                  Innsending er trukket
                </Alert>
              </div>
            )}

            {submitAlert !== '' && (
              <Alert
                variant='error'
                className='my-5 max-w-[75ch]'
                closeButton={true}
                onClose={() => setSubmitAlert('')}
              >
                {submitAlert}
              </Alert>
            )}

            <div className='flex items-center mt-5 gap-2'>
              <Button
                type='button'
                variant='secondary'
                onClick={async () => {
                  await setFieldValue('status', EEtterlevelseDokumentasjonStatus.UNDER_ARBEID)
                  setTrekkInnsendingSuccessful(false)
                  await submitForm()
                }}
              >
                Lagre og fortsett senere
              </Button>

              {etterlevelseDokumentasjon.risikoeiere.length > 0 && !pvkBlocksSending && (
                <Button
                  type='button'
                  variant='primary'
                  onClick={async () => {
                    await setFieldValue(
                      'status',
                      EEtterlevelseDokumentasjonStatus.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER
                    )

                    await submitForm()
                  }}
                >
                  Lagre og send til godkjenning
                </Button>
              )}
            </div>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default SendTilRisikoeierGodkjenningUnderArbeid
