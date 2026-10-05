'use client'

import { Button, LocalAlert, Modal, Radio, RadioGroup } from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik } from 'formik'
import { FunctionComponent, useEffect, useState } from 'react'
import {
  getPvkDokument,
  mapPvkDokumentToFormValue,
  updatePvkDokument,
} from '@/api/pvkDokument/pvkDokumentApi'
import pvkBehovSchema from '@/components/PVK/form/pvkBehovSchema'
import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import { FieldWrapper } from '@/components/common/fieldWrapper/fieldWrapper'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import {
  EPvkVurdering,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'

type TProps = {
  isOpen: boolean
  setIsOpen: (value: boolean) => void
  selectedPvkDokument: string
  setSelectedPvkDokument: (value: string) => void
  selectedEtterlevelsesDokument: string
  setSelectedEtterlevelsesDokument: (value: string) => void
}

const EditPvkDokumentAdmin: FunctionComponent<TProps> = ({
  isOpen,
  setIsOpen,
  selectedPvkDokument,
  setSelectedPvkDokument,
  selectedEtterlevelsesDokument,
  setSelectedEtterlevelsesDokument,
}) => {
  const [pvkDokument, setPvkDokument] = useState<IPvkDokument>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [savedAlert, setSavedAlert] = useState<boolean>(false)

  useEffect(() => {
    ;(async () => {
      if (selectedPvkDokument !== '' && isOpen) {
        setIsLoading(true)
        await getPvkDokument(selectedPvkDokument)
          .then(setPvkDokument)
          .finally(() => setIsLoading(false))
      }
    })()
  }, [selectedPvkDokument, isOpen])

  const submit = async (submitedValues: IPvkDokument): Promise<void> => {
    await getPvkDokument(submitedValues.id).then(async (response) => {
      await updatePvkDokument({
        ...response,
        pvkVurdering: submitedValues.pvkVurdering,
        pvkVurderingsBegrunnelse: submitedValues.pvkVurderingsBegrunnelse,
      })
        .then((response: IPvkDokument) => {
          setPvkDokument(response)
        })
        .finally(() => setSavedAlert(true))
    })
  }

  return (
    <Modal
      open={isOpen}
      onClose={() => {
        setSelectedPvkDokument('')
        setSelectedEtterlevelsesDokument('')
        setIsOpen(false)
      }}
      header={{ heading: 'Rediger Pvk Dokument for ' + selectedEtterlevelsesDokument }}
    >
      {isLoading && <CenteredLoader />}
      {!isLoading && pvkDokument && (
        <Formik
          validateOnChange={false}
          validateOnBlur={false}
          validationSchema={pvkBehovSchema}
          initialValues={mapPvkDokumentToFormValue(pvkDokument)}
          onSubmit={submit}
        >
          {({ submitForm, resetForm, values, isSubmitting }) => (
            <Form>
              <Modal.Body>
                <FieldWrapper marginBottom marginTop>
                  <Field name='pvkVurdering'>
                    {(fieldProps: FieldProps) => (
                      <RadioGroup
                        legend='Hvilken vurdering har dere kommet fram til?'
                        value={fieldProps.field.value}
                        onChange={(value) => {
                          fieldProps.form.setFieldValue('pvkVurdering', value)
                        }}
                      >
                        <Radio
                          value={EPvkVurdering.SKAL_UTFORE}
                          description='Dette valget innebærer innsending av PVK-en til personvernombudets vurdering.'
                        >
                          Vi skal gjennomføre en PVK
                        </Radio>
                        <Radio
                          value={EPvkVurdering.LEGGE_OVER_EKSISTERENDE}
                          description='Dette valget forutsetter at PVK-materien legges inn as-is, og at det dermed ikke er behov for en ny vurdering hos personvernombudet. Det blir imidlertid mulig for risikoeier å godkjenne PVK-en digitalt.'
                        >
                          Vi skal legge over en eksisterende, godkjent PVK fra Word
                        </Radio>
                        <Radio value={EPvkVurdering.ALLEREDE_UTFORT}>
                          Vi beholder vår eksisterende, godkjente PVK i Word
                        </Radio>
                      </RadioGroup>
                    )}
                  </Field>
                </FieldWrapper>

                {values.pvkVurdering !== EPvkVurdering.UNDEFINED &&
                  values.pvkVurdering !== EPvkVurdering.SKAL_UTFORE && (
                    <TextAreaField
                      rows={5}
                      noPlaceholder
                      label='Begrunn vurderingen deres'
                      name='pvkVurderingsBegrunnelse'
                    />
                  )}

                {savedAlert && (
                  <LocalAlert className='mt-5' status='success'>
                    <LocalAlert.Header>
                      <LocalAlert.Title>Lagring vellykket</LocalAlert.Title>
                      <LocalAlert.CloseButton onClick={() => setSavedAlert(false)} />
                    </LocalAlert.Header>
                  </LocalAlert>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button
                  as='button'
                  disabled={isSubmitting}
                  onClick={async () => {
                    await submitForm()
                  }}
                >
                  Lagre
                </Button>
                <Button
                  as='button'
                  variant='secondary'
                  onClick={() => {
                    setSelectedEtterlevelsesDokument('')
                    setSelectedPvkDokument('')
                    setIsOpen(false)
                    resetForm()
                  }}
                >
                  Lukk
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      )}
    </Modal>
  )
}

export default EditPvkDokumentAdmin
