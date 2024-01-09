import { faSlackHash } from '@fortawesome/free-brands-svg-icons'
import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'
import { Field, FieldProps, Form, Formik } from 'formik'
import { useState } from 'react'
import { createNewTilbakemelding, CreateTilbakemeldingRequest } from '../../../../api/TilbakemeldingApi'
import { AdresseType, IKrav, ITilbakemelding, TilbakemeldingMeldingStatus, TilbakemeldingType, IVarslingsadresse } from '../../../../constants'
import { TextAreaField } from '../../../common/Inputs'
import { AddEmail, SlackChannelSearch, SlackUserSearch, VarslingsadresserTagList } from '../../Edit/KravVarslingsadresserEdit'
import * as yup from 'yup'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Markdown } from '../../../common/Markdown'
import { Error } from '../../../common/ModalSchema'
import { Accordion, Alert, BodyLong, BodyShort, Box, Button, Heading, Label, Modal, Tooltip } from '@navikt/ds-react'
import { EnvelopeClosedIcon, PersonCircleIcon } from '@navikt/aksel-icons'

type NyTilbakemeldingModalProps = {
  open?: boolean
  close: (add?: ITilbakemelding) => void
  krav: IKrav
}

const getMessageType = (type: AdresseType | undefined) => {
  switch (type) {
    case AdresseType.EPOST:
      return 'din epost'
    case AdresseType.SLACK:
      return 'slack kanal'
    case AdresseType.SLACK_USER:
      return 'din slack bruker'
  }
}

