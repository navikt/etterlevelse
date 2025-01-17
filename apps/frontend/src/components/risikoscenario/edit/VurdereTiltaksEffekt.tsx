import { Button } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import { mapRisikoscenarioToFormValue } from '../../../api/RisikoscenarioApi'
import { IRisikoscenario } from '../../../constants'

interface IProps {
  risikoscenario: IRisikoscenario
  setRisikoscenario: (state: IRisikoscenario) => void
}

export const VurdereTiltaksEffekt = (props: IProps) => {
  const { risikoscenario } = props

  const submit = async (risikoscenario: IRisikoscenario) => {
    console.debug(risikoscenario)
  }

  return (
    <Formik onSubmit={submit} initialValues={mapRisikoscenarioToFormValue(risikoscenario)}>
      {({ submitForm }) => (
        <Form>
          <div>
            <Button type="button" onClick={() => submitForm()}>
              Lagre
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}
export default VurdereTiltaksEffekt
