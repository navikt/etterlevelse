import { Button, Heading, Modal, Radio, RadioGroup, ReadMore } from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik } from 'formik'
import { useState } from 'react'
import { mapRisikoscenarioToFormValue } from '../../../api/RisikoscenarioApi'
import { IRisikoscenario } from '../../../constants'
import { TextAreaField } from '../../common/Inputs'
import { FormError } from '../../common/ModalSchema'
import { risikoscenarioCreateValidation } from './RisikoscenarioSchemaValidation'

interface IProps {
  onSubmitStateUpdate?: (risikoscenario: IRisikoscenario) => void
}

export const CreateRisikoscenario = (props: IProps) => {
  const { onSubmitStateUpdate } = props
  const [isEdit, setIsEdit] = useState<boolean>(false)

  const submit = (risikoscenario: IRisikoscenario) => {
    console.debug(risikoscenario)
    if (onSubmitStateUpdate) {
      onSubmitStateUpdate(risikoscenario)
    }
    setIsEdit(false)
  }

  return (
    <div className="mt-5">
      {!isEdit && (
        <Button onClick={() => setIsEdit(true)} variant="secondary">
          Opprett nytt øvrig risikoscenario
        </Button>
      )}

      {isEdit && (
        <Modal
          width="780px"
          header={{ heading: 'Opprett nytt øvirg risikoscenario' }}
          open={isEdit}
          onClose={() => setIsEdit(false)}
        >
          <Formik
            validateOnBlur={false}
            validateOnChange={false}
            onSubmit={submit}
            validationSchema={risikoscenarioCreateValidation()}
            initialValues={mapRisikoscenarioToFormValue({ generelScenario: true })}
          >
            {({ submitForm }) => (
              <Form>
                <Modal.Body>
                  <TextAreaField
                    rows={1}
                    name="navn"
                    label="Navngi risikoscenarioet"
                    caption="Velg et navn som gjør scenarioet lett å skille fra andre "
                  />

                  <div className="mt-3">
                    <TextAreaField
                      rows={3}
                      noPlaceholder
                      label="Beskriv risikoscenarioet"
                      name="beskrivelse"
                    />
                  </div>

                  <Heading level="2" size="small" className="my-5">
                    Risikoscenarioets sannsynlighet
                  </Heading>

                  <ReadMore header="Hva menes med de ulike sannsynlighetsnivåene?" className="my-5">
                    ???????? WIP
                  </ReadMore>

                  <Field name="sannsynlighetsNivaa">
                    {(fieldProps: FieldProps) => (
                      <RadioGroup
                        legend="Vurdér risikoscenarioets sannsynlighetsnivå"
                        value={fieldProps.field.value}
                        onChange={(value) => {
                          fieldProps.form.setFieldValue('sannsynlighetsNivaa', value)
                        }}
                        error={
                          fieldProps.form.errors['sannsynlighetsNivaa'] && (
                            <FormError fieldName={'sannsynlighetsNivaa'} />
                          )
                        }
                      >
                        <Radio value={1}>Meget lite sannsynlig</Radio>
                        <Radio value={2}>Lite sannsynlig</Radio>
                        <Radio value={3}>Moderat sannsynlig</Radio>
                        <Radio value={4}>Sannsynlig</Radio>
                        <Radio value={5}>Nesten sikkert</Radio>
                      </RadioGroup>
                    )}
                  </Field>

                  <div className="mt-3">
                    <TextAreaField
                      rows={3}
                      noPlaceholder
                      label="Begrunn sannsynlighetsnivået"
                      name="sannsynlighetsNivaaBegrunnelse"
                    />
                  </div>

                  <Heading level="2" size="small" className="my-5">
                    Risikoscenarioets konsekvensnivå
                  </Heading>

                  <ReadMore header="Hva menes med de ulike konsekvensnivåene?" className="my-5">
                    ???????? WIP
                  </ReadMore>

                  <Field name="konsekvensNivaa">
                    {(fieldProps: FieldProps) => (
                      <RadioGroup
                        legend="Vurdér risikoscenarioets konsekvensnivå"
                        value={fieldProps.field.value}
                        onChange={(value) => {
                          fieldProps.form.setFieldValue('konsekvensNivaa', value)
                        }}
                        error={
                          fieldProps.form.errors['konsekvensNivaa'] && (
                            <FormError fieldName={'konsekvensNivaa'} />
                          )
                        }
                      >
                        <Radio value={1}>Ubetydelig</Radio>
                        <Radio value={2}>Lav konsekvens</Radio>
                        <Radio value={3}>Moderat konsekvens</Radio>
                        <Radio value={4}>Alvorlig konsekvens</Radio>
                        <Radio value={5}>Svært alvorlig konsekvens</Radio>
                      </RadioGroup>
                    )}
                  </Field>

                  <div className="mt-3">
                    <TextAreaField
                      rows={3}
                      noPlaceholder
                      label="Begrunn konsekvensnivået"
                      name="konsekvensNivaaBegrunnelse"
                    />
                  </div>
                </Modal.Body>

                <Modal.Footer>
                  <div className="flex gap-2 mt-5">
                    <Button type="button" onClick={() => submitForm()}>
                      Lagre risikoscenario
                    </Button>
                    <Button onClick={() => setIsEdit(false)} type="button" variant="secondary">
                      Avbryt, ikke lagre
                    </Button>
                  </div>
                </Modal.Footer>
              </Form>
            )}
          </Formik>
        </Modal>
      )}
    </div>
  )
}

export default CreateRisikoscenario
