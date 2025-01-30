import { Button, Chips, Select, VStack } from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik } from 'formik'
import { RefObject, useEffect, useState } from 'react'
import { updateKravForRisikoscenarioer } from '../../../api/RisikoscenarioApi'
import { IKravRisikoscenarioRelasjon, IRisikoscenario } from '../../../constants'

interface IProps {
  kravnummer: number
  risikoscenarioer: IRisikoscenario[]
  setRisikoscenarioer: (state: IRisikoscenario[]) => void
  risikoscenarioForKrav: IRisikoscenario[]
  setRisikoscenarioForKrav: (state: IRisikoscenario[]) => void
  setIsLeggTilEksisterendeMode: (state: boolean) => void
  formRef: RefObject<any>
}

export const LeggTilEksisterendeRisikoscenario = (props: IProps) => {
  const {
    kravnummer,
    risikoscenarioer,
    setRisikoscenarioer,
    risikoscenarioForKrav,
    setRisikoscenarioForKrav,
    setIsLeggTilEksisterendeMode,
    formRef,
  } = props
  const [selectedRisikoscenarioer, setSelectedRisikoscenarioer] = useState<string[]>([])

  const addRisikoscenario = (risikoscenarioId: string, fieldProps: FieldProps) => {
    const existingId = selectedRisikoscenarioer.filter(
      (selectedRisikoscenario) => selectedRisikoscenario === risikoscenarioId
    )
    if (existingId.length === 0) {
      setSelectedRisikoscenarioer([...selectedRisikoscenarioer, risikoscenarioId])
      fieldProps.form.setFieldValue('risikoscenarioIder', [
        ...selectedRisikoscenarioer,
        risikoscenarioId,
      ])
    }
  }

  const removeRisikoscenario = (risikoscenarioId: string, fieldProps: FieldProps) => {
    const updatedScenario = selectedRisikoscenarioer.filter((id) => id !== risikoscenarioId)
    setSelectedRisikoscenarioer([...updatedScenario])
    fieldProps.form.setFieldValue('risikoscenarioIder', [...updatedScenario])
  }

  const submit = async (request: IKravRisikoscenarioRelasjon) => {
    await updateKravForRisikoscenarioer(request).then((response) => {
      setRisikoscenarioer(
        risikoscenarioer.filter(
          (risikoscenario) => !selectedRisikoscenarioer.includes(risikoscenario.id)
        )
      )
      setRisikoscenarioForKrav([...risikoscenarioForKrav, ...response])
    })
  }

  useEffect(() => {
    setTimeout(() => {
      const element = document.getElementById('kravTitle')
      if (element) {
        element.scrollIntoView({ behavior: 'instant' })
      }
    }, 200)
  }, [])

  return (
    <div>
      <Formik
        onSubmit={(values) => {
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
                  label="Legg til eksisterende risikoscenario"
                  onChange={(event) => {
                    if (event.target.value) {
                      addRisikoscenario(event.target.value, fieldProps)
                    }
                  }}
                >
                  <option value=""></option>
                  {risikoscenarioer.map((risikoscenario) => {
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
                <VStack gap="10" className="mt-3">
                  <Chips>
                    {selectedRisikoscenarioer.map((selectedRisikoscenario) => {
                      const data = risikoscenarioer.filter(
                        (risikoscenario) => risikoscenario.id === selectedRisikoscenario
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

            <div className="mt-5 flex gap-2">
              <Button type="button" onClick={submitForm}>
                Lagre
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsLeggTilEksisterendeMode(false)}
              >
                avbyrt
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}
export default LeggTilEksisterendeRisikoscenario
