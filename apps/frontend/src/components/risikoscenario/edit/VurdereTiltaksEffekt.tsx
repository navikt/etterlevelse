import { PencilIcon } from '@navikt/aksel-icons'
import { Alert, BodyLong, Button, Label, Radio, RadioGroup, Stack } from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik } from 'formik'
import { useState } from 'react'
import {
  getRisikoscenario,
  mapRisikoscenarioToFormValue,
  updateRisikoscenario,
} from '../../../api/RisikoscenarioApi'
import { IRisikoscenario } from '../../../constants'
import { TextAreaField } from '../../common/Inputs'
import { FormError } from '../../common/ModalSchema'
import ReadMoreKonsekvensnivaa from '../ReadMoreKonsekvensnivaa'
import ReadMoreSannsynlighetsnivaa from '../ReadMoreSannsynlighetsnivaa'
import RisikoscenarioTag, {
  getKonsekvenssnivaaText,
  getSannsynlighetsnivaaText,
} from '../RisikoscenarioTag'

interface IProps {
  risikoscenario: IRisikoscenario
  setRisikoscenario: (state: IRisikoscenario) => void
}

export const VurdereTiltaksEffekt = (props: IProps) => {
  const { risikoscenario, setRisikoscenario } = props
  const [isFormActive, setIsFormActive] = useState<boolean>(false)
  const revurdertEffektCheck =
    risikoscenario.sannsynlighetsNivaaEtterTiltak === 0 ||
    risikoscenario.sannsynlighetsNivaaEtterTiltak === null ||
    risikoscenario.konsekvensNivaaEtterTiltak === 0 ||
    risikoscenario.konsekvensNivaaEtterTiltak === null

  const submit = async (submitedValues: IRisikoscenario) => {
    await getRisikoscenario(risikoscenario.id).then((response) => {
      const updatedRisikoscenario = {
        ...submitedValues,
        ...response,
        sannsynlighetsNivaaEtterTiltak: submitedValues.sannsynlighetsNivaaEtterTiltak,
        konsekvensNivaaEtterTiltak: submitedValues.konsekvensNivaaEtterTiltak,
        nivaaBegrunnelseEtterTiltak: submitedValues.nivaaBegrunnelseEtterTiltak,
      }

      updateRisikoscenario(updatedRisikoscenario).then((response) => {
        setRisikoscenario(response)
        setIsFormActive(false)
      })
    })
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

          {!revurdertEffektCheck && (
            <div className="mt-3">
              <RisikoscenarioTag
                level={risikoscenario.sannsynlighetsNivaaEtterTiltak}
                text={getSannsynlighetsnivaaText(risikoscenario.sannsynlighetsNivaaEtterTiltak)}
              />

              <div className="mt-3">
                <RisikoscenarioTag
                  level={risikoscenario.konsekvensNivaaEtterTiltak}
                  text={getKonsekvenssnivaaText(risikoscenario.konsekvensNivaaEtterTiltak)}
                />
              </div>
              <BodyLong className="mt-3">{risikoscenario.nivaaBegrunnelseEtterTiltak}</BodyLong>
            </div>
          )}
        </div>
      )}

      {!isFormActive && (
        <Button
          className="mt-3"
          type="button"
          variant={revurdertEffektCheck ? 'primary' : 'tertiary'}
          onClick={() => setIsFormActive(true)}
          icon={revurdertEffektCheck ? undefined : <PencilIcon aria-hidden title="" />}
        >
          {revurdertEffektCheck ? 'Vurdér tiltakenes effekt' : 'Redigér tiltakenes effekt'}
        </Button>
      )}

      {isFormActive && (
        <Formik onSubmit={submit} initialValues={mapRisikoscenarioToFormValue(risikoscenario)}>
          {({ submitForm }) => (
            <Form>
              <div className="mt-5">
                <Label>Vurdér tiltakenes antatte effekt på risikoscenarionivået</Label>
              </div>

              <Field name="sannsynlighetsNivaaEtterTiltak">
                {(fieldProps: FieldProps) => (
                  <RadioGroup
                    className="mt-3"
                    legend="Beskriv risikoscenarioets antatte sannsynlighetsnivå etter at tiltakene er iverksatt"
                    value={fieldProps.field.value}
                    onChange={(value) => {
                      fieldProps.form.setFieldValue('sannsynlighetsNivaaEtterTiltak', value)
                    }}
                    error={
                      fieldProps.form.errors['sannsynlighetsNivaaEtterTiltak'] && (
                        <FormError fieldName={'sannsynlighetsNivaaEtterTiltak'} />
                      )
                    }
                  >
                    <ReadMoreSannsynlighetsnivaa />
                    <Stack gap="0 6" direction={{ xs: 'column', sm: 'row' }} wrap={false}>
                      <Radio value={1}>Meget lite sannsynlig</Radio>
                      <Radio value={2}>Lite sannsynlig</Radio>
                      <Radio value={3}>Moderat sannsynlig</Radio>
                      <Radio value={4}>Sannsynlig</Radio>
                      <Radio value={5}>Nesten sikkert</Radio>
                    </Stack>
                  </RadioGroup>
                )}
              </Field>

              <Field name="konsekvensNivaaEtterTiltak">
                {(fieldProps: FieldProps) => (
                  <RadioGroup
                    className="mt-3"
                    legend="Beskriv risikoscenarioets antatte konsekvensnivå etter at tiltakene er iverksatt"
                    value={fieldProps.field.value}
                    onChange={(value) => {
                      fieldProps.form.setFieldValue('konsekvensNivaaEtterTiltak', value)
                    }}
                    error={
                      fieldProps.form.errors['konsekvensNivaaEtterTiltak'] && (
                        <FormError fieldName={'konsekvensNivaaEtterTiltak'} />
                      )
                    }
                  >
                    <ReadMoreKonsekvensnivaa />
                    <Stack gap="0 6" direction={{ xs: 'column', sm: 'row' }} wrap={false}>
                      <Radio value={1}>Ubetydelig</Radio>
                      <Radio value={2}>Lav konsekvens</Radio>
                      <Radio value={3}>Moderat konsekvens</Radio>
                      <Radio value={4}>Alvorlig konsekvens</Radio>
                      <Radio value={5}>Svært alvorlig konsekvens</Radio>
                    </Stack>
                  </RadioGroup>
                )}
              </Field>

              <div className="mt-3">
                <TextAreaField
                  rows={3}
                  noPlaceholder
                  label="Gi en samlet begrunnelse for endringer i risikobildet som følge av tiltak"
                  name="nivaaBegrunnelseEtterTiltak"
                />
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
