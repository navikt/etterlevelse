import { mapRisikoscenarioToFormValue } from '@/api/risikoscenario/risikoscenarioApi'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { Button, ErrorSummary, Modal } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import _ from 'lodash'
import { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react'
import { OvrigToKravSpesifikkRisikoscenarioField } from './field/ovrigToKravSpesifikkRisikoscenarioField'
import RisikoscenarioKonsekvensnivaaField from './field/risikoscenarioKonsekvensnivaaField'
import RisikoscenarioSannsynlighetField from './field/risikoscenarioSannsynlighetField'
import { risikoscenarioCreateValidation } from './risikoscenarioSchema'

type TProps = {
  headerText: string
  mode: 'create' | 'update'
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  initialValues: Partial<IRisikoscenario>
  submit: (risikoscenario: IRisikoscenario) => void
}

export const RisikoscenarioModalForm: FunctionComponent<TProps> = ({
  headerText,
  isOpen,
  mode,
  setIsOpen,
  submit,
  initialValues,
}) => {
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const formRef: RefObject<any> = useRef(undefined)
  const [validateOnBlur, setValidateOnBlur] = useState(false)
  const [submitClick, setSubmitClick] = useState<boolean>(false)

  useEffect(() => {
    if (!_.isEmpty(formRef?.current.errors) && errorSummaryRef.current) {
      errorSummaryRef.current.focus()
    }
  }, [submitClick])

  return (
    <Modal
      width='780px'
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
        innerRef={formRef}
      >
        {({ submitForm, errors, values }) => (
          <Form>
            <Modal.Body className='flex-1 min-h-0 overflow-auto'>
              <>
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
              </>

              <RisikoscenarioSannsynlighetField />

              <RisikoscenarioKonsekvensnivaaField />

              {mode === 'update' && (
                <OvrigToKravSpesifikkRisikoscenarioField
                  generelScenarioFormValue={values.generelScenario}
                  relevanteKravNummerFormValue={values.relevanteKravNummer}
                  isOvrigScenario={!!initialValues.generelScenario}
                />
              )}
            </Modal.Body>

            {!_.isEmpty(errors) && (
              <div className='mx-5'>
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

            <Modal.Footer>
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
                <Button onClick={() => setIsOpen(false)} type='button' variant='secondary'>
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