export const NyTilbakemeldingModal = ({ open, close, krav }: NyTilbakemeldingModalProps) => {
  const [error, setError] = useState()
  const [adresseType, setAdresseType] = useState<AdresseType>()
  const [showNotification, setShowNotification] = useState<AdresseType>()
  const [newTilbakeMelding, setNewTilbakeMelding] = useState<ITilbakemelding>()

  const submit = (request: CreateTilbakemeldingRequest) => {
    createNewTilbakemelding(request)
      .then((t) => {
        setShowNotification(request.varslingsadresse.type)
        setNewTilbakeMelding(t)
      })
      .catch((e) => setError(e.error))
  }

  return (
    <Modal className="max-w-xl w-full" open={open} onClose={() => close()}>
      <Formik
        onSubmit={submit}
        initialValues={newTilbakemelding(krav) as CreateTilbakemeldingRequest}
        validationSchema={createTilbakemeldingSchema}
        validateOnBlur={false}
        validateOnChange={false}
      >
        {({ isSubmitting, setFieldValue, values, submitForm, errors }) => {
          const setVarslingsadresse = (v?: IVarslingsadresse) => {
            setFieldValue('varslingsadresse', v)
            setAdresseType(undefined)
          }
          return (
            <Form>
              <Modal.Header>
                <Heading size="large">Spørsmål til kraveier</Heading>
              </Modal.Header>
              <Modal.Body>
                {showNotification ? (
                  <Box className="mb-9" padding="8">
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faThumbsUp} size="lg" />
                      <Heading size="large">Spørsmålet er sendt til kraveier!</Heading>
                    </div>
                    <BodyLong className="mt-4">Du får varsel på {getMessageType(showNotification)} når spørsmålet er besvart.</BodyLong>
                  </Box>
                ) : (
                  <div>
                    <Accordion>
                      {krav.suksesskriterier.map((s, i) => {
                        return (
                          <Accordion.Item key={s.id}>
                            <Accordion.Header>
                              <div>
                                <BodyShort>
                                  Suksesskriterium {i + 1} av {krav.suksesskriterier.length}
                                </BodyShort>
                                <Label>{s.navn}</Label>
                              </div>
                            </Accordion.Header>
                            <Accordion.Content>
                              <Markdown source={s.beskrivelse} />
                            </Accordion.Content>
                          </Accordion.Item>
                        )
                      })}
                    </Accordion>

                    <TextAreaField tooltip="Skriv ditt spørsmål i tekstfeltet" label="Ditt spørsmål" name="foersteMelding" placeholder="Skriv her.." />
                    {errors.foersteMelding && <Error fieldName="foersteMelding" fullWidth />}

                    {/* <OptionField label="Type" name="type" clearable={false} options={Object.values(TilbakemeldingType).map((o) => ({ id: o, label: typeText(o) }))} /> */}
                    <Field name="varslingsadresse.adresse">
                      {(p: FieldProps) => (
                        <div>
                          <Tooltip content="Velg hvilken adresse du vil varsles på når kraveier svarer på spørsmålet">
                            <Label>Din varslingsadresse</Label>
                          </Tooltip>
                          <div>
                            <div className="flex flex-col mt-4">
                              {adresseType === AdresseType.SLACK && <SlackChannelSearch add={setVarslingsadresse} />}
                              {adresseType !== AdresseType.SLACK && !values.varslingsadresse && (
                                <Button type="button" variant="secondary" icon={<FontAwesomeIcon icon={faSlackHash} />} onClick={() => setAdresseType(AdresseType.SLACK)}>
                                  Slack-kanal
                                </Button>
                              )}
                              <div className="mt-2.5">
                                {adresseType === AdresseType.SLACK_USER && <SlackUserSearch add={setVarslingsadresse} />}
                                {adresseType !== AdresseType.SLACK_USER && !values.varslingsadresse && (
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    className="ml-2.5"
                                    icon={<PersonCircleIcon aria-label="" aria-hidden />}
                                    onClick={() => setAdresseType(AdresseType.SLACK_USER)}
                                  >
                                    Slack-bruker
                                  </Button>
                                )}
                              </div>
                              <div className="mt-2.5">
                                {adresseType === AdresseType.EPOST && <AddEmail add={setVarslingsadresse} />}
                                {adresseType !== AdresseType.EPOST && !values.varslingsadresse && (
                                  <Button
                                    type="button"
                                    variant="secondary"
                                    className="ml-2.5"
                                    icon={<EnvelopeClosedIcon aria-label="" aria-hidden />}
                                    onClick={() => setAdresseType(AdresseType.EPOST)}
                                  >
                                    Epost
                                  </Button>
                                )}
                              </div>
                            </div>
                            {p.meta.error && <Alert variant="error">{p.meta.error}</Alert>}

                            {values.varslingsadresse && <VarslingsadresserTagList varslingsadresser={[values.varslingsadresse]} remove={() => setVarslingsadresse(undefined)} />}
                          </div>
                        </div>
                      )}
                    </Field>
                  </div>
                )}
              </Modal.Body>
              <Modal.Footer>
                {showNotification ? (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={() => {
                        close(newTilbakeMelding)
                        setShowNotification(undefined)
                        setNewTilbakeMelding(undefined)
                      }}
                    >
                      Lukk
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-end flex-1">
                    <div>{error && <Alert variant="error">{error}</Alert>}</div>
                    <Button type="button" variant="secondary" onClick={() => close()}>
                      Avbryt
                    </Button>
                    <Button type="button" disabled={isSubmitting} onClick={() => submitForm()}>
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
  type: yup.mixed<AdresseType>().oneOf(Object.values(AdresseType)).required('Det er påkrevd å ha minst en varslingsadresse'),
})

const createTilbakemeldingSchema: yup.ObjectSchema<CreateTilbakemeldingRequest> = yup.object({
  kravNummer: yup.number().required(required),
  kravVersjon: yup.number().required(required),
  foersteMelding: yup.string().required(required),
  type: yup.mixed<TilbakemeldingType>().oneOf(Object.values(TilbakemeldingType)).required(required),
  status: yup.mixed<TilbakemeldingMeldingStatus>().oneOf(Object.values(TilbakemeldingMeldingStatus)).required(required),
  endretKrav: yup.boolean().required(required),
  varslingsadresse: varslingsadresseSchema.required('Det er påkrevd å ha minst en varslingsadresse'),
})

const newTilbakemelding = (krav: IKrav): Partial<CreateTilbakemeldingRequest> => ({
  kravNummer: krav.kravNummer,
  kravVersjon: krav.kravVersjon,
  foersteMelding: '',
  type: TilbakemeldingType.UKLAR,
  varslingsadresse: undefined,
  status: TilbakemeldingMeldingStatus.UBESVART,
  endretKrav: false,
})

export default NyTilbakemeldingModal
