import { createNewTilbakemelding } from '@/api/krav/tilbakemelding/tilbakemeldingApi'
import { Markdown } from '@/components/common/markdown/markdown'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import { SlackChannelSearch } from '@/components/varslingsadresse/slackChannelSearch/slackChannelSearch'
import { SlackUserSearch } from '@/components/varslingsadresse/slackUserSearch/slackUserSearch'
import { AddEmail } from '@/components/varslingsadresse/varslingsadresserEdit/varslingsadresserEdit'
import { VarslingsadresserTagList } from '@/components/varslingsadresse/varslingsadresserTagList/varslingsadresseTagList'
import { IKrav, ISuksesskriterie } from '@/constants/krav/kravConstants'
import {
  ETilbakemeldingMeldingStatus,
  ETilbakemeldingType,
  ICreateTilbakemeldingRequest,
  ITilbakemelding,
} from '@/constants/krav/tilbakemelding/tilbakemeldingConstants'
import {
  EAdresseType,
  IVarslingsadresse,
} from '@/constants/teamkatalogen/varslingsadresse/varslingsadresseConstants'
import { getMessageType } from '@/util/tilbakemelding/tilbakemeldingUtils'
import { faSlackHash } from '@fortawesome/free-brands-svg-icons'
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { EnvelopeClosedIcon, PersonCircleIcon } from '@navikt/aksel-icons'
import {
  Accordion,
  Alert,
  BodyLong,
  BodyShort,
  Box,
  Button,
  Heading,
  Label,
  Modal,
  Tooltip,
} from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik } from 'formik'
import { useState } from 'react'
import * as yup from 'yup'

type TNyTilbakemeldingModalProps = {
  open?: boolean
  close: (add?: ITilbakemelding) => void
  krav: IKrav
}

const newTilbakemelding = (krav: IKrav): Partial<ICreateTilbakemeldingRequest> => ({
  kravNummer: krav.kravNummer,
  kravVersjon: krav.kravVersjon,
  foersteMelding: '',
  type: ETilbakemeldingType.UKLAR,
  varslingsadresse: undefined,
  status: ETilbakemeldingMeldingStatus.UBESVART,
  endretKrav: false,
})

