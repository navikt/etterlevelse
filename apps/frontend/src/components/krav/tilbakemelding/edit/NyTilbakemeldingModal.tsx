import { faSlackHash } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope, faThumbsUp, faUser } from '@fortawesome/free-solid-svg-icons'
import { Block } from 'baseui/block'
import Button from '../../../common/Button'
import { FormControl } from 'baseui/form-control'
import { ModalBody, ModalFooter, ModalHeader } from 'baseui/modal'
import { HeadingLarge, HeadingXLarge, LabelLarge, ParagraphLarge, ParagraphMedium } from 'baseui/typography'
import { Field, FieldProps, Form, Formik } from 'formik'
import { useState } from 'react'
import { createNewTilbakemelding, CreateTilbakemeldingRequest } from '../../../../api/TilbakemeldingApi'
import { AdresseType, Krav, Tilbakemelding, TilbakemeldingMeldingStatus, TilbakemeldingType, Varslingsadresse } from '../../../../constants'
import { theme } from '../../../../util'
import CustomizedModal from '../../../common/CustomizedModal'
import { TextAreaField } from '../../../common/Inputs'
import LabelWithTooltip from '../../../common/LabelWithTooltip'
import { AddEmail, SlackChannelSearch, SlackUserSearch, VarslingsadresserTagList } from '../../Edit/KravVarslingsadresserEdit'
import { Notification } from 'baseui/notification'
import * as yup from 'yup'
import { Card } from 'baseui/card'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ettlevColors } from '../../../../util/theme'
import { borderColor, borderRadius, borderWidth } from '../../../common/Style'
import { CustomizedAccordion, CustomizedPanel } from '../../../common/CustomizedAccordion'
import { Markdown } from '../../../common/Markdown'
import { Error } from '../../../common/ModalSchema'

