'use client'

import { updateKravForRisikoscenarioer } from '@/api/risikoscenario/risikoscenarioApi'
import {
  IKravRisikoscenarioRelasjon,
  IRisikoscenario,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { Button, Chips, Select, VStack } from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik } from 'formik'
import { ChangeEvent, FunctionComponent, RefObject, useEffect, useState } from 'react'

type TProps = {
  kravnummer: number
  risikoscenarioer: IRisikoscenario[]
  setRisikoscenarioer: (state: IRisikoscenario[]) => void
  risikoscenarioForKrav: IRisikoscenario[]
  setRisikoscenarioForKrav: (state: IRisikoscenario[]) => void
  setIsLeggTilEksisterendeMode: (state: boolean) => void
  formRef: RefObject<any>
}

export const LeggTilEksisterendeRisikoscenario: FunctionComponent<TProps> = ({
  kravnummer,
  risikoscenarioer,
  setRisikoscenarioer,
  risikoscenarioForKrav,
  setRisikoscenarioForKrav,
  setIsLeggTilEksisterendeMode,
  formRef,
}) => {
  const [selectedRisikoscenarier, setSelectedRisikoscenarier] = useState<string[]>([])

  const addRisikoscenario = (risikoscenarioId: string, fieldProps: FieldProps): void => {
    const existingId: string[] = selectedRisikoscenarier.filter(
      (selectedRisikoscenario) => selectedRisikoscenario === risikoscenarioId
    )
    if (existingId.length === 0) {
      setSelectedRisikoscenarier([...selectedRisikoscenarier, risikoscenarioId])
      fieldProps.form.setFieldValue('risikoscenarioIder', [
        ...selectedRisikoscenarier,
        risikoscenarioId,
      ])
    }
  }

  const removeRisikoscenario = (risikoscenarioId: string, fieldProps: FieldProps): void => {
    const updatedScenario: string[] = selectedRisikoscenarier.filter(
      (id: string) => id !== risikoscenarioId
    )
    setSelectedRisikoscenarier([...updatedScenario])
    fieldProps.form.setFieldValue('risikoscenarioIder', [...updatedScenario])
  }

  const submit = async (request: IKravRisikoscenarioRelasjon): Promise<void> => {
    await updateKravForRisikoscenarioer(request).then((response) => {
      setRisikoscenarioer(
        risikoscenarioer.filter(
          (risikoscenario: IRisikoscenario) => !selectedRisikoscenarier.includes(risikoscenario.id)
        )
      )
      setRisikoscenarioForKrav([...risikoscenarioForKrav, ...response])
    })
  }

  useEffect(() => {
    setTimeout(() => {
      const element: HTMLElement | null = document.getElementById('kravTitle')

      if (element) {
        element.scrollIntoView({ behavior: 'instant' })
      }
    }, 200)
  }, [])

  return (
    <div>
      <Formik
        onSubmit={(values: IKravRisikoscenarioRelasjon) => {
          submit(values)
          setIsLeggTilEksisterendeMode(false)
        }}
        initialValues={
          { kravnummer: kravnummer, risikoscenarioIder: [] } as IKravRisikoscenarioRelasjon
        }
        innerRef={formRef}
      >
        {({ submitForm }) => (
          <Form>
            <Field>
              {(fieldProps: FieldProps) => (
                <Select
                  label='Legg til eksisterende risikoscenario'
                  onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                    if (event.target.value) {
                      addRisikoscenario(event.target.value, fieldProps)
                    }
                  }}
                >
                  <option value=''></option>
                  {risikoscenarioer.map((risikoscenario: IRisikoscenario) => (
                    <option key={risikoscenario.id} value={risikoscenario.id}>
                      {risikoscenario.navn}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <Field>
              {(fieldProps: FieldProps) => (
                <VStack gap='space-12' className='mt-3'>
                  <Chips>
                    {selectedRisikoscenarier.map((selectedRisikoscenario: string) => {
                      const data: IRisikoscenario[] = risikoscenarioer.filter(
                        (risikoscenario: IRisikoscenario) =>
                          risikoscenario.id === selectedRisikoscenario
                      )
                      return (
                        <Chips.Removable
                          key={selectedRisikoscenario}
                          onClick={() => {
                            removeRisikoscenario(selectedRisikoscenario, fieldProps)
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

            <div className='mt-5 flex gap-2'>
              <Button type='button' onClick={submitForm}>
                Lagre
              </Button>

              <Button
                type='button'
                variant='secondary'
                onClick={() => setIsLeggTilEksisterendeMode(false)}
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

export default LeggTilEksisterendeRisikoscenario
