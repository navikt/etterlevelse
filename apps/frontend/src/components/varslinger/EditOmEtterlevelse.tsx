import { Block } from 'baseui/block'
import { Formik, FormikProps } from 'formik'
import React, { useState } from 'react'
import { createMelding, mapMeldingToFormValue, updateMelding } from '../../api/MeldingApi'
import { AlertType, Melding, MeldingStatus } from '../../constants'
import { InputField, TextAreaField } from '../common/Inputs'
import Button from '../common/Button'
import { HeadingXXLarge } from 'baseui/typography'
import { Loader } from '@navikt/ds-react'

export const EditOmEtterlevelse = ({ melding, setMelding, isLoading, maxChar }: { melding: Melding | undefined; setMelding: Function; isLoading: boolean; maxChar?: number }) => {
  const [disableEdit, setDisableEdit] = useState<boolean>(false)
  // const [secondaryTittel, setSecondaryTittel] = useState<string>('')
  // const [secondaryMelding, setSecondaryMelding] = useState<string>('')

  const submit = async (melding: Melding) => {
    const newMelding = { ...melding, alertType: AlertType.INFO }
    setDisableEdit(true)
    if (melding.id) {
      await updateMelding(newMelding).then((m) => {
        setMelding(m)
        setDisableEdit(false)
        window.location.reload()
      })
    } else {
      await createMelding(newMelding).then((m) => {
        setMelding(m)
        setDisableEdit(false)
        window.location.reload()
      })
    }
  }

  if (isLoading) {
    return (
      <Block display="flex" justifyContent="center">
        <Loader size={'large'} />
      </Block>
    )
  }

  return (
    <Block>
      {melding && (
        <Formik onSubmit={submit} initialValues={mapMeldingToFormValue(melding)}>
          {({ values, submitForm }: FormikProps<Melding>) => (
            <Block>
              <HeadingXXLarge marginBottom={'44px'}>Om støtte til etterlevelse</HeadingXXLarge>
              {/* Problem med react-draft-wysiwyg Editor komponent, når du setter en custom option som props vil du man få en ' Can't perform a React state update on an unmounted component' */}

              <TextAreaField maxCharacter={maxChar} height="200px" label={'Innledende tekst'} noPlaceholder name="melding" />
              <InputField label={'Overskrift'} name={'secondaryTittel'} disablePlaceHolder />

              <TextAreaField maxCharacter={maxChar} markdown height="200px" label={'Innhold'} noPlaceholder name="secondaryMelding" />

              <Block display="flex" justifyContent="flex-end" width="100%">
                <Button
                  variant="secondary"
                  onClick={() => {
                    window.location.reload()
                  }}
                  marginRight
                >
                  Avbryt
                </Button>
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
          )}
        </Formik>
      )}
    </Block>
  )
}

export default EditOmEtterlevelse
