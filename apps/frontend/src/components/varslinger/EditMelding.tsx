import { Block } from 'baseui/block'
import { Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { createMelding, getMeldingByType, mapMeldingToFormValue, updateMelding } from '../../api/MeldingApi'
import { Melding, MeldingStatus, MeldingType } from '../../constants'

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
      await updateMelding(melding).then(() => setDisableEdit(false))
    } else {
      await createMelding(melding).then(() => setDisableEdit(false))
    }
  }

  return (
    <Block>
      <Formik
        onSubmit={submit}
        initialValues={mapMeldingToFormValue(melding)}
      >

      </Formik>
    </Block>
  )
}

export default EditMelding