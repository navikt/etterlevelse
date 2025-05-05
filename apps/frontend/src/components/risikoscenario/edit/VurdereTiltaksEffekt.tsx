import { PencilIcon } from '@navikt/aksel-icons'
import { Alert, BodyLong, Button, Heading, Label, Radio, RadioGroup, Stack } from '@navikt/ds-react'
import { Field, FieldProps, Form, Formik } from 'formik'
import { FunctionComponent, RefObject, useState } from 'react'
import {
  getRisikoscenario,
  mapRisikoscenarioToFormValue,
  updateRisikoscenario,
} from '../../../api/RisikoscenarioApi'
import { IRisikoscenario } from '../../../constants'
import { TextAreaField } from '../../common/Inputs'
import { FormError } from '../../common/ModalSchema'
import RisikoscenarioTag, {
  getKonsekvenssnivaaText,
  getSannsynlighetsnivaaText,
} from '../RisikoscenarioTag'
import { PVKFieldWrapper, TopBottomWrapper } from '../StylingLayout'
import RisikoscenarioKonsekvensnivaaReadMore from '../common/RisikoscenarioKonsekvensnivaaReadMore'
import RisikoscenarioSannsynlighetReadMore from '../common/RisikoscenarioSannsynlighetReadMore'

type TProps = {
  risikoscenario: IRisikoscenario
  setRisikoscenario: (state: IRisikoscenario) => void
  risikoscenarioList: IRisikoscenario[]
  setRisikosenarioList: (state: IRisikoscenario[]) => void
  allRisikoscenarioList: IRisikoscenario[]
  setAllRisikoscenarioList: (state: IRisikoscenario[]) => void
  formRef: RefObject<any>
}

