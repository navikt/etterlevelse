'use client'

import {
  createMelding,
  deleteMelding,
  mapMeldingToFormValue,
  updateMelding,
} from '@/api/melding/meldingApi'
import { EMeldingStatus, IMelding } from '@/constants/admin/message/messageConstants'
import { EAlertType } from '@/constants/commonConstants'
import { Button, Heading, Loader } from '@navikt/ds-react'
import { Form, Formik, FormikProps } from 'formik'
import React, { useState } from 'react'

export const EditOmEtterlevelse = ({
  melding,
  setMelding,
  isLoading,
  // maxChar,
}: {
  melding: IMelding | undefined
  setMelding: React.Dispatch<React.SetStateAction<IMelding | undefined>>
  isLoading: boolean
  maxChar?: number
}) => {
  const [disableEdit, setDisableEdit] = useState<boolean>(false)

  //  const initialNumberOfRows = 1

  const submit = async (melding: IMelding) => {
    const newMelding = { ...melding, alertType: EAlertType.INFO }
    setDisableEdit(true)
    if (melding.id) {
      await updateMelding(newMelding).then((m) => {
        setMelding(m)
        setDisableEdit(false)
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
      })
    } else {
      await createMelding(newMelding).then((m) => {
        setMelding(m)
        setDisableEdit(false)
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
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
        <Formik
          onSubmit={submit}
          initialValues={mapMeldingToFormValue(melding)}
          validateOnChange={false}
          validateOnBlur={false}
        >
          {({ values, submitForm }: FormikProps<IMelding>) => (
            <Form>
              <Heading size='small' level='2' className='my-4'>
                Om støtte til etterlevelse
              </Heading>
              {/* Problem med react-draft-wysiwyg Editor komponent, når du setter en custom option som props vil du man få en ' Can't perform a React state update on an unmounted component' */}

              {/* <TextAreaField
                maxCharacter={maxChar}
                height='12.5rem'
                label={'Innledende tekst'}
                noPlaceholder
                name='melding'
              />
              <TextAreaField
                rows={initialNumberOfRows}
                label={'Overskrift'}
                name={'secondaryTittel'}
                noPlaceholder
              />

              <TextAreaField
                maxCharacter={maxChar}
                markdown
                height='12.5rem'
                label={'Innhold'}
                noPlaceholder
                name='secondaryMelding'
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
                  <Button
                    type='button'
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

export default EditOmEtterlevelse
