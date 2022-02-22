import { Block } from 'baseui/block'
import { Formik, FormikProps } from 'formik'
import React, { useEffect, useState } from 'react'
import { createMelding, getMeldingByType, mapMeldingToFormValue, updateMelding } from '../../api/MeldingApi'
import { Melding, MeldingStatus, MeldingType } from '../../constants'
import { TextAreaField } from '../common/Inputs'

export const EditMelding = ({ meldingType }: { meldingType: MeldingType }) => {

  const [melding, setMelding] = useState<Partial<Melding>>({ melding: '', meldingType: meldingType, meldingStatus: MeldingStatus.DEACTIVE })
  const [disableEdit, setDisableEdit] = useState<boolean>(false)

  useEffect(() => {
    (async () => {
      getMeldingByType(meldingType).then((m) => {
        if (m.numberOfElements > 0) {
          setMelding(m.content[0])
        }
      })
    })()
  }, [])

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
        <TextAreaField markdown height="200px" label={meldingType === MeldingType.SYSTEM ? 'Systemmelding' : 'Forsidemelding'} noPlaceholder name="melding" />
      </Formik>
    </Block>
  )
}

export default EditMelding