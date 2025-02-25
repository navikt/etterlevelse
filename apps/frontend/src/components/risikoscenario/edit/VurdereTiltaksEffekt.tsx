import { PencilIcon } from '@navikt/aksel-icons'
import { Alert, BodyLong, Button, Heading, Label, Radio, RadioGroup, Stack } from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik } from 'formik'
import { RefObject, useState } from 'react'
import {
  getRisikoscenario,
  mapRisikoscenarioToFormValue,
  updateRisikoscenario,
} from '../../../api/RisikoscenarioApi'
import { IRisikoscenario } from '../../../constants'
import { user } from '../../../services/User'
import { TextAreaField } from '../../common/Inputs'
import { FormError } from '../../common/ModalSchema'
import ReadMoreKonsekvensnivaa from '../ReadMoreKonsekvensnivaa'
import ReadMoreSannsynlighetsnivaa from '../ReadMoreSannsynlighetsnivaa'
import RisikoscenarioTag, {
  getKonsekvenssnivaaText,
  getSannsynlighetsnivaaText,
} from '../RisikoscenarioTag'
import { PVKFieldWrapper, TopBottomWrapper } from '../StylingLayout'

interface IProps {
  risikoscenario: IRisikoscenario
  setRisikoscenario: (state: IRisikoscenario) => void
  risikoscenarioList: IRisikoscenario[]
  setRisikosenarioList: (state: IRisikoscenario[]) => void
  allRisikoscenarioList: IRisikoscenario[]
  setAllRisikoscenarioList: (state: IRisikoscenario[]) => void
  formRef: RefObject<any>
}

export const VurdereTiltaksEffekt = (props: IProps) => {
  const {
    risikoscenario,
    setRisikoscenario,
    risikoscenarioList,
    setRisikosenarioList,
    allRisikoscenarioList,
    setAllRisikoscenarioList,
    formRef,
  } = props
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
        setAllRisikoscenarioList(
          allRisikoscenarioList.map((unfilteredRisikoscenario) => {
            if (unfilteredRisikoscenario.id === response.id) {
              return response
            } else {
              return unfilteredRisikoscenario
            }
          })
        )

        setRisikosenarioList(
          risikoscenarioList.map((filteredRisikoscenario) => {
            if (filteredRisikoscenario.id === response.id) {
              return response
            } else {
              return filteredRisikoscenario
            }
          })
        )
        setIsFormActive(false)
      })
    })
  }

  return (
    <div>
      {(!user.isPersonvernombud() || user.isAdmin()) && (
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
        </div>
      )}

      {isFormActive && (
        <Formik
          onSubmit={submit}
          innerRef={formRef}
          initialValues={mapRisikoscenarioToFormValue(risikoscenario)}
        >
          {({ submitForm }) => (
            <Form className="w-full border-t border-[#071a3636]">
              <TopBottomWrapper>
                <Heading size="medium" level="3">
                  Vurdér tiltakenes antatte effekt på risikoscenarionivået
                </Heading>
              </TopBottomWrapper>

              <PVKFieldWrapper>
                <Field name="sannsynlighetsNivaaEtterTiltak">
                  {(fieldProps: FieldProps) => (
                    <RadioGroup
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
              </PVKFieldWrapper>

              <PVKFieldWrapper>
                <Field name="konsekvensNivaaEtterTiltak">
                  {(fieldProps: FieldProps) => (
                    <RadioGroup
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
              </PVKFieldWrapper>

              <div>
                <TextAreaField
                  rows={3}
                  noPlaceholder
                  label="Gi en samlet begrunnelse for endringer i risikobildet som følge av tiltak"
                  name="nivaaBegrunnelseEtterTiltak"
                />
              </div>

              <TopBottomWrapper>
                <div className="flex gap-2">
                  <Button type="button" onClick={() => submitForm()}>
                    Lagre
                  </Button>

                  <Button type="button" variant="secondary" onClick={() => setIsFormActive(false)}>
                    Avbryt
                  </Button>
                </div>
              </TopBottomWrapper>
            </Form>
          )}
        </Formik>
      )}
    </div>
  )
}
export default VurdereTiltaksEffekt
