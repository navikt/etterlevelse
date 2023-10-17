import { Block } from 'baseui/block'
import { Field, FieldProps, Formik, FormikProps } from 'formik'
import React, { useEffect, useState } from 'react'
import { createMelding, mapMeldingToFormValue, updateMelding } from '../../api/MeldingApi'
import { AlertType, Melding, MeldingStatus, MeldingType } from '../../constants'
import { FieldWrapper, TextAreaField } from '../common/Inputs'
import Button from '../common/Button'
import { deleteIconGreen600, eyeSlash } from '../Images'
import { borderColor } from '../common/Style'
import { ettlevColors, theme } from '../../util/theme'
import { FormControl } from 'baseui/form-control'
import { Radio, RadioGroup } from 'baseui/radio'
import { ParagraphMedium } from 'baseui/typography'
import { Loader } from '@navikt/ds-react'

export const getAlertTypeText = (type: AlertType) => {
  if (!type) return ''
  switch (type) {
    case AlertType.INFO:
      return 'Informasjon'
    case AlertType.WARNING:
      return 'Varsel'
    default:
      return type
  }
}

export const EditMelding = ({ melding, setMelding, isLoading, maxChar }: { melding: Melding | undefined; setMelding: Function; isLoading: boolean; maxChar?: number }) => {
  const [disableEdit, setDisableEdit] = useState<boolean>(false)
  const [meldingAlertType, setMeldingAlertType] = useState<string>(AlertType.WARNING)
  const [radioHover, setRadioHover] = useState<string>('')

  useEffect(() => {
    if (!isLoading && melding) {
      setMeldingAlertType(melding.alertType)
    }
  }, [isLoading])

  const submit = async (melding: Melding) => {
    setDisableEdit(true)
    if (melding.id) {
      await updateMelding(melding).then((m) => {
        setMelding(m)
        setDisableEdit(false)
        window.location.reload()
      })
    } else {
      await createMelding(melding).then((m) => {
        setMelding(m)
        setDisableEdit(false)
        window.location.reload()
      })
    }
  }

  if (isLoading) {
    return (
      <Block display="flex" justifyContent="center">
        <Loader size="large" />
      </Block>
    )
  }

  return (
    <Block>
      {melding && (
        <Formik onSubmit={submit} initialValues={mapMeldingToFormValue(melding)}>
          {({ values, submitForm }: FormikProps<Melding>) => (
            <Block>
              <FieldWrapper>
                <Field name="alertType">
                  {(p: FieldProps<string>) => (
                    <FormControl
                      label="Varsel type"
                      overrides={{
                        Label: {
                          style: {
                            color: ettlevColors.navMorkGra,
                            fontWeight: 700,
                            lineHeight: '48px',
                            fontSize: '18px',
                            marginTop: '0px',
                            marginBottom: '0px',
                          },
                        },
                      }}
                    >
                      <RadioGroup
                        disabled={disableEdit}
                        onMouseEnter={(e) => setRadioHover(e.currentTarget.children[1].getAttribute('value') || '')}
                        onMouseLeave={() => setRadioHover('')}
                        overrides={{
                          RadioGroupRoot: {
                            style: {
                              width: '100%',
                              alignItems: 'flex-start',
                            },
                          },
                        }}
                        value={meldingAlertType}
                        onChange={(event) => {
                          p.form.setFieldValue('alertType', event.currentTarget.value)
                          setMeldingAlertType(event.currentTarget.value)
                        }}
                      >
                        {Object.values(AlertType).map((id) => {
                          return (
                            <Radio
                              value={id}
                              key={id}
                              overrides={{
                                Label: {
                                  style: {
                                    fontSize: '18px',
                                    fontWeight: 400,
                                    lineHeight: '22px',
                                    width: '100%',
                                  },
                                },
                                RadioMarkOuter: {
                                  style: {
                                    height: theme.sizing.scale600,
                                    width: theme.sizing.scale600,
                                  },
                                },
                              }}
                            >
                              <Block $style={{ textDecoration: radioHover === id ? 'underline' : 'none' }}>
                                <ParagraphMedium $style={{ lineHeight: '22px' }} marginTop="0px" marginBottom="0px">
                                  {getAlertTypeText(id)}
                                </ParagraphMedium>
                              </Block>
                            </Radio>
                          )
                        })}
                      </RadioGroup>
                    </FormControl>
                  )}
                </Field>
              </FieldWrapper>

              {/* Problem med react-draft-wysiwyg Editor komponent, når du setter en custom option som props vil du man få en ' Can't perform a React state update on an unmounted component' */}
              <TextAreaField
                maxCharacter={maxChar}
                markdown
                height="200px"
                label={melding.meldingType === MeldingType.SYSTEM ? 'Systemmelding' : 'Forsidemelding'}
                noPlaceholder
                name="melding"
              />

              <Block display="flex" width="100%">
                <Block display="flex" width="100%">
                  <Button
                    kind="underline-hover"
                    onClick={() => window.location.reload()}
                    startEnhancer={<img alt="delete" src={deleteIconGreen600} />}
                    $style={{ fontSize: '18px' }}
                  >
                    Forkast endringer
                  </Button>
                </Block>

                <Block display="flex" justifyContent="flex-end" width="100%">
                  {melding.meldingStatus === MeldingStatus.ACTIVE && (
                    <Button
                      marginRight
                      kind="secondary"
                      disabled={disableEdit}
                      startEnhancer={<img src={eyeSlash} alt="hide icon" />}
                      onClick={() => {
                        values.meldingStatus = MeldingStatus.DEACTIVE
                        submitForm()
                      }}
                      $style={{
                        ...borderColor(ettlevColors.grey200),
                      }}
                    >
                      Skjul meldingen
                    </Button>
                  )}
                  <Button
                    disabled={disableEdit}
                    onClick={() => {
                      values.meldingStatus = MeldingStatus.ACTIVE
                      submitForm()
                    }}
                  >
                    Publiser
                  </Button>
                </Block>
              </Block>
            </Block>
          )}
        </Formik>
      )}
    </Block>
  )
}

export default EditMelding
