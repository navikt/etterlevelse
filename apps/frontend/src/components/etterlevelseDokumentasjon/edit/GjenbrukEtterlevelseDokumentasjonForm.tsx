import { Button, Radio, RadioGroup } from '@navikt/ds-react'
import { Field, FieldArray, FieldArrayRenderProps, FieldProps, Form, Formik } from 'formik'
import { useNavigate } from 'react-router-dom'
import { CSSObjectWithLabel } from 'react-select'
import AsyncSelect from 'react-select/async'
import { behandlingName, searchBehandlingOptions } from '../../../api/BehandlingApi'
import {
  etterlevelseDokumentasjonSchema,
  etterlevelseDokumentasjonWithRelationMapToFormVal,
} from '../../../api/EtterlevelseDokumentasjonApi'
import { useSearchTeamOptions } from '../../../api/TeamApi'
import {
  ERelationType,
  IBehandling,
  IEtterlevelseDokumentasjonWithRelation,
  ITeam,
  TEtterlevelseDokumentasjonQL,
} from '../../../constants'
import { ampli } from '../../../services/Amplitude'
import { EListName, ICode, ICodeListFormValues } from '../../../services/Codelist'
import { ScrollToFieldError } from '../../../util/formikUtils'
import { BoolField, FieldWrapper, OptionList, TextAreaField } from '../../common/Inputs'
import LabelWithTooltip, { LabelWithDescription } from '../../common/LabelWithTooltip'
import { Error } from '../../common/ModalSchema'
import { RenderTagList } from '../../common/TagList'
import { DropdownIndicator } from '../../krav/Edit/KravBegreperEdit'
import { VarslingsadresserEdit } from '../../varslingsadresse/VarslingsadresserEdit'

interface IProps {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
}

