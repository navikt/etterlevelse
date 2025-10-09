import { mapRisikoscenarioToFormValue } from '@/api/risikoscenario/risikoscenarioApi'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { Button, ErrorSummary } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import _ from 'lodash'
import { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react'
import { RisikoscenarioKonsekvensnivaaField } from './field/risikoscenarioKonsekvensnivaaField'
import RisikoscenarioSannsynlighetField from './field/risikoscenarioSannsynlighetField'
import { risikoscenarioCreateValidation } from './risikoscenarioSchema'

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
  const [submitClick, setSubmitClick] = useState<boolean>(false)

  useEffect(() => {
    if (!_.isEmpty(formRef?.current.errors) && errorSummaryRef.current) {
      errorSummaryRef.current.focus()
    }
  }, [submitClick])

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
              <TextAreaField
                rows={1}
                name='navn'
                label='Navngi risikoscenarioet'
                noPlaceholder
                caption='Velg et navn som gjør scenarioet lett å skille fra andre'
              />

              <div className='mt-3'>
                <TextAreaField
                  rows={3}
                  noPlaceholder
                  label='Beskriv risikoscenarioet'
                  name='beskrivelse'
                />
              </div>

              <RisikoscenarioSannsynlighetField />

              <RisikoscenarioKonsekvensnivaaField />
            </div>

            {!_.isEmpty(errors) && (
              <div className='mt-5'>
                <ErrorSummary
                  ref={errorSummaryRef}
                  heading='Du må rette disse feilene før du kan fortsette'
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

            <div className='flex gap-2 mt-5'>
              <Button
                type='button'
                onClick={async () => {
                  errorSummaryRef.current?.focus()
                  setValidateOnBlur(true)
                  await submitForm()
                  setSubmitClick(!submitClick)
                }}
              >
                Lagre risikoscenario
              </Button>
              <Button onClick={() => onClose()} type='button' variant='secondary'>
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
