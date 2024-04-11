import { Button, Checkbox, CheckboxGroup, Modal } from '@navikt/ds-react'
import { Field, FieldArray, FieldArrayRenderProps, FieldProps, Form, Formik } from 'formik'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CSSObjectWithLabel } from 'react-select'
import AsyncSelect from 'react-select/async'
import { behandlingName, searchBehandlingOptions } from '../../../api/BehandlingApi'
import {
  createEtterlevelseDokumentasjon,
  etterlevelseDokumentasjonMapToFormVal,
  etterlevelseDokumentasjonSchema,
  updateEtterlevelseDokumentasjon,
} from '../../../api/EtterlevelseDokumentasjonApi'
import { useSearchTeamOptions } from '../../../api/TeamApi'
import { IBehandling, ITeam, IVirkemiddel, TEtterlevelseDokumentasjonQL } from '../../../constants'
import { ampli } from '../../../services/Amplitude'
import { EListName, ICode, ICodeListFormValues, codelist } from '../../../services/Codelist'
import { BoolField, FieldWrapper, OptionList, TextAreaField } from '../../common/Inputs'
import LabelWithTooltip, { LabelWithDescription } from '../../common/LabelWithTooltip'
import { FormError } from '../../common/ModalSchema'
import { RenderTagList } from '../../common/TagList'
import { DropdownIndicator } from '../../krav/Edit/KravBegreperEdit'

type TEditEtterlevelseDokumentasjonModalProps = {
  etterlevelseDokumentasjon?: TEtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon?: (e: TEtterlevelseDokumentasjonQL) => void
  isEditButton?: boolean
  variant?: 'secondary' | 'primary'
}

