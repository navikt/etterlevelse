import { Button, Chips, Select, VStack } from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik } from 'formik'
import { RefObject, useState } from 'react'
import { IRisikoscenario, ITiltak, ITiltakRisikoscenarioRelasjon } from '../../../constants'

interface IProps {
  risikoscenario: IRisikoscenario
  tiltakList: ITiltak[]
  setIsAddExisitingMode: (state: boolean) => void
  submit: (request: ITiltakRisikoscenarioRelasjon) => void
  formRef?: RefObject<any>
}

export const LeggTilEksisterendeTiltak = (props: IProps) => {
  const { risikoscenario, tiltakList, setIsAddExisitingMode, submit, formRef } = props
  const [selectedTiltak, setSelectedTiltak] = useState<string[]>([])

  const addTiltak = (tiltakId: string, fieldProps: FieldProps) => {
    const existingId = selectedTiltak.filter((id) => id === tiltakId)
    if (existingId.length === 0) {
      setSelectedTiltak([...selectedTiltak, tiltakId])
      fieldProps.form.setFieldValue('tiltakIds', [...selectedTiltak, tiltakId])
    }
  }

  const removeTiltak = (tiltakId: string, fieldProps: FieldProps) => {
    const updatedTiltak = selectedTiltak.filter((id) => id !== tiltakId)
    setSelectedTiltak([...updatedTiltak])
    fieldProps.form.setFieldValue('tiltakIds', [...updatedTiltak])
  }

  return (
    <div className='mt-5'>
      <Formik
        onSubmit={submit}
        initialValues={
          { risikoscenarioId: risikoscenario.id, tiltakIds: [] } as ITiltakRisikoscenarioRelasjon
        }
        innerRef={formRef}
      >
        {({ submitForm }) => (
          <Form>
            <Field>
              {(fieldProps: FieldProps) => (
                <Select
                  label='Legg til eksisterende tiltak'
                  onChange={(event) => {
                    if (event.target.value) {
                      addTiltak(event.target.value, fieldProps)
                    }
                  }}
                >
                  <option value=''></option>
                  {tiltakList
                    .filter((tiltak) => !risikoscenario.tiltakIds.includes(tiltak.id))
                    .map((risikoscenario) => {
                      return (
                        <option key={risikoscenario.id} value={risikoscenario.id}>
                          {risikoscenario.navn}
                        </option>
                      )
                    })}
                </Select>
              )}
            </Field>

            <Field>
              {(fieldProps: FieldProps) => (
                <VStack gap='10' className='mt-3'>
                  <Chips>
                    {selectedTiltak.map((selectedTiltak) => {
                      const data = tiltakList.filter((tiltak) => tiltak.id === selectedTiltak)
                      return (
                        <Chips.Removable
                          key={selectedTiltak}
                          onClick={() => {
                            removeTiltak(selectedTiltak, fieldProps)
                          }}
                        >
                          {data[0].navn}
                        </Chips.Removable>
                      )
                    })}
                  </Chips>
                </VStack>
              )}
            </Field>

            <div className='flex gap-2 mt-5'>
              <Button type='button' onClick={submitForm}>
                Lagre
              </Button>
              <Button
                type='button'
                variant='secondary'
                onClick={() => setIsAddExisitingMode(false)}
              >
                Avbryt
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}
export default LeggTilEksisterendeTiltak
