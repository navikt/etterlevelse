import { Button, Heading, Loader, Radio, RadioGroup } from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik, FormikProps } from 'formik'
import React, { useEffect, useState } from 'react'
import {
  createMelding,
  deleteMelding,
  mapMeldingToFormValue,
  updateMelding,
} from '../../api/MeldingApi'
import { EAlertType, EMeldingStatus, EMeldingType, IMelding } from '../../constants'
import { TextAreaField } from '../common/Inputs'

export const getAlertTypeText = (type: EAlertType) => {
  if (!type) return ''
  switch (type) {
    case EAlertType.INFO:
      return 'Informasjon'
    case EAlertType.WARNING:
      return 'Varsel'
    default:
      return type
  }
}

export const EditMelding = ({
  melding,
  setMelding,
  isLoading,
  maxChar,
}: {
  melding: IMelding | undefined
  setMelding: React.Dispatch<React.SetStateAction<IMelding | undefined>>
  isLoading: boolean
  maxChar?: number
}) => {
  const [disableEdit, setDisableEdit] = useState<boolean>(false)
  const [meldingAlertType, setMeldingAlertType] = useState<string>(EAlertType.WARNING)

  useEffect(() => {
    if (!isLoading && melding) {
      setMeldingAlertType(melding.alertType)
    }
  }, [isLoading])

  const submit = async (melding: IMelding) => {
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
          {({ values, submitForm }: FormikProps<IMelding>) => (
            <div>
              <div className="mb-6">
                <Heading className="my-4" size="small" level="2">
                  {melding.meldingType === EMeldingType.SYSTEM ? 'Systemmelding' : 'Forsidemelding'}
                </Heading>
                <Field name="alertType">
                  {(fieldProps: FieldProps<string>) => (
                    <Form>
                      <RadioGroup
                        className="mt-8"
                        legend="Varseltype"
                        disabled={disableEdit}
                        value={meldingAlertType}
                        onChange={(event) => {
                          fieldProps.form.setFieldValue('alertType', event)
                          setMeldingAlertType(event)
                        }}
                      >
                        {Object.values(EAlertType).map((id) => {
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
                height="12.5rem"
                label={
                  melding.meldingType === EMeldingType.SYSTEM ? 'Systemmelding' : 'Forsidemelding'
                }
                noPlaceholder
                name="melding"
              />
              <div className="flex w-full mt-2.5">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={disableEdit}
                  onClick={() => {
                    deleteMelding(melding.id).then(() => {
                      setMelding(undefined)
                    })
                  }}
                >
                  Slett
                </Button>
                <div className="flex justify-end w-full">
                  {melding.meldingStatus === EMeldingStatus.ACTIVE && (
                    <Button
                      type="button"
                      className="mx-6"
                      variant="secondary"
                      disabled={disableEdit}
                      onClick={() => {
                        values.meldingStatus = EMeldingStatus.DEACTIVE
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
                      values.meldingStatus = EMeldingStatus.ACTIVE
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
