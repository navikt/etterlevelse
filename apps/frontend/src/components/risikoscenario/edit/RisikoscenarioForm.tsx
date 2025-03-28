import { Button, ErrorSummary } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import { FunctionComponent, RefObject, useRef, useState } from 'react'
import { mapRisikoscenarioToFormValue } from '../../../api/RisikoscenarioApi'
import { IRisikoscenario } from '../../../constants'
import { RisikoscenarioKonsekvensnivaaField } from './RisikoscenarioKonsekvensnivaaField/RisikoscenarioKonsekvensnivaaField'
import { RisikoscenarioNavnBeskrivelseField } from './RisikoscenarioNavnBeskrivelseField/RisikoscenarioNavnBeskrivelseField'
import RisikoscenarioSannsynlighet from './RisikoscenarioSannsynlighet/RisikoscenarioSannsynlighet'
import { risikoscenarioCreateValidation } from './RisikoscenarioSchemaValidation'

type TProps = {
  initialValues: Partial<IRisikoscenario>
  submit: (risikoscenario: IRisikoscenario) => void
  onClose: () => void
  formRef: RefObject<any>
}

export const RisikoscenarioForm: FunctionComponent<TProps> = ({
  initialValues,
  submit,
  onClose,
  formRef,
}) => {
  const errorSummaryRef: RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null)
  const [validateOnBlur, setValidateOnBlur] = useState(false)

  return (
    <div>
      <Formik
        validateOnBlur={validateOnBlur}
        validateOnChange={false}
        onSubmit={submit}
        validationSchema={risikoscenarioCreateValidation()}
        initialValues={mapRisikoscenarioToFormValue(initialValues)}
        innerRef={formRef}
      >
        {({ submitForm, errors }) => (
          <Form>
            <div>
              <RisikoscenarioNavnBeskrivelseField />

              <RisikoscenarioSannsynlighet />

              <RisikoscenarioKonsekvensnivaaField />
            </div>

            {Object.values(errors).some(Boolean) && (
              <div className="mt-5">
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
              <Button onClick={() => onClose()} type="button" variant="secondary">
                Avbryt, ikke lagre
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default RisikoscenarioForm
