import { Alert, Button, Label } from '@navikt/ds-react'
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
  const revurdertEffektCheck =
    risikoscenario.sannsynlighetsNivaaEtterTiltak === 0 ||
    risikoscenario.sannsynlighetsNivaaEtterTiltak === null ||
    risikoscenario.konsekvensNivaaEtterTiltak === 0 ||
    risikoscenario.konsekvensNivaaEtterTiltak === null

  const submit = async (risikoscenario: IRisikoscenario) => {
    console.debug(risikoscenario)
    setIsFormActive(false)
  }

  return (
    <div>
      {!isFormActive && (
        <div className="mt-5">
          <Label>Antatt risikonivå etter gjennomførte tiltak </Label>

          {revurdertEffektCheck && (
            <Alert className="mt-3" variant="warning">
              Du må vurdere tiltakenes effekt
            </Alert>
          )}
        </div>
      )}

      {!isFormActive && (
        <Button className="mt-3" type="button" onClick={() => setIsFormActive(true)}>
          Vurdér tiltakenes effekt
        </Button>
      )}

      {isFormActive && (
        <Formik onSubmit={submit} initialValues={mapRisikoscenarioToFormValue(risikoscenario)}>
          {({ submitForm }) => (
            <Form>
              <div className="mt-5">
                <Label>Vurdér tiltakenes antatte effekt på risikoscenarionivået</Label>
              </div>
              <div className="flex gap-2 mt-3">
                <Button type="button" onClick={() => submitForm()}>
                  Lagre
                </Button>

                <Button type="button" variant="secondary" onClick={() => setIsFormActive(false)}>
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
