import {
  Button,
  ErrorSummary,
  Heading,
  List,
  Modal,
  Radio,
  RadioGroup,
  ReadMore,
} from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik } from 'formik'
import React, { useState } from 'react'
import { mapRisikoscenarioToFormValue } from '../../../api/RisikoscenarioApi'
import { IRisikoscenario } from '../../../constants'
import { TextAreaField } from '../../common/Inputs'
import { FormError } from '../../common/ModalSchema'
import { risikoscenarioCreateValidation } from './RisikoscenarioSchemaValidation'

interface IProps {
  headerText: string
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  initialValues: Partial<IRisikoscenario>
  submit: (risikoscenario: IRisikoscenario) => void
}

export const RisikoscenarioModalForm = (props: IProps) => {
  const { headerText, isOpen, setIsOpen, submit, initialValues } = props
  const errorSummaryRef = React.useRef<HTMLDivElement>(null)
  const [validateOnBlur, setValidateOnBlur] = useState(false)

  return (
    <Modal
      width="780px"
      header={{ heading: headerText }}
      open={isOpen}
      onClose={() => setIsOpen(false)}
    >
      <Formik
        validateOnBlur={validateOnBlur}
        validateOnChange={false}
        onSubmit={submit}
        validationSchema={risikoscenarioCreateValidation()}
        initialValues={mapRisikoscenarioToFormValue(initialValues)}
      >
        {({ submitForm, errors }) => (
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
                <h2>
                  <b>Meget lite sannsynlig</b>
                </h2>
                <List>
                  <List.Item>
                    Mindre enn 10 prosent sannsynlig og/eller inntreffer hvert 5. år eller
                    sjeldnere.
                  </List.Item>
                </List>
                <h2>
                  <b>Lite sannsynlig</b>
                </h2>
                <List>
                  <List.Item>
                    10–30 prosent sannsynlig og/eller inntreffer hvert år eller sjeldnere.
                  </List.Item>
                </List>
                <h2>
                  <b>Moderat sannsynlig:</b>
                </h2>
                <List>
                  <List.Item>
                    30–60 prosent sannsynlig og/eller inntreffer 2–4 ganger pr. år.
                  </List.Item>
                </List>
                <h2>
                  <b>Sannsynlig</b>
                </h2>
                <List>
                  <List.Item>60–90 prosent sannsynlig og/eller inntreffer månedelig.</List.Item>
                </List>
                <h2>
                  <b>Nesten sikkert</b>
                </h2>
                <List>
                  <List.Item>Over 90 prosent sannsynlig og/eller inntreffer ukentlig.</List.Item>
                </List>
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
                <h2>
                  <b>Ubetydelig konsekvens</b>
                </h2>
                <List>
                  <List.Item>Forbigående, mindre økonomiske tap for den registrerte</List.Item>
                  <List.Item>Midlertidig og begrenset tap av den registrertes omdømme</List.Item>
                  <List.Item>
                    Den registrertes rett til personvern utfordres i en svært kort periode og uten å
                    involvere særlige kategorier/sårbare grupper
                  </List.Item>
                </List>
                <h2>
                  <b>Lav konsekvens</b>
                </h2>
                <List>
                  <List.Item>
                    Midlertidige eller mindre alvorlige helsemessige konsekvenser for den
                    registrerte
                  </List.Item>
                  <List.Item>Forbigående økonomisk tap for den registrerte</List.Item>
                  <List.Item>Midlertidig eller begrenset tap av den registrertes omdømme</List.Item>
                  <List.Item>
                    Den registrertes rett til personvern utfordres i en kort periode eller uten å
                    involvere særlige kategorier/sårbare grupper
                  </List.Item>
                  <List.Item>Den registrertes tillit til NAV utfordres midlertidig</List.Item>
                </List>
                <h2>
                  <b>Moderat konsekvens</b>
                </h2>
                <List>
                  <List.Item>
                    Midlertidige eller noe mer alvorlige helsemessige konsekvenser for den
                    registrerte
                  </List.Item>
                  <List.Item>Økonomisk tap av noe varighet for den registrerte</List.Item>
                  <List.Item>
                    Midlertidige eller noe alvorlige tap av den registrertes omdømme
                  </List.Item>
                  <List.Item>
                    Den registrertes rett til personvern krenkes i en større periode eller
                    involverer særlige kategorier/sårbare grupper
                  </List.Item>
                  <List.Item>Den registrertes tillit til NAV utfordres</List.Item>
                </List>
                <h2>
                  <b>Alvorlig konsekvens</b>
                </h2>
                <List>
                  <List.Item>
                    Varig eller alvorlige helsemessige konsekvenser for den registrerte
                  </List.Item>
                  <List.Item>Økonomisk tap av betydelig varighet for den registrerte</List.Item>
                  <List.Item>Varig eller alvorlig tap av den registrertes omdømme</List.Item>
                  <List.Item>
                    Den registrertes rett til personvern krenkes alvorlig i en større periode og
                    involverer særlige kategorier/sårbare grupper
                  </List.Item>
                  <List.Item>Den registrerte taper tilleten til NAV</List.Item>
                </List>
                <h2>
                  <b>Svært alvorlig</b>
                </h2>
                <List>
                  <List.Item>Tap av liv for den registrerte</List.Item>
                  <List.Item>
                    Varige og alvorlige helsemessige konsekvenser for den registrerte
                  </List.Item>
                  <List.Item>Varig og betydelig økonomisk tap for den registrerte</List.Item>
                  <List.Item>Varig og alvorlig tap av den registrertes omdømme</List.Item>
                  <List.Item>
                    Den registrertes rett til personvern krenkes på en svært alvorlig måte
                  </List.Item>
                  <List.Item>Den registrerte og samfunnet taper tilliten til NAV</List.Item>
                </List>
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

            {Object.values(errors).some(Boolean) && (
              <div className="mx-5">
                <ErrorSummary
                  ref={errorSummaryRef}
                  heading="Du må rette disse feilene før du kan fortsette"
                >
                  {Object.entries(errors)
                    .filter(([, error]) => error)
                    .map(([key, error]) => (
                      <ErrorSummary.Item href={`#${key}`} key={key}>
                        {error as string}
                      </ErrorSummary.Item>
                    ))}
                </ErrorSummary>
              </div>
            )}

            <Modal.Footer>
              <div className="flex gap-2 mt-5">
                <Button
                  type="button"
                  onClick={() => {
                    errorSummaryRef.current?.focus()
                    setValidateOnBlur(true)
                    submitForm()
                  }}
                >
                  Lagre risikoscenario
                </Button>
                <Button onClick={() => setIsOpen(false)} type="button" variant="secondary">
                  Avbryt, ikke lagre
                </Button>
              </div>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  )
}
export default RisikoscenarioModalForm
