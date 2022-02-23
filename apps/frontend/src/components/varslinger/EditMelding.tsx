import {Block} from 'baseui/block'
import {Formik, FormikProps} from 'formik'
import React, {useState} from 'react'
import {createMelding, mapMeldingToFormValue, updateMelding} from '../../api/MeldingApi'
import {Melding, MeldingStatus, MeldingType} from '../../constants'
import {TextAreaField} from '../common/Inputs'
import Button from "../common/Button";

export const EditMelding = ({meldingType, melding, setMelding}: { meldingType: MeldingType, melding: Partial<Melding>, setMelding: Function }) => {

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

  return (
    <Block>
      <Formik
        onSubmit={submit}
        initialValues={mapMeldingToFormValue(melding)}
        validateOnChange={false}
        validateOnBlur={false}
      >
        {(
          {values, submitForm}: FormikProps<Melding>
        ) => (
          <Block>
            <TextAreaField markdown height="200px" label={meldingType === MeldingType.SYSTEM ? 'Systemmelding' : 'Forsidemelding'} noPlaceholder name="melding"/>
            <Button onClick={() => {
              values.meldingStatus = MeldingStatus.ACTIVE
              submitForm()
            }}>Publiser</Button>
          </Block>
        )}
      </Formik>
    </Block>
  )
}

export default EditMelding
