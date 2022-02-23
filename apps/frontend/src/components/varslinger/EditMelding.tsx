import { Block } from 'baseui/block'
import { Formik, FormikProps } from 'formik'
import React, { useState } from 'react'
import { createMelding, mapMeldingToFormValue, updateMelding } from '../../api/MeldingApi'
import { Melding, MeldingStatus, MeldingType } from '../../constants'
import { TextAreaField } from '../common/Inputs'
import Button from '../common/Button'
import { eyeSlash } from '../Images'
import { borderColor } from '../common/Style'
import { ettlevColors, theme } from '../../util/theme'
import { Spinner } from '../common/Spinner'

export const EditMelding = ({ melding, setMelding, isLoading, maxChar }: { melding: Partial<Melding>, setMelding: Function, isLoading: boolean, maxChar?: number }) => {

  const [disableEdit, setDisableEdit] = useState<boolean>(false)

  const submit = async (melding: Melding) => {

    setDisableEdit(true)
    if (melding.id) {
      await updateMelding(melding).then((m) => {
        setMelding(m)
        setDisableEdit(false)
      })
    } else {
      await createMelding(melding).then((m) => {
        setMelding(m)
        setDisableEdit(false)
      })
    }
  }

  if (isLoading) {
    return (
      <Block display="flex" justifyContent="center">
        <Spinner size={theme.sizing.scale2400} />
      </Block>
      )
  }

  return (
    <Block>
      <Formik
        onSubmit={submit}
        initialValues={mapMeldingToFormValue(melding)}
        validateOnChange={false}
        validateOnBlur={false}
      >
        {(
          { values, submitForm }: FormikProps<Melding>
        ) => (
          <Block>
            <TextAreaField maxCharacter={maxChar} markdown height="200px" label={melding.meldingType === MeldingType.SYSTEM ? 'Systemmelding' : 'Forsidemelding'} noPlaceholder name="melding" />

            <Block display="flex" justifyContent="flex-end" width="100%" >
              {melding.meldingStatus === MeldingStatus.ACTIVE &&
                <Button
                  marginRight
                  kind="secondary"
                  disabled={disableEdit}
                  startEnhancer={<img src={eyeSlash} alt="" />}
                  onClick={() => {
                    values.meldingStatus = MeldingStatus.DEACTIVE
                    submitForm()
                  }}
                  $style={{
                    ...borderColor(ettlevColors.grey200)
                  }}
                >
                  Skjul meldingen
                </Button>}
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
    </Block>
  )
}

export default EditMelding
