import { Button, Radio, RadioGroup } from '@navikt/ds-react'
import { Field, FieldArray, FieldArrayRenderProps, FieldProps, Form, Formik } from 'formik'
import { FunctionComponent, useEffect, useState } from 'react'
import { NavigateFunction, useNavigate } from 'react-router-dom'
import AsyncSelect from 'react-select/async'
import { behandlingName, searchBehandlingOptions } from '../../../api/BehandlingApi'
import {
  createEtterlevelseDokumentasjonWithRelataion,
  etterlevelseDokumentasjonWithRelationMapToFormVal,
} from '../../../api/EtterlevelseDokumentasjonApi'
import { getAvdelingOptions } from '../../../api/NomApi'
import { searchResourceByNameOptions, useSearchTeamOptions } from '../../../api/TeamApi'
import {
  ERelationType,
  IBehandling,
  IEtterlevelseDokumentasjon,
  IEtterlevelseDokumentasjonWithRelation,
  ITeam,
  ITeamResource,
  TEtterlevelseDokumentasjonQL,
  TOption,
} from '../../../constants'
import { ampli } from '../../../services/Amplitude'
import { ScrollToFieldError } from '../../../util/formikUtils'
import { BoolField, FieldWrapper, OptionList, TextAreaField } from '../../common/Inputs'
import LabelWithTooltip, { LabelWithDescription } from '../../common/LabelWithTooltip'
import { Error, FormError } from '../../common/ModalSchema'
import { etterlevelseDokumentasjonIdUrl } from '../../common/RouteLinkEtterlevelsesdokumentasjon'
import { RenderTagList } from '../../common/TagList'
import { DropdownIndicator } from '../../krav/Edit/KravBegreperEdit'
import { noOptionMessage, selectOverrides } from '../../search/util'
import { VarslingsadresserEdit } from '../../varslingsadresse/VarslingsadresserEdit'
import { etterlevelseDokumentasjonWithRelationSchema } from './etterlevelseDokumentasjonSchema'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  isInheritingFrom: boolean
}

