'use client'

import {
  createMelding,
  deleteMelding,
  mapMeldingToFormValue,
  updateMelding,
} from '@/api/melding/meldingApi'
import { EMeldingStatus, EMeldingType, IMelding } from '@/constants/admin/message/messageConstants'
import { EAlertType } from '@/constants/commonConstants'
import { Button, Heading, Loader, Radio, RadioGroup } from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik, FormikProps } from 'formik'
import { Dispatch, FunctionComponent, SetStateAction, useEffect, useState } from 'react'

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

type TProps = {
  melding: IMelding | undefined
  setMelding: Dispatch<SetStateAction<IMelding | undefined>>
  isLoading: boolean
  maxChar?: number
}

export const EditMelding: FunctionComponent<TProps> = ({
  melding,
  setMelding,
  isLoading,
  //maxChar,
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

  return (
    <div>
      {isLoading && (
        <div className='flex justify-center'>
          <Loader size='large' />
        </div>
      )}

      {!isLoading && melding && (
        <Formik onSubmit={submit} initialValues={mapMeldingToFormValue(melding)}>
          {({ values, submitForm }: FormikProps<IMelding>) => (
            <Form>
              <div className='mb-6'>
                <Heading className='my-4' size='small' level='2'>
                  {melding.meldingType === EMeldingType.SYSTEM ? 'Systemmelding' : 'Forsidemelding'}
                </Heading>
                <Field name='alertType'>
                  {(fieldProps: FieldProps<string>) => (
                    <RadioGroup
                      className='mt-8'
                      legend='Varseltype'
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
                            <div className='hover:underline'>{getAlertTypeText(id)}</div>
                          </Radio>
                        )
                      })}
                    </RadioGroup>
                  )}
                </Field>
              </div>

              {/* Problem med react-draft-wysiwyg Editor komponent, når du setter en custom option som props vil du man få en ' Can't perform a React state update on an unmounted component' */}
              {/* <TextAreaField
                maxCharacter={maxChar}
                markdown
                height='12.5rem'
                label={
                  melding.meldingType === EMeldingType.SYSTEM ? 'Systemmelding' : 'Forsidemelding'
                }
                noPlaceholder
                name='melding'
              /> */}
              <div className='flex w-full mt-2.5'>
                <Button
                  type='button'
                  variant='secondary'
                  disabled={disableEdit}
                  onClick={() => {
                    deleteMelding(melding.id).then(() => {
                      setMelding(undefined)
                    })
                  }}
                >
                  Slett
                </Button>
                <div className='flex justify-end w-full'>
                  {melding.meldingStatus === EMeldingStatus.ACTIVE && (
                    <Button
                      type='button'
                      className='mx-6'
                      variant='secondary'
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
                    type='button'
                    variant='primary'
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
            </Form>
          )}
        </Formik>
      )}
    </div>
  )
}

export default EditMelding