export const TilbakemeldingNyModal = ({ open, close, krav }: TNyTilbakemeldingModalProps) => {
  const [error, setError] = useState()
  const [adresseType, setAdresseType] = useState<EAdresseType>()
  const [showNotification, setShowNotification] = useState<EAdresseType>()
  const [newTilbakeMelding, setNewTilbakeMelding] = useState<ITilbakemelding>()

  const submit = (request: ICreateTilbakemeldingRequest) => {
    createNewTilbakemelding(request)
      .then((tilbakemelding: ITilbakemelding) => {
        setShowNotification(request.varslingsadresse.type)
        setNewTilbakeMelding(tilbakemelding)
      })
      .catch((error: any) => setError(error.error))
  }

  return (
    <Modal
      className='max-w-xl w-full'
      open={open}
      onClose={() => close()}
      header={{ heading: 'Spørsmål til kraveier', closeButton: false }}
    >
      <Formik
        onSubmit={submit}
        initialValues={newTilbakemelding(krav) as ICreateTilbakemeldingRequest}
        validationSchema={createTilbakemeldingSchema}
        validateOnBlur={false}
        validateOnChange={false}
      >
        {({ isSubmitting, setFieldValue, values, submitForm }) => {
          const setVarslingsadresse = (v?: IVarslingsadresse) => {
            setFieldValue('varslingsadresse', v)
            setAdresseType(undefined)
          }
          return (
            <Form>
              <Modal.Body>
                {showNotification && (
                  <Box className='mb-9' padding='8'>
                    <div className='flex items-center'>
                      <FontAwesomeIcon icon={faThumbsUp} size='lg' />
                      <Heading size='large'>Spørsmålet er sendt til kraveier!</Heading>
                    </div>
                    <BodyLong className='mt-4'>
                      Du får varsel på {getMessageType(showNotification)} når spørsmålet er besvart.
                    </BodyLong>
                  </Box>
                )}
                {!showNotification && (
                  <div>
                    <Accordion>
                      {krav.suksesskriterier.map(
                        (suksesskriterium: ISuksesskriterie, index: number) => {
                          return (
                            <Accordion.Item key={suksesskriterium.id}>
                              <Accordion.Header>
                                <div>
                                  <BodyShort>
                                    Suksesskriterium {index + 1} av {krav.suksesskriterier.length}
                                  </BodyShort>
                                  <Label>{suksesskriterium.navn}</Label>
                                </div>
                              </Accordion.Header>
                              <Accordion.Content>
                                <Markdown source={suksesskriterium.beskrivelse} />
                              </Accordion.Content>
                            </Accordion.Item>
                          )
                        }
                      )}
                    </Accordion>

                    <TextAreaField
                      label='Ditt spørsmål'
                      name='foersteMelding'
                      placeholder='Skriv her..'
                    />
                    <Field name='varslingsadresse.adresse'>
                      {(fieldProps: FieldProps) => (
                        <div>
                          <Tooltip content='Velg hvilken adresse du vil varsles på når kraveier svarer på spørsmålet'>
                            <Label>Din varslingsadresse</Label>
                          </Tooltip>
                          <div>
                            <div className='flex flex-col mt-4'>
                              {adresseType === EAdresseType.SLACK && (
                                <SlackChannelSearch add={setVarslingsadresse} />
                              )}
                              {adresseType !== EAdresseType.SLACK && !values.varslingsadresse && (
                                <Button
                                  type='button'
                                  variant='secondary'
                                  icon={<FontAwesomeIcon icon={faSlackHash} />}
                                  onClick={() => setAdresseType(EAdresseType.SLACK)}
                                >
                                  Slack-kanal
                                </Button>
                              )}
                              <div className='mt-2.5'>
                                {adresseType === EAdresseType.SLACK_USER && (
                                  <SlackUserSearch add={setVarslingsadresse} />
                                )}
                                {adresseType !== EAdresseType.SLACK_USER &&
                                  !values.varslingsadresse && (
                                    <Button
                                      type='button'
                                      variant='secondary'
                                      className='ml-2.5'
                                      icon={<PersonCircleIcon aria-label='' aria-hidden />}
                                      onClick={() => setAdresseType(EAdresseType.SLACK_USER)}
                                    >
                                      Slack-bruker
                                    </Button>
                                  )}
                              </div>
                              <div className='mt-2.5'>
                                {adresseType === EAdresseType.EPOST && (
                                  <AddEmail add={setVarslingsadresse} />
                                )}
                                {adresseType !== EAdresseType.EPOST && !values.varslingsadresse && (
                                  <Button
                                    type='button'
                                    variant='secondary'
                                    className='ml-2.5'
                                    icon={<EnvelopeClosedIcon aria-label='' aria-hidden />}
                                    onClick={() => setAdresseType(EAdresseType.EPOST)}
                                  >
                                    Epost
                                  </Button>
                                )}
                              </div>
                            </div>
                            {fieldProps.meta.error && (
                              <Alert variant='error'>{fieldProps.meta.error}</Alert>
                            )}

                            {values.varslingsadresse && (
                              <VarslingsadresserTagList
                                varslingsadresser={[values.varslingsadresse]}
                                remove={() => setVarslingsadresse(undefined)}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </Field>
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer>
                {showNotification && (
                  <div className='flex justify-end'>
                    <Button
                      type='button'
                      onClick={() => {
                        close(newTilbakeMelding)
                        setShowNotification(undefined)
                        setNewTilbakeMelding(undefined)
                      }}
                    >
                      Lukk
                    </Button>
                  </div>
                )}
                {!showNotification && (
                  <div className='flex justify-end flex-1'>
                    <div>{error && <Alert variant='error'>{error}</Alert>}</div>
                    <Button type='button' variant='secondary' onClick={() => close()}>
                      Avbryt
                    </Button>
                    <Button type='button' disabled={isSubmitting} onClick={() => submitForm()}>
                      Send spørsmål
                    </Button>
                  </div>
                )}
              </Modal.Footer>
            </Form>
          )
        }}
      </Formik>
    </Modal>
  )
}

const required = 'Påkrevd'

const varslingsadresseSchema: yup.ObjectSchema<IVarslingsadresse> = yup.object({
  adresse: yup.string().required('Det er påkrevd å ha minst en varslingsadresse'),
  type: yup
    .mixed<EAdresseType>()
    .oneOf(Object.values(EAdresseType))
    .required('Det er påkrevd å ha minst en varslingsadresse'),
})

const createTilbakemeldingSchema: yup.ObjectSchema<ICreateTilbakemeldingRequest> = yup.object({
  kravNummer: yup.number().required(required),
  kravVersjon: yup.number().required(required),
  foersteMelding: yup.string().required(required),
  type: yup
    .mixed<ETilbakemeldingType>()
    .oneOf(Object.values(ETilbakemeldingType))
    .required(required),
  status: yup
    .mixed<ETilbakemeldingMeldingStatus>()
    .oneOf(Object.values(ETilbakemeldingMeldingStatus))
    .required(required),
  endretKrav: yup.boolean().required(required),
  varslingsadresse: varslingsadresseSchema.required(
    'Det er påkrevd å ha minst en varslingsadresse'
  ),
})
