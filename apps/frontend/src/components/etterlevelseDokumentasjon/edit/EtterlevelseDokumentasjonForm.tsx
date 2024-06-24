import { Button, Checkbox, CheckboxGroup, Heading } from '@navikt/ds-react'
import { Field, FieldArray, FieldArrayRenderProps, FieldProps, Form, Formik } from 'formik'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AsyncSelect from 'react-select/async'
import { behandlingName, searchBehandlingOptions } from '../../../api/BehandlingApi'
import { getDocumentRelationByToIdAndRelationType } from '../../../api/DocumentRelationApi'
import {
  createEtterlevelseDokumentasjon,
  etterlevelseDokumentasjonMapToFormVal,
  updateEtterlevelseDokumentasjon,
} from '../../../api/EtterlevelseDokumentasjonApi'
import { useSearchTeamOptions } from '../../../api/TeamApi'
import {
  ERelationType,
  IBehandling,
  IDocumentRelation,
  ITeam,
  IVirkemiddel,
  TEtterlevelseDokumentasjonQL,
} from '../../../constants'
import { ampli } from '../../../services/Amplitude'
import { EListName, ICode, ICodeListFormValues, codelist } from '../../../services/Codelist'
import { ScrollToFieldError } from '../../../util/formikUtils'
import { BoolField, FieldWrapper, OptionList, TextAreaField } from '../../common/Inputs'
import LabelWithTooltip, { LabelWithDescription } from '../../common/LabelWithTooltip'
import { Error } from '../../common/ModalSchema'
import { RenderTagList } from '../../common/TagList'
import { DropdownIndicator } from '../../krav/Edit/KravBegreperEdit'
import { selectOverrides } from '../../search/util'
import { VarslingsadresserEdit } from '../../varslingsadresse/VarslingsadresserEdit'
import { etterlevelseDokumentasjonSchema } from './etterlevelseDokumentasjonSchema'

type TEditEtterlevelseDokumentasjonModalProps = {
  title: string
  etterlevelseDokumentasjon?: TEtterlevelseDokumentasjonQL
  isEditButton?: boolean
}