export const GjenbrukEtterlevelseDokumentasjonForm: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  isInheritingFrom,
}) => {
  const [alleAvdelingOptions, setAlleAvdelingOptions] = useState<TOption[]>([])
  const navigate: NavigateFunction = useNavigate()

  const submit = async (
    etterlevelseDokumentasjonWithRelation: IEtterlevelseDokumentasjonWithRelation
  ): Promise<void> => {
    await createEtterlevelseDokumentasjonWithRelataion(
      etterlevelseDokumentasjon.id,
      etterlevelseDokumentasjonWithRelation
    ).then((response: IEtterlevelseDokumentasjon) =>
      navigate(etterlevelseDokumentasjonIdUrl(response.id))
    )
  }

  useEffect(() => {
    ;(async () => {
      await getAvdelingOptions().then(setAlleAvdelingOptions)
    })()
  }, [])

  return (
    <Formik
      initialValues={etterlevelseDokumentasjonWithRelationMapToFormVal({
        irrelevansFor: etterlevelseDokumentasjon.irrelevansFor,
        prioritertKravNummer: etterlevelseDokumentasjon.prioritertKravNummer,
        behandlinger: etterlevelseDokumentasjon.behandlinger,
        behandlingIds: etterlevelseDokumentasjon.behandlingIds,
        behandlerPersonopplysninger: etterlevelseDokumentasjon.behandlerPersonopplysninger,
      })}
      onSubmit={submit}
      validationSchema={etterlevelseDokumentasjonWithRelationSchema()}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ values, errors, submitForm }) => (
        <Form className='flex flex-col gap-3'>
          <FieldWrapper marginBottom>
            <Field name='relationType'>
              {(fp: FieldProps) => (
                <RadioGroup
                  legend='Hvordan ønsker du å gjenbruke dette dokumentet?'
                  onChange={(value) => fp.form.setFieldValue('relationType', value)}
                  description={
                    isInheritingFrom ? 'Kan ikke arve fra dette etterlevelsesdokumentet' : null
                  }
                  error={
                    fp.form.errors['relationType'] ? (
                      <FormError fieldName='relationType' />
                    ) : undefined
                  }
                >
                  {!isInheritingFrom && (
                    <Radio value={ERelationType.ARVER}>
                      Beholde relasjonen, og arve endringer på svar etter hvert som de kommer
                    </Radio>
                  )}
                  <Radio value={ERelationType.ENGANGSKOPI}>
                    Lage en engangskopi som uavhengig dokument
                  </Radio>
                </RadioGroup>
              )}
            </Field>
          </FieldWrapper>

          <TextAreaField
            rows={2}
            noPlaceholder
            label='Navngi ditt nye dokument'
            caption='Prøv å velge noe unikt som gjør det lett å skille denne etterlevelsen fra andre, lignende'
            name='title'
          />

          <div className='mt-5'>
            <TextAreaField
              rows={5}
              noPlaceholder
              label='Beskriv nærmere etterlevelsens kontekst, for eksempel hvilken løsning, målgruppe eller arbeid som omfattes'
              name='beskrivelse'
            />
          </div>

          <BoolField
            label='Ønsker du å legge til eksisterende behandling(er) nå?'
            name='behandlerPersonopplysninger'
            tooltip='Hvis produktet/systemet behandler personopplysninger må du ha en behandling i Behandlingskatalogen. Det er mulig å legge til behandling senere.'
          />

          {values.behandlerPersonopplysninger && (
            <FieldWrapper>
              <FieldArray name='behandlinger'>
                {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                  <div className='my-3'>
                    <LabelWithDescription
                      label={'Legg til behandlinger fra Behandlingskatalogen'}
                      description='Skriv minst 3 tegn for å søke'
                    />
                    <div className='w-full'>
                      <AsyncSelect
                        aria-label='Søk etter behandlinger'
                        placeholder=''
                        components={{ DropdownIndicator }}
                        noOptionsMessage={({ inputValue }) => noOptionMessage(inputValue)}
                        controlShouldRenderValue={false}
                        loadingMessage={() => 'Søker...'}
                        isClearable={false}
                        loadOptions={searchBehandlingOptions}
                        onChange={(value) => {
                          if (value) {
                            fieldArrayRenderProps.push(value)
                          }
                        }}
                        styles={selectOverrides}
                      />
                    </div>
                    <RenderTagList
                      list={fieldArrayRenderProps.form.values.behandlinger.map(
                        (behandling: IBehandling) => behandlingName(behandling)
                      )}
                      onRemove={fieldArrayRenderProps.remove}
                    />
                  </div>
                )}
              </FieldArray>
            </FieldWrapper>
          )}

          <div id='teamsData' className='flex flex-col lg:flex-row gap-5'>
            <FieldArray name='teamsData'>
              {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                <div className='flex-1'>
                  <LabelWithTooltip label='Søk team fra Teamkatalogen' tooltip='' />
                  <div className='w-full'>
                    <AsyncSelect
                      aria-label='Søk etter team'
                      placeholder=''
                      components={{ DropdownIndicator }}
                      noOptionsMessage={({ inputValue }) => noOptionMessage(inputValue)}
                      controlShouldRenderValue={false}
                      loadingMessage={() => 'Søker...'}
                      isClearable={false}
                      loadOptions={useSearchTeamOptions}
                      onChange={(value: any) => {
                        if (
                          value &&
                          fieldArrayRenderProps.form.values.teamsData.filter(
                            (team: ITeam) => team.id === value.id
                          ).length === 0
                        ) {
                          fieldArrayRenderProps.push(value)
                        }
                      }}
                      styles={selectOverrides}
                    />
                  </div>
                  <RenderTagList
                    list={fieldArrayRenderProps.form.values.teamsData.map(
                      (tema: ITeam) => tema.name
                    )}
                    onRemove={fieldArrayRenderProps.remove}
                  />
                </div>
              )}
            </FieldArray>
            <FieldArray name='resourcesData'>
              {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                <div className='flex-1'>
                  <LabelWithTooltip label='Søk etter person' tooltip='' />
                  <div className='w-full'>
                    <AsyncSelect
                      aria-label='Søk etter person'
                      placeholder=''
                      components={{ DropdownIndicator }}
                      noOptionsMessage={({ inputValue }) => {
                        return noOptionMessage(inputValue)
                      }}
                      controlShouldRenderValue={false}
                      loadingMessage={() => 'Søker...'}
                      isClearable={false}
                      loadOptions={searchResourceByNameOptions}
                      onChange={(value: any) => {
                        if (
                          value &&
                          fieldArrayRenderProps.form.values.resourcesData.filter(
                            (team: ITeamResource) => team.navIdent === value.navIdent
                          ).length === 0
                        ) {
                          fieldArrayRenderProps.push(value)
                        }
                      }}
                      styles={selectOverrides}
                    />
                  </div>
                  <RenderTagList
                    list={fieldArrayRenderProps.form.values.resourcesData.map(
                      (resource: ITeamResource) => resource.fullName
                    )}
                    onRemove={fieldArrayRenderProps.remove}
                  />
                </div>
              )}
            </FieldArray>
          </div>

          {errors.teamsData && <Error message={errors.teamsData as string} />}
          <FieldWrapper>
            <Field name='nomAvdelingId'>
              {(fieldProps: FieldProps) => (
                <div>
                  <LabelWithDescription
                    label='Avdeling'
                    description='Angi hvilken avdeling som er ansvarlig for etterlevelsen og som er risikoeier.'
                  />
                  <OptionList
                    label='Avdeling'
                    options={alleAvdelingOptions}
                    value={fieldProps.field.value}
                    onChange={async (value: any) => {
                      await fieldProps.form.setFieldValue('nomAvdelingId', value)
                      await fieldProps.form.setFieldValue(
                        'avdelingNavn',
                        alleAvdelingOptions.filter((avdeling) => avdeling.value === value)[0].label
                      )
                    }}
                  />
                </div>
              )}
            </Field>
          </FieldWrapper>

          <div id='varslingsadresser' className='mt-3'>
            <VarslingsadresserEdit fieldName='varslingsadresser' />
            {errors.varslingsadresser && <Error message={errors.varslingsadresser as string} />}
          </div>

          <div className='button_container flex flex-col mt-5 py-4 px-4 sticky bottom-0 border-t-2 z-10 bg-white'>
            <div className='flex flex-row-reverse'>
              <Button
                type='button'
                onClick={() => {
                  ampli.logEvent('knapp trykket', {
                    tekst: 'gjenbruk etterlevelsesdokument',
                  })
                  submitForm()
                }}
                className='ml-2.5'
              >
                Opprett
              </Button>
              <Button
                type='button'
                variant='secondary'
                onClick={() => {
                  ampli.logEvent('knapp trykket', {
                    tekst: 'Avbryt gjenbruk etterlevelsesdokument',
                  })
                  navigate(-1)
                }}
              >
                Avbryt
              </Button>
            </div>
          </div>
          <ScrollToFieldError />
        </Form>
      )}
    </Formik>
  )
}

export default GjenbrukEtterlevelseDokumentasjonForm
