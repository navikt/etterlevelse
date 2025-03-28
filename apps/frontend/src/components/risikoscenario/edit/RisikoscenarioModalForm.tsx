import { Button, ErrorSummary, Modal } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import { FunctionComponent, useRef, useState } from 'react'
import { mapRisikoscenarioToFormValue } from '../../../api/RisikoscenarioApi'
import { IRisikoscenario } from '../../../constants'
import { RisikoscenarioKonsekvensnivaaField } from './RisikoscenarioKonsekvensnivaaField/RisikoscenarioKonsekvensnivaaField'
import { RisikoscenarioNavnBeskrivelseField } from './RisikoscenarioNavnBeskrivelseField/RisikoscenarioNavnBeskrivelseField'
import { RisikoscenarioSannsynlighet } from './RisikoscenarioSannsynlighet/RisikoscenarioSannsynlighet'
import { risikoscenarioCreateValidation } from './RisikoscenarioSchemaValidation'

type TProps = {
  headerText: string
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  initialValues: Partial<IRisikoscenario>
  submit: (risikoscenario: IRisikoscenario) => void
}

export const RisikoscenarioModalForm: FunctionComponent<TProps> = ({
  headerText,
  isOpen,
  setIsOpen,
  submit,
  initialValues,
}) => {
  const errorSummaryRef = useRef<HTMLDivElement>(null)
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
              <RisikoscenarioNavnBeskrivelseField />

              <RisikoscenarioSannsynlighet />

              <RisikoscenarioKonsekvensnivaaField />
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