export const EtterlevelseDokumentasjonForm = (props: TEditEtterlevelseDokumentasjonModalProps) => {
  const { title, etterlevelseDokumentasjon, isEditButton } = props
  const relevansOptions = codelist.getParsedOptions(EListName.RELEVANS)
  const [selectedFilter, setSelectedFilter] = useState<number[]>(
    relevansOptions.map((_relevans, index) => index)
  )

  const [selectedVirkemiddel, setSelectedVirkemiddel] = useState<IVirkemiddel>()
  const [dokumentRelasjon, setDokumentRelasjon] = useState<IDocumentRelation>()
  const navigate = useNavigate()

  useEffect(() => {
    if (etterlevelseDokumentasjon?.irrelevansFor.length) {
      const irrelevans = etterlevelseDokumentasjon.irrelevansFor.map((irrelevans: ICode) =>
        relevansOptions.findIndex((relevans) => relevans.value === irrelevans.code)
      )
      setSelectedFilter(
        relevansOptions
          .map((_relevans, index) => {
            return index
          })
          .filter((index) => !irrelevans.includes(index))
      )
    } else {
      setSelectedFilter(
        relevansOptions.map((_relevans, index) => {
          return index
        })
      )
    }

    if (etterlevelseDokumentasjon?.virkemiddel?.navn) {
      setSelectedVirkemiddel(etterlevelseDokumentasjon.virkemiddel)
    }

    ;(async () => {
      if (etterlevelseDokumentasjon) {
        await getDocumentRelationByToIdAndRelationType(
          etterlevelseDokumentasjon?.id,
          ERelationType.ARVER
        ).then((resp) => setDokumentRelasjon(resp[0]))
      }
    })()
  }, [etterlevelseDokumentasjon])

  const submit = async (etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL) => {
    console.debug(selectedVirkemiddel)
    if (!etterlevelseDokumentasjon.id || etterlevelseDokumentasjon.id === 'ny') {
      await createEtterlevelseDokumentasjon(etterlevelseDokumentasjon).then((response) => {
        if (response.id) {
          navigate('/dokumentasjon/' + response.id)
        }
      })
    } else {
      await updateEtterlevelseDokumentasjon(etterlevelseDokumentasjon).then((response) => {
        if (response.id) {
          navigate('/dokumentasjon/' + response.id)
        }
      })
    }
  }

  return (
    <Formik
      initialValues={etterlevelseDokumentasjonMapToFormVal(
        etterlevelseDokumentasjon ? etterlevelseDokumentasjon : {}
      )}
      onSubmit={submit}
      validationSchema={etterlevelseDokumentasjonSchema()}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({ values, submitForm, setFieldValue, errors }) => (
        <Form>
          <Heading size="medium" level="1" spacing>
            {title}
          </Heading>

          <TextAreaField
            rows={2}
            noPlaceholder
            label="Skriv inn tittel på etterlevelsesdokumentet"
            name="title"
          />

          <div className="mt-5">
            <TextAreaField
              height="150px"
              noPlaceholder
              label="Beskrivelse"
              name="beskrivelse"
              markdown
            />
          </div>

          {/* <BoolField label="Er produktet/systemet tilknyttet et virkemiddel?" name="knyttetTilVirkemiddel" /> */}

          {/* {values.knyttetTilVirkemiddel ? (
                    <FieldWrapper>
                      <Field name="virkemiddelId">
                        {(fp: FieldProps) => {
                          return (
                              <div>
                              <LabelWithTooltip label={'Legg til virkemiddel'} tooltip="Søk og legg til virkemiddel" />
                              <CustomizedSelect
                                  labelKey={'navn'}
                                  options={virkemiddelSearchResult}
                                  placeholder={'Søk virkemiddel'}
                                  onInputChange={(event) => setVirkemiddelSearchResult(event.currentTarget.value)}
                                  onChange={(params) => {
                                    let virkemiddel = params.value.length ? params.value[0] : undefined
                                    if (virkemiddel) {
                                      fp.form.values['virkemiddelId'] = virkemiddel.id
                                      setSelectedVirkemiddel(virkemiddel as Virkemiddel)
                                    }
                                  }}
                                  isLoading={loadingVirkemiddelSearchResult}
                                />
                                {selectedVirkemiddel && (
                                  <Tag
                                    variant={VARIANT.outlined}
                                    onActionClick={() => {
                                      setSelectedVirkemiddel(undefined)
                                      fp.form.setFieldValue('virkemiddelId', '')
                                    }}
                                  >
                                    {selectedVirkemiddel.navn}
                                  </Tag>
                                )}
                              </div>
                          )
                        }}
                      </Field>
                      <Error fieldName="virkemiddelId" fullWidth />
                    </FieldWrapper>
                  ) : ( */}

          {!dokumentRelasjon && (
            <FieldArray name="irrelevansFor">
              {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                <div className="h-full pt-5 w-[calc(100% - 1rem)]">
                  <CheckboxGroup
                    legend="Hvilke egenskaper gjelder for etterlevelsen?"
                    description="Kun krav fra egenskaper du velger som gjeldende vil være tilgjengelig for dokumentasjon."
                    value={selectedFilter}
                    onChange={(selected) => {
                      setSelectedFilter(selected)

                      const irrelevansListe = relevansOptions.filter(
                        (_irrelevans, index) => !selected.includes(index)
                      )
                      fieldArrayRenderProps.form.setFieldValue(
                        'irrelevansFor',
                        irrelevansListe.map((irrelevans) =>
                          codelist.getCode(EListName.RELEVANS, irrelevans.value)
                        )
                      )
                      // selected.forEach((value) => {
                      //   const i = parseInt(value)
                      //   if (!selectedFilter.includes(i)) {
                      //     setSelectedFilter([...selectedFilter, i])
                      //     p.remove(p.form.values.irrelevansFor.findIndex((ir: ICode) => ir.code === relevansOptions[i].value))
                      //   } else {
                      //     setSelectedFilter(selectedFilter.filter((value) => value !== i))
                      //     p.push(codelist.getCode(ListName.RELEVANS, relevansOptions[i].value as string))
                      //   }
                      // })
                    }}
                  >
                    {relevansOptions.map((relevans, index) => (
                      <Checkbox
                        key={'relevans_' + relevans.value}
                        value={index}
                        description={relevans.description}
                      >
                        {relevans.label}
                      </Checkbox>
                    ))}
                  </CheckboxGroup>
                </div>
              )}
            </FieldArray>
          )}

          {/* DONT REMOVE */}
          {/* )} */}

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
            </FieldWrapper>
          )}
          <FieldWrapper>
            <Field name="avdeling">
              {(fieldProps: FieldProps<ICode, ICodeListFormValues>) => (
                <div className="w-fit">
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
            <div className="flex flex-row-reverse">
              <Button
                type="button"
                onClick={() => {
                  if (!isEditButton) {
                    ampli.logEvent('knapp trykket', {
                      tekst: 'Opprett etterlevelsesdokument',
                    })
                  }
                  submitForm()
                }}
                className="ml-2.5"
              >
                {isEditButton ? 'Lagre' : 'Opprett'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  ampli.logEvent('knapp trykket', {
                    tekst: 'Avbryt opprett etterlevelsesdokument',
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
export default EtterlevelseDokumentasjonForm