export const VurdereTiltaksEffekt: FunctionComponent<TProps> = ({
  risikoscenario,
  setRisikoscenario,
  risikoscenarioList,
  setRisikosenarioList,
  allRisikoscenarioList,
  setAllRisikoscenarioList,
  formRef,
}) => {
  const [isFormActive, setIsFormActive] = useState<boolean>(false)

  const revurdertEffektCheck =
    risikoscenario.sannsynlighetsNivaaEtterTiltak === 0 ||
    risikoscenario.sannsynlighetsNivaaEtterTiltak === null ||
    risikoscenario.konsekvensNivaaEtterTiltak === 0 ||
    risikoscenario.konsekvensNivaaEtterTiltak === null

  const submit = async (submitedValues: IRisikoscenario): Promise<void> => {
    await getRisikoscenario(risikoscenario.id).then((response: IRisikoscenario) => {
      const updatedRisikoscenario = {
        ...submitedValues,
        ...response,
        sannsynlighetsNivaaEtterTiltak: submitedValues.sannsynlighetsNivaaEtterTiltak,
        konsekvensNivaaEtterTiltak: submitedValues.konsekvensNivaaEtterTiltak,
        nivaaBegrunnelseEtterTiltak: submitedValues.nivaaBegrunnelseEtterTiltak,
      }

      updateRisikoscenario(updatedRisikoscenario).then((response: IRisikoscenario) => {
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
          risikoscenarioList.map((filteredRisikoscenario: IRisikoscenario) => {
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
      <div>
        {!isFormActive && (
          <div className='mt-5'>
            <Label>Antatt risikonivå etter gjennomførte tiltak </Label>

            {revurdertEffektCheck && (
              <Alert className='mt-3' variant='warning'>
                Du må vurdere tiltakenes effekt
              </Alert>
            )}

            {!revurdertEffektCheck && (
              <div className='mt-3'>
                <RisikoscenarioTag
                  level={risikoscenario.sannsynlighetsNivaaEtterTiltak}
                  text={getSannsynlighetsnivaaText(risikoscenario.sannsynlighetsNivaaEtterTiltak)}
                />

                <div className='mt-3'>
                  <RisikoscenarioTag
                    level={risikoscenario.konsekvensNivaaEtterTiltak}
                    text={getKonsekvenssnivaaText(risikoscenario.konsekvensNivaaEtterTiltak)}
                  />
                </div>
                <BodyLong className='mt-3'>{risikoscenario.nivaaBegrunnelseEtterTiltak}</BodyLong>
              </div>
            )}
          </div>
        )}

        {!isFormActive && (
          <Button
            className='mt-3'
            type='button'
            variant={revurdertEffektCheck ? 'primary' : 'tertiary'}
            onClick={() => setIsFormActive(true)}
            icon={revurdertEffektCheck ? undefined : <PencilIcon aria-hidden title='' />}
          >
            {revurdertEffektCheck ? 'Vurdér tiltakenes effekt' : 'Redigér tiltakenes effekt'}
          </Button>
        )}
      </div>

      {isFormActive && (
        <Formik
          onSubmit={submit}
          innerRef={formRef}
          initialValues={mapRisikoscenarioToFormValue(risikoscenario)}
        >
          {({ values, setFieldValue, submitForm }) => (
            <Form className='w-full border-t border-[#071a3636]'>
              <TopBottomWrapper>
                <Heading size='medium' level='3'>
                  Dokumentér antatt risikonivå etter gjennomførte tiltak
                </Heading>
              </TopBottomWrapper>

              <PVKFieldWrapper>
                <Field name='sannsynlighetsNivaaEtterTiltak'>
                  {(fieldProps: FieldProps) => (
                    <RadioGroup
                      legend='Beskriv risikoscenarioets antatte sannsynlighetsnivå etter at tiltakene er iverksatt'
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
                      <RisikoscenarioSannsynlighetReadMore />
                      <Stack gap='0 6' direction={{ xs: 'column', sm: 'row' }} wrap={false}>
                        <Radio value={1}>Meget lite</Radio>
                        <Radio value={2}>Lite</Radio>
                        <Radio value={3}>Moderat</Radio>
                        <Radio value={4}>Sannsynlig</Radio>
                        <Radio value={5}>Nesten sikkert</Radio>
                      </Stack>
                    </RadioGroup>
                  )}
                </Field>
              </PVKFieldWrapper>

              <PVKFieldWrapper>
                <Field name='konsekvensNivaaEtterTiltak'>
                  {(fieldProps: FieldProps) => (
                    <RadioGroup
                      legend='Beskriv risikoscenarioets antatte konsekvensnivå etter at tiltakene er iverksatt'
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
                      <RisikoscenarioKonsekvensnivaaReadMore />
                      <Stack gap='0 6' direction={{ xs: 'column', sm: 'row' }} wrap={false}>
                        <Radio value={1}>Ubetydelig</Radio>
                        <Radio value={2}>Lav</Radio>
                        <Radio value={3}>Moderat</Radio>
                        <Radio value={4}>Alvorlig </Radio>
                        <Radio value={5}>Svært alvorlig</Radio>
                      </Stack>
                    </RadioGroup>
                  )}
                </Field>
              </PVKFieldWrapper>
              <div className='flex gap-3 mb-5'>
                {values.sannsynlighetsNivaaEtterTiltak > 0 && (
                  <RisikoscenarioTag
                    level={values.sannsynlighetsNivaaEtterTiltak}
                    text={getSannsynlighetsnivaaText(values.sannsynlighetsNivaaEtterTiltak)}
                  />
                )}
                {values.konsekvensNivaaEtterTiltak > 0 && (
                  <RisikoscenarioTag
                    level={values.konsekvensNivaaEtterTiltak}
                    text={getKonsekvenssnivaaText(values.konsekvensNivaaEtterTiltak)}
                  />
                )}
              </div>

              <div>
                <TextAreaField
                  rows={3}
                  noPlaceholder
                  label='Gi en samlet begrunnelse for endringer i risikobildet som følge av tiltak'
                  name='nivaaBegrunnelseEtterTiltak'
                />
              </div>

              <TopBottomWrapper>
                <div className='flex gap-2'>
                  <Button type='button' onClick={() => submitForm()}>
                    {!risikoscenario.konsekvensNivaaEtterTiltak ||
                    !risikoscenario.sannsynlighetsNivaaEtterTiltak
                      ? 'Lagre vurdering'
                      : 'Lagre endringer'}
                  </Button>

                  <Button type='button' variant='secondary' onClick={() => setIsFormActive(false)}>
                    Avbryt
                  </Button>

                  <Button
                    type='button'
                    variant='tertiary'
                    onClick={() => {
                      setFieldValue('sannsynlighetsNivaaEtterTiltak', 0)
                      setFieldValue('konsekvensNivaaEtterTiltak', 0)
                      setFieldValue('nivaaBegrunnelseEtterTiltak', '')
                    }}
                  >
                    Nullstill svar
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
