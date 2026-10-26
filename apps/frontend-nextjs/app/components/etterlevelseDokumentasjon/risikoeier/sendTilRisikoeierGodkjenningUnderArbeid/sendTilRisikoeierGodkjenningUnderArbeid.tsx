import { Alert, Button, ErrorSummary, LocalAlert } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import _ from 'lodash'
import {
  Dispatch,
  FunctionComponent,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react'
import { etterlevelseDokumentasjonMapToFormVal } from '@/api/etterlevelseDokumentasjon/etterlevelseDokumentasjonApi'
import { getMyP360User } from '@/api/p360/p360Api'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import P360IngenBrukerAlert from '@/components/p360/p360IngenBrukerAlert'
import {
  EEtterlevelseDokumentasjonStatus,
  IEtterlevelseDokumentasjon,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { env } from '@/util/env/env'
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
  const [hasP360User, setHasP360User] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      await getMyP360User().then((response) => {
        if (response.Successful && response.Users.length !== 0 && response.Users[0].IsActive) {
          setHasP360User(true)
        } else {
          setHasP360User(false)
        }
      })
    })()
  }, [])

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
                <LocalAlert status='success' size='small'>
                  <LocalAlert.Header>
                    <LocalAlert.Title>Lagring vellykket</LocalAlert.Title>
                    <LocalAlert.CloseButton onClick={() => setSaveSuccessful(false)} />
                  </LocalAlert.Header>
                </LocalAlert>
              </div>
            )}

            {trekkInnsendingSuccessful && (
              <div className='my-5 max-w-[75ch]'>
                <LocalAlert status='success' size='small'>
                  <LocalAlert.Header>
                    <LocalAlert.Title>Innsending er trukket</LocalAlert.Title>
                    <LocalAlert.CloseButton onClick={() => setTrekkInnsendingSuccessful(false)} />
                  </LocalAlert.Header>
                </LocalAlert>
              </div>
            )}

            {submitAlert !== '' && (
              <LocalAlert status='error' size='small' className='my-5 max-w-[75ch]'>
                <LocalAlert.Header>
                  <LocalAlert.Title> {submitAlert}</LocalAlert.Title>
                  <LocalAlert.CloseButton onClick={() => setSubmitAlert('')} />
                </LocalAlert.Header>
              </LocalAlert>
            )}

            {!hasP360User && <P360IngenBrukerAlert />}

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

              {etterlevelseDokumentasjon.risikoeiere.length > 0 &&
                !pvkBlocksSending &&
                (hasP360User || env.isDev) && (
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
