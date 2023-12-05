import { Field, FieldProps, Form, Formik, FormikProps } from 'formik'
import React, { useEffect, useState } from 'react'
import { createMelding, deleteMelding, mapMeldingToFormValue, updateMelding } from '../../api/MeldingApi'
import { AlertType, Melding, MeldingStatus, MeldingType } from '../../constants'
import { TextAreaField } from '../common/Inputs'
import { Button, Heading, Radio, RadioGroup } from '@navikt/ds-react'
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
      <div className="flex justify-center">
        <Loader size="large" />
      </div>
    )
  }

  return (
    <div>
      {melding && (
        <Formik onSubmit={submit} initialValues={mapMeldingToFormValue(melding)}>
          {({ values, submitForm }: FormikProps<Melding>) => (
            <div>
              <div className="mb-6">
                <Heading className="my-4" size="small" level="2">
                  {melding.meldingType === MeldingType.SYSTEM ? 'Systemmelding' : 'Forsidemelding'}
                </Heading>
                <Field name="alertType">
                  {(p: FieldProps<string>) => (
                    <Form>
                      <RadioGroup
                        className="mt-8"
                        legend="Varseltype"
                        disabled={disableEdit}
                        value={meldingAlertType}
                        onChange={(event) => {
                          p.form.setFieldValue('alertType', event)
                          setMeldingAlertType(event)
                        }}
                      >
                        {Object.values(AlertType).map((id) => {
                          return (
                            <Radio value={id} key={id}>
                              <div className="hover:underline">{getAlertTypeText(id)}</div>
                            </Radio>
                          )
                        })}
                      </RadioGroup>
                    </Form>
                  )}
                </Field>
              </div>

              {/* Problem med react-draft-wysiwyg Editor komponent, når du setter en custom option som props vil du man få en ' Can't perform a React state update on an unmounted component' */}
              <TextAreaField
                maxCharacter={maxChar}
                markdown
                height="200px"
                label={melding.meldingType === MeldingType.SYSTEM ? 'Systemmelding' : 'Forsidemelding'}
                noPlaceholder
                name="melding"
              />
              <div className="flex w-full">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={disableEdit}
                  onClick={() => {
                    deleteMelding(melding.id).then(() => {
                      setMelding('')
                    })
                  }}
                >
                  Slett
                </Button>
                <div className="flex justify-end w-full">
                  {melding.meldingStatus === MeldingStatus.ACTIVE && (
                    <Button
                      type="button"
                      className="mx-6"
                      variant="secondary"
                      disabled={disableEdit}
                      onClick={() => {
                        values.meldingStatus = MeldingStatus.DEACTIVE
                        submitForm()
                      }}
                    >
                      Skjul meldingen
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="primary"
                    disabled={disableEdit}
                    onClick={() => {
                      values.meldingStatus = MeldingStatus.ACTIVE
                      submitForm()
                    }}
                  >
                    Publiser
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Formik>
      )}
    </div>
  )
}

export default EditMelding