type NyTilbakemeldingModalProps = {
  open?: boolean
  close: (add?: Tilbakemelding) => void
  krav: Krav
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
  const [newTilbakeMelding, setNewTilbakeMelding] = useState<Tilbakemelding>()

  const submit = (request: CreateTilbakemeldingRequest) => {
    createNewTilbakemelding(request)
      .then((t) => {
        setShowNotification(request.varslingsadresse.type)
        setNewTilbakeMelding(t)
      })
      .catch((e) => setError(e.error))
  }

  return (
    <CustomizedModal
      size="auto"
      overrides={{
        Dialog: {
          style: {
            //  maxWidth: '514px',
          },
        },
      }}
      isOpen={open}
      closeable={false}
      onClose={() => close()}
    >
      <Formik
        onSubmit={submit}
        initialValues={newTilbakemelding(krav) as CreateTilbakemeldingRequest}
        validationSchema={createTilbakemeldingSchema}
        validateOnBlur={false}
        validateOnChange={false}
      >
        {({ isSubmitting, setFieldValue, values, submitForm, errors }) => {
          const setVarslingsadresse = (v?: Varslingsadresse) => {
            setFieldValue('varslingsadresse', v)
            setAdresseType(undefined)
          }
          return (
            <Form>
              <ModalHeader>
                <HeadingXLarge>Spørsmål til kraveier</HeadingXLarge>
              </ModalHeader>
              <ModalBody>
                {showNotification ? (
                  <Card
                    overrides={{
                      Root: {
                        style: {
                          backgroundColor: ettlevColors.green50,
                          marginBottom: '35px',
                          ...borderRadius('4px'),
                          ...borderWidth('1px'),
                          ...borderColor(ettlevColors.green100),
                        },
                      },
                    }}
                  >
                    <Block display="flex" alignItems="center">
                      <FontAwesomeIcon icon={faThumbsUp} size="lg" />
                      <HeadingLarge
                        $style={{
                          fontSize: '20px',
                          lineHeight: '25px',
                          marginLeft: '5px',
                          marginTop: '0px',
                          marginBottom: '0px',
                        }}
                      >
                        Spørsmålet er sendt til kraveier!
                      </HeadingLarge>
                    </Block>
                    <Block marginTop={'17px'}>
                      <ParagraphLarge
                        $style={{
                          fontSize: '20px',
                          lineHeight: '25px',
                          marginTop: '0px',
                          marginBottom: '0px',
                        }}
                      >
                        Du får varsel på {getMessageType(showNotification)} når spørsmålet er besvart.
                      </ParagraphLarge>
                    </Block>
                  </Card>
                ) : (
                  <Block>
                    <CustomizedAccordion>
                      {krav.suksesskriterier.map((s, i) => {
                        return (
                          <CustomizedPanel
                            overrides={{ Content: { style: { backgroundColor: ettlevColors.white, paddingLeft: '20px', paddingRight: '20px' } } }}
                            title={
                              <Block>
                                <ParagraphMedium
                                  $style={{
                                    fontSize: '16px',
                                    lineHeight: '18,75',
                                    marginTop: '3px',
                                    marginBottom: '5px',
                                    font: 'roboto',
                                    color: ettlevColors.grey600,
                                  }}
                                >
                                  Suksesskriterium {i + 1} av {krav.suksesskriterier.length}
                                </ParagraphMedium>
                                <LabelLarge color={ettlevColors.green600}>{s.navn}</LabelLarge>
                              </Block>
                            }
                          >
                            <Block width="100%">
                              <Markdown source={s.beskrivelse} />
                            </Block>
                          </CustomizedPanel>
                        )
                      })}
                    </CustomizedAccordion>

                    <TextAreaField tooltip="Skriv ditt spørsmål i tekstfeltet" label="Ditt spørsmål" name="foersteMelding" placeholder="Skriv her.." />
                    {errors.foersteMelding && <Error fieldName="foersteMelding" fullWidth />}

                    {/* <OptionField label="Type" name="type" clearable={false} options={Object.values(TilbakemeldingType).map((o) => ({ id: o, label: typeText(o) }))} /> */}
                    <Field name="varslingsadresse.adresse">
                      {(p: FieldProps) => (
                        <FormControl
                          label={<LabelWithTooltip label="Din varslingsadresse" tooltip="Velg hvilken adresse du vil varsles på når kraveier svarer på spørsmålet" />}
                          error={p.meta.error}
                        >
                          <Block>
                            <Block display="flex" flexDirection="column" marginTop={theme.sizing.scale600}>
                              {adresseType === AdresseType.SLACK && <SlackChannelSearch add={setVarslingsadresse} />}
                              {adresseType !== AdresseType.SLACK && !values.varslingsadresse && (
                                <Button kind="secondary" size="compact" type="button" icon={faSlackHash} onClick={() => setAdresseType(AdresseType.SLACK)}>
                                  Slack-kanal
                                </Button>
                              )}
                              <Block marginTop={theme.sizing.scale400} />
                              {adresseType === AdresseType.SLACK_USER && <SlackUserSearch add={setVarslingsadresse} />}
                              {adresseType !== AdresseType.SLACK_USER && !values.varslingsadresse && (
                                <Button kind="secondary" size="compact" marginLeft type="button" icon={faUser} onClick={() => setAdresseType(AdresseType.SLACK_USER)}>
                                  Slack-bruker
                                </Button>
                              )}
                              <Block marginTop={theme.sizing.scale400} />
                              {adresseType === AdresseType.EPOST && <AddEmail add={setVarslingsadresse} />}
                              {adresseType !== AdresseType.EPOST && !values.varslingsadresse && (
                                <Button kind="secondary" size="compact" marginLeft type="button" icon={faEnvelope} onClick={() => setAdresseType(AdresseType.EPOST)}>
                                  Epost
                                </Button>
                              )}
                            </Block>
                            {values.varslingsadresse && <VarslingsadresserTagList varslingsadresser={[values.varslingsadresse]} remove={() => setVarslingsadresse(undefined)} />}
                          </Block>
                        </FormControl>
                      )}
                    </Field>
                  </Block>
                )}
              </ModalBody>
              <ModalFooter>
                {showNotification ? (
                  <Block display="flex" justifyContent="flex-end">
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
                  </Block>
                ) : (
                  <Block display="flex" justifyContent="flex-end">
                    <Block>
                      {error && (
                        <Notification kind="negative" overrides={{ Body: { style: { marginBottom: '-25px' } } }}>
                          {error}
                        </Notification>
                      )}
                    </Block>
                    <Button kind="secondary" size="compact" type="button" onClick={close}>
                      {' '}
                      Avbryt{' '}
                    </Button>
                    <Button type="button" marginLeft disabled={isSubmitting} onClick={submitForm}>
                      Send spørsmål
                    </Button>
                  </Block>
                )}
              </ModalFooter>
            </Form>
          )
        }}
      </Formik>
    </CustomizedModal>
  )
}

const required = 'Påkrevd'

const varslingsadresseSchema: yup.ObjectSchema<Varslingsadresse> = yup.object({
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

const newTilbakemelding = (krav: Krav): Partial<CreateTilbakemeldingRequest> => ({
  kravNummer: krav.kravNummer,
  kravVersjon: krav.kravVersjon,
  foersteMelding: '',
  type: TilbakemeldingType.UKLAR,
  varslingsadresse: undefined,
  status: TilbakemeldingMeldingStatus.UBESVART,
  endretKrav: false,
})

export default NyTilbakemeldingModal
