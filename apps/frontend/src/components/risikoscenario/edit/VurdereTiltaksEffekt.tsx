import { Button } from '@navikt/ds-react'
import { Form, Formik } from 'formik'
import { useState } from 'react'
import { mapRisikoscenarioToFormValue } from '../../../api/RisikoscenarioApi'
import { IRisikoscenario } from '../../../constants'

interface IProps {
  risikoscenario: IRisikoscenario
  setRisikoscenario: (state: IRisikoscenario) => void
}

export const VurdereTiltaksEffekt = (props: IProps) => {
  const { risikoscenario } = props
  const [isFormActive, setIsFormActive] = useState<boolean>(false)

  const submit = async (risikoscenario: IRisikoscenario) => {
    console.debug(risikoscenario)
    setIsFormActive(false)
  }

  return (
    <div>
      {!isFormActive && (
        <Button type="button" onClick={() => setIsFormActive(true)}>
          Vurdér tiltakenes effekt
        </Button>
      )}

      {isFormActive && (
        <Formik onSubmit={submit} initialValues={mapRisikoscenarioToFormValue(risikoscenario)}>
          {({ submitForm }) => (
            <Form>
              <div className="flex gap-2">
                <Button type="button" onClick={() => submitForm()}>
                  Lagre
                </Button>

                <Button type="button" onClick={() => setIsFormActive(false)}>
                  Avbryt
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      )}
    </div>
  )
}
export default VurdereTiltaksEffekt