export const EditEtterlevelseDokumentasjonModal = (
  props: TEditEtterlevelseDokumentasjonModalProps
) => {
  const { etterlevelseDokumentasjon, setEtterlevelseDokumentasjon, isEditButton, variant } = props
  const relevansOptions = codelist.getParsedOptions(EListName.RELEVANS)
  const [selectedFilter, setSelectedFilter] = useState<number[]>(
    relevansOptions.map((_relevans, index) => index)
  )
  const [isEtterlevelseDokumentasjonerModalOpen, setIsEtterlevelseDokumntasjonerModalOpen] =
    useState<boolean>(false)
  const [selectedVirkemiddel, setSelectedVirkemiddel] = useState<IVirkemiddel>()
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
  }, [etterlevelseDokumentasjon])

  const submit = async (etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL) => {
    if (!etterlevelseDokumentasjon.id || etterlevelseDokumentasjon.id === 'ny') {
      await createEtterlevelseDokumentasjon(etterlevelseDokumentasjon).then((response) => {
        setIsEtterlevelseDokumntasjonerModalOpen(false)
        if (setEtterlevelseDokumentasjon) {
          setEtterlevelseDokumentasjon(response)
        }
        if (response.id) {
          navigate('/dokumentasjon/' + response.id)
        }
      })
    } else {
      await updateEtterlevelseDokumentasjon(etterlevelseDokumentasjon).then((response) => {
        setIsEtterlevelseDokumntasjonerModalOpen(false)
        const mutatedBehandlinger = response.behandlinger?.map((behandling) => {
          return {
            ...behandling,
            navn:
              'B' +
              behandling.nummer +
              ' ' +
              behandling.overordnetFormaal.shortName +
              ': ' +
              behandling.navn,
          }
        })
        if (setEtterlevelseDokumentasjon) {
          setEtterlevelseDokumentasjon({
            ...response,
            behandlinger: mutatedBehandlinger,
            virkemiddel: selectedVirkemiddel,
          })
        }
      })
    }
  }

  return (
    <div className="ml-5">
      <Button
        onClick={() => {
          if (!isEditButton) {
            ampli.logEvent('knapp klikket', {
              tekst: 'Nytt etterlevelsesdokument fra forsiden',
            })
          }
          setIsEtterlevelseDokumntasjonerModalOpen(true)
        }}
        size={isEditButton ? 'small' : 'medium'}
        variant={variant ? variant : isEditButton ? 'secondary' : 'primary'}
        className="whitespace-nowrap"
      >
        {isEditButton ? 'Rediger etterlevelsesdokumentet' : 'Nytt etterlevelsesdokument'}
      </Button>

      {isEtterlevelseDokumentasjonerModalOpen && (
        <Formik
          initialValues={etterlevelseDokumentasjonMapToFormVal(
            etterlevelseDokumentasjon ? etterlevelseDokumentasjon : {}
          )}
          onSubmit={submit}
          validationSchema={etterlevelseDokumentasjonSchema()}
          validateOnChange={false}
          validateOnBlur={false}
        >
          {({ values, submitForm, handleReset, setFieldValue }) => (
            <Modal
              header={{
                heading: isEditButton
                  ? 'Rediger etterlevelsesdokumentet'
                  : 'Opprett nytt etterlevelsesdokument',
              }}
              open={!!isEtterlevelseDokumentasjonerModalOpen}
              onClose={() => {
                handleReset()
                setIsEtterlevelseDokumntasjonerModalOpen(false)
              }}
            >
              <Modal.Body>
                <Form>
                  <TextAreaField
                    rows={2}
                    noPlaceholder
                    label="Skriv inn tittel på etterlevelsesdokumentet"
                    name="title"
                  />

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

                  {/* DONT REMOVE */}
                  {/* )} */}
                  <div className="mt-2.5">
                    <BoolField
                      label="Ønsker du å legge til eksisterende behandling(er) nå?"
                      name="behandlerPersonopplysninger"
                      tooltip="Hvis produktet/systemet behandler personopplysninger må du ha en behandling i Behandlingskatalogen. Det er mulig å legge til behandling senere."
                    />
                  </div>

                  {values.behandlerPersonopplysninger && (
                    <FieldWrapper>
                      <FieldArray name="behandlinger">
                        {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                          <div className="mb-4">
                            <LabelWithDescription
                              label={'Legg til behandlinger fra Behandlingskatalogen'}
                            />
                            <div className="w-full">
                              <AsyncSelect
                                aria-label="Søk etter behandlinger"
                                placeholder="Søk etter behandlinger"
                                components={{ DropdownIndicator }}
                                noOptionsMessage={({ inputValue }) =>
                                  inputValue.length < 3
                                    ? 'Skriv minst tre tegn for å søke'
                                    : `Fant ingen resultater for "${inputValue}"`
                                }
                                controlShouldRenderValue={false}
                                loadingMessage={() => 'Søker...'}
                                isClearable={false}
                                loadOptions={searchBehandlingOptions}
                                onChange={(value) => {
                                  value && fieldArrayRenderProps.push(value)
                                  if (
                                    value &&
                                    !values.avdeling &&
                                    values.behandlinger?.length === 0
                                  ) {
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

                  <div className="mt-2.5">
                    <BoolField
                      label="Er etterlevelsesdokumentet knyttet til et team i Teamkatalogen?"
                      name="knytteTilTeam"
                      tooltip="Når du legger til et team vil medlemmene i det teamet kunne se dette dokumentet under «Mine dokumentasjoner». Dette er ikke nødvendig for å opprette etterlevelsesdokumentet, men anbefales."
                    />
                  </div>

                  {values.knytteTilTeam && (
                    <FieldWrapper>
                      <FieldArray name="teamsData">
                        {(fieldArrayRenderProps: FieldArrayRenderProps) => (
                          <div className=" mb-4">
                            <LabelWithTooltip label="Legg til team fra Teamkatalogen" tooltip="" />
                            <div className="w-full">
                              <AsyncSelect
                                aria-label="Søk etter team"
                                placeholder="Søk etter team"
                                components={{ DropdownIndicator }}
                                noOptionsMessage={({ inputValue }) =>
                                  inputValue.length < 3
                                    ? 'Skriv minst tre tegn for å søke'
                                    : `Fant ingen resultater for "${inputValue}"`
                                }
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
                  <div className="my-5">
                    <FormError fieldName="title" akselStyling />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        ampli.logEvent('knapp trykket', {
                          tekst: 'Avbryt opprett etterlevelsesdokument',
                        })
                        handleReset()
                        setIsEtterlevelseDokumntasjonerModalOpen(false)
                      }}
                    >
                      Avbryt
                    </Button>
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
                  </div>
                </Form>
              </Modal.Body>
            </Modal>
          )}
        </Formik>
      )}
    </div>
  )
}
export default EditEtterlevelseDokumentasjonModal