export const GjenbrukEtterlevelseDokumentasjonForm = (props: IProps) => {
  const { etterlevelseDokumentasjon } = props
  const navigate = useNavigate()

  const submit = async (
    etterlevelseDokumentasjonWithRelation: IEtterlevelseDokumentasjonWithRelation
  ) => {
    console.debug(etterlevelseDokumentasjonWithRelation)
  }

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
      validationSchema={etterlevelseDokumentasjonSchema()}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ values, setFieldValue, errors, submitForm }) => (
        <Form>
          <FieldWrapper marginBottom>
            <Field name="relationType">
              {(fp: FieldProps) => (
                <RadioGroup
                  legend="Hvordan ønsker du å gjenbruke dette dokumentet?"
                  onChange={(value) => fp.form.setFieldValue('relationType', value)}
                >
                  <Radio value={ERelationType.ARVER}>
                    Beholde relasjonen, og arve endringer på svar etter hvert som de kommer
                  </Radio>
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
            label="Navngi ditt nye dokument"
            name="title"
            caption="Husk at også andre kan gjenbruke samme dokument som du gjør nå, og da er det viktig å være tydelig"
          />

          <div className="mt-5">
            <TextAreaField
              rows={5}
              noPlaceholder
              label="Beskrivelse"
              name="Beskriv hva som dokumentet gjelder (og eventuelt ikke gjelder)"
              caption="Denne informasjon skal vises på dokumentside"
            />
          </div>

          <BoolField
            label="Ønsker du å legge til eksisterende behandling(er) nå?"
            name="behandlerPersonopplysninger"
            tooltip="Hvis produktet/systemet behandler personopplysninger må du ha en behandling i Behandlingskatalogen. Det er mulig å legge til behandling senere."
          />

          {values.behandlerPersonopplysninger && (
            <FieldWrapper>
              <FieldArray name="behandlinger">
                {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                  <div className="my-3">
                    <LabelWithDescription
                      label={'Legg til behandlinger fra Behandlingskatalogen'}
                      description="Skriv minst tre tegn for å søke"
                    />
                    <div className="w-full">
                      <AsyncSelect
                        aria-label="Søk etter behandlinger"
                        placeholder=""
                        components={{ DropdownIndicator }}
                        noOptionsMessage={({ inputValue }) => {
                          if (inputValue.length < 3 && inputValue.length > 0) {
                            return 'Skriv minst tre tegn for å søke'
                          } else if (inputValue.length >= 3) {
                            return `Fant ingen resultater for "${inputValue}"`
                          } else {
                            return ''
                          }
                        }}
                        controlShouldRenderValue={false}
                        loadingMessage={() => 'Søker...'}
                        isClearable={false}
                        loadOptions={searchBehandlingOptions}
                        onChange={(value) => {
                          value && fieldArrayRenderProps.push(value)
                          if (value && !values.avdeling && values.behandlinger?.length === 0) {
                            const behandling = value as IBehandling
                            const newAvdeling = {
                              list: EListName.AVDELING,
                              shortName: behandling.avdeling?.shortName || '',
                              code: behandling.avdeling?.code || '',
                              description: behandling.avdeling?.description || '',
                            } as ICodeListFormValues
                            setFieldValue('avdeling', newAvdeling)
                          }
                        }}
                        styles={{
                          control: (base) =>
                            ({
                              ...base,
                              cursor: 'text',
                              height: '3rem',
                            }) as CSSObjectWithLabel,
                        }}
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

          <BoolField
            label="Er etterlevelsesdokumentet knyttet til et team i Teamkatalogen?"
            name="knytteTilTeam"
            tooltip="Når du legger til et team vil medlemmene i det teamet kunne se dette dokumentet under «Mine dokumentasjoner». Dette er ikke nødvendig for å opprette etterlevelsesdokumentet, men anbefales."
          />

          {values.knytteTilTeam && (
            <FieldWrapper>
              <FieldArray name="teamsData">
                {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                  <div className=" mb-3">
                    <LabelWithTooltip label="Legg til team fra Teamkatalogen" tooltip="" />
                    <div className="w-full">
                      <AsyncSelect
                        aria-label="Søk etter team"
                        placeholder=""
                        components={{ DropdownIndicator }}
                        noOptionsMessage={({ inputValue }) => {
                          if (inputValue.length < 3 && inputValue.length > 0) {
                            return 'Skriv minst tre tegn for å søke'
                          } else if (inputValue.length >= 3) {
                            return `Fant ingen resultater for "${inputValue}"`
                          } else {
                            return ''
                          }
                        }}
                        controlShouldRenderValue={false}
                        loadingMessage={() => 'Søker...'}
                        isClearable={false}
                        loadOptions={useSearchTeamOptions}
                        onChange={(value) => {
                          value && fieldArrayRenderProps.push(value)
                        }}
                        styles={{
                          control: (base) =>
                            ({
                              ...base,
                              cursor: 'text',
                              height: '3rem',
                            }) as CSSObjectWithLabel,
                        }}
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
            </FieldWrapper>
          )}
          <FieldWrapper>
            <Field name="avdeling">
              {(fieldProps: FieldProps<ICode, ICodeListFormValues>) => (
                <div>
                  <LabelWithDescription
                    label="Avdeling"
                    description="Angi hvilken avdeling som er ansvarlig for etterlevelsen og som er risikoeier."
                  />
                  <OptionList
                    listName={EListName.AVDELING}
                    label="Avdeling"
                    value={fieldProps.field.value?.code}
                    onChange={(value) => {
                      fieldProps.form.setFieldValue('avdeling', value)
                    }}
                  />
                </div>
              )}
            </Field>
          </FieldWrapper>

          <div id="varslingsadresser" className="mt-3">
            <VarslingsadresserEdit />
            {errors.varslingsadresser && <Error message={errors.varslingsadresser as string} />}
          </div>

          <div className="button_container flex flex-col mt-5 py-4 px-4 sticky bottom-0 border-t-2 z-10 bg-bg-default">
            <div className="flex justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  ampli.logEvent('knapp trykket', {
                    tekst: 'Avbryt gjenbruk etterlevelsesdokument',
                  })
                  navigate(-1)
                }}
              >
                Avbryt
              </Button>
              <Button
                type="button"
                onClick={() => {
                  ampli.logEvent('knapp trykket', {
                    tekst: 'gjenbruk etterlevelsesdokument',
                  })
                  submitForm()
                }}
                className="ml-2.5"
              >
                Opprett
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
