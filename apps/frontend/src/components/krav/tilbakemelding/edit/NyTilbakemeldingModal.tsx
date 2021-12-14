import { faSlackHash } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope, faThumbsUp, faUser } from '@fortawesome/free-solid-svg-icons'
import { Block } from 'baseui/block'
import Button from '../../../common/Button'
import { FormControl } from 'baseui/form-control'
import { ModalBody, ModalFooter, ModalHeader } from 'baseui/modal'
import { H2, H3, Paragraph1 } from 'baseui/typography'
import { Field, FieldProps, Form, Formik } from 'formik'
import { useState } from 'react'
import { createNewTilbakemelding, CreateTilbakemeldingRequest } from '../../../../api/TilbakemeldingApi'
import { AdresseType, Krav, Tilbakemelding, TilbakemeldingType, Varslingsadresse } from '../../../../constants'
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
import { borderRadius, borderWidth, borderColor } from '../../../common/Style'

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

  const submit = (req: CreateTilbakemeldingRequest) => {
    createNewTilbakemelding(req)
      .then((t) => {
        setShowNotification(req.varslingsadresse.type)
        setNewTilbakeMelding(t)
      })
      .catch((e) => setError(e.error))
  }

  return (
    <CustomizedModal
      size="default"
      overrides={{
        Dialog: {
          style: {
            maxWidth: '514px',
          },
        },
      }}
      closeable={false}
      unstable_ModalBackdropScroll
      isOpen={open}
      onClose={() => close()}
    >
      <Formik
        onSubmit={submit}
        initialValues={newTilbakemelding(krav) as CreateTilbakemeldingRequest}
        validationSchema={createTilbakemeldingSchema}
        validateOnBlur={false}
        validateOnChange={false}
      >
        {({ isSubmitting, setFieldValue, values, submitForm }) => {
          const setVarslingsadresse = (v?: Varslingsadresse) => {
            setFieldValue('varslingsadresse', v)
            setAdresseType(undefined)
          }
          return (
            <Form>
              <ModalHeader>
                <H2>Spørsmål til kraveier</H2>
              </ModalHeader>
              <ModalBody>
                {showNotification ?
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
                      <H3
                        $style={{
                          fontSize: '20px',
                          lineHeight: '25px',
                          marginLeft: '5px',
                          marginTop: '0px',
                          marginBottom: '0px',
                        }}
                      >
                        Spørsmålet er sendt til kraveier!
                      </H3>
                    </Block>
                    <Block marginTop={'17px'}>
                      <Paragraph1
                        $style={{
                          fontSize: '20px',
                          lineHeight: '25px',
                          marginTop: '0px',
                          marginBottom: '0px',
                        }}
                      >
                        Du får varsel på {getMessageType(showNotification)} når spørsmålet er besvart.
                      </Paragraph1>
                    </Block>
                  </Card>

                  :
                  <Block>
                    <TextAreaField tooltip="Skriv ditt spørsmål i tekstfeltet" label="Ditt spørsmål" name="foersteMelding" placeholder="Skriv her.." />
                    {/* <OptionField label="Type" name="type" clearable={false} options={Object.values(TilbakemeldingType).map((o) => ({ id: o, label: typeText(o) }))} /> */}
                    <Field name="varslingsadresse.adresse">
                      {(p: FieldProps) => (
                        <FormControl label={<LabelWithTooltip label="Varslingsadresse" tooltip="Velg ønsket varslings metode" />} error={p.meta.error}>
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
                  </Block>}
              </ModalBody>
              <ModalFooter>
                {showNotification ?
                  <Block display="flex" justifyContent="flex-end">
                    <Button type="button" onClick={() => close(newTilbakeMelding)}>
                      Lukk
                    </Button>
                  </Block>
                  :
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
                      Lagre
                    </Button>
                  </Block>}
              </ModalFooter>
            </Form>
          )
        }}
      </Formik>
    </CustomizedModal>
  )
}

const required = 'Påkrevd'

const varslingsadresse: yup.SchemaOf<Varslingsadresse> = yup.object({
  adresse: yup.string().required(required),
  type: yup.mixed().oneOf(Object.values(AdresseType)).required(required),
})

const createTilbakemeldingSchema: yup.SchemaOf<CreateTilbakemeldingRequest> = yup.object({
  kravNummer: yup.number().required(required),
  kravVersjon: yup.number().required(required),
  foersteMelding: yup.string().required(required),
  type: yup.mixed().oneOf(Object.values(TilbakemeldingType)).required(required),
  varslingsadresse: varslingsadresse.required(required),
})

const newTilbakemelding = (krav: Krav): Partial<CreateTilbakemeldingRequest> => ({
  kravNummer: krav.kravNummer,
  kravVersjon: krav.kravVersjon,
  foersteMelding: '',
  type: TilbakemeldingType.UKLAR,
  varslingsadresse: undefined,
})

export default NyTilbakemeldingModal
