import { useEffect, useState } from 'react'
import { searchBehandlingOptions, useSearchBehandling } from '../../../api/BehandlingApi'
import {
  createEtterlevelseDokumentasjon,
  etterlevelseDokumentasjonMapToFormVal,
  etterlevelseDokumentasjonSchema,
  updateEtterlevelseDokumentasjon,
} from '../../../api/EtterlevelseDokumentasjonApi'
import { Behandling, EtterlevelseDokumentasjonQL, Team, Virkemiddel } from '../../../constants'
import { Code, codelist, ListName } from '../../../services/Codelist'
import { Button as BaseUIButton, KIND } from 'baseui/button'
import { FieldArray, FieldArrayRenderProps, FieldProps, Form, Formik } from 'formik'
import { BoolField, FieldWrapper, InputField } from '../../common/Inputs'
import { ButtonGroup } from 'baseui/button-group'
import { ParagraphMedium } from 'baseui/typography'
import { ettlevColors } from '../../../util/theme'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import { borderColor, borderRadius, borderStyle, borderWidth } from '../../common/Style'
import { checkboxChecked, checkboxUnchecked, checkboxUncheckedHover, outlineInfoIcon, searchIcon } from '../../Images'
import CustomizedSelect from '../../common/CustomizedSelect'
import { intl } from '../../../util/intl/intl'
import { SelectOverrides, TYPE } from 'baseui/select'
import { useSearchTeam } from '../../../api/TeamApi'
import { RenderTagList } from '../../common/TagList'
import { useNavigate } from 'react-router-dom'
import { updateBehandlingNameWithNumber } from '../common/utils'
import { Button, Modal, Tooltip } from '@navikt/ds-react'
import { buttonContentStyle } from '../../common/Button'
import AsyncSelect from 'react-select/async'
import { DropdownIndicator } from '../../krav/Edit/KravBegreperEdit'

type EditEtterlevelseDokumentasjonModalProps = {
  etterlevelseDokumentasjon?: EtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon?: (e: EtterlevelseDokumentasjonQL) => void
  isEditButton?: boolean
}

const selectCustomOverrides = (fieldName: string, fp: FieldProps | FieldArrayRenderProps): SelectOverrides => {
  return {
    SearchIcon: {
      component: () => <img src={searchIcon} alt="search icon" />,
      style: {
        display: 'flex',
        justifyContent: 'flex-end',
      },
    },
    SearchIconContainer: {
      style: {
        width: 'calc(100% - 20px)',
        display: 'flex',
        justifyContent: 'flex-end',
      },
    },
    IconsContainer: {
      style: {
        marginRight: '20px',
      },
    },
    ValueContainer: {
      style: {
        paddingLeft: '10px',
      },
    },
    ControlContainer: {
      style: {
        ...borderWidth('2px'),
        backgroundColor: fp.form.errors[fieldName] ? ettlevColors.error50 : ettlevColors.white,
        ...borderColor(fp.form.errors[fieldName] ? ettlevColors.red600 : ettlevColors.grey200),
      },
    },
  }
}

export const EditEtterlevelseDokumentasjonModal = (props: EditEtterlevelseDokumentasjonModalProps) => {
  const relevansOptions = codelist.getParsedOptions(ListName.RELEVANS)
  const [selectedFilter, setSelectedFilter] = useState<number[]>(relevansOptions.map((r, i) => i))
  const [hover, setHover] = useState<number>()
  const [isEtterlevelseDokumentasjonerModalOpen, setIsEtterlevelseDokumntasjonerModalOpen] = useState<boolean>(false)
  const [behandlingSearchResult, setBehandlingSearchResult, loadingBehandlingSearchResult] = useSearchBehandling()
  const [selectedVirkemiddel, setSelectedVirkemiddel] = useState<Virkemiddel>()
  const [teamSearchResult, setTeamSearchResult, loadingTeamSearchResult] = useSearchTeam()
  const navigate = useNavigate()

  useEffect(() => {
    if (props.etterlevelseDokumentasjon && props.etterlevelseDokumentasjon.irrelevansFor.length) {
      const irrelevans = props.etterlevelseDokumentasjon.irrelevansFor.map((ir: Code) => relevansOptions.findIndex((o) => o.value === ir.code))
      setSelectedFilter(
        relevansOptions
          .map((r, i) => {
            return i
          })
          .filter((n) => !irrelevans.includes(n)),
      )
    } else {
      setSelectedFilter(
        relevansOptions.map((r, i) => {
          return i
        }),
      )
    }

    if (props.etterlevelseDokumentasjon && props.etterlevelseDokumentasjon.virkemiddel && props.etterlevelseDokumentasjon.virkemiddel.navn) {
      setSelectedVirkemiddel(props.etterlevelseDokumentasjon.virkemiddel)
    }
  }, [props.etterlevelseDokumentasjon])

  const submit = async (etterlevelseDokumentasjon: EtterlevelseDokumentasjonQL) => {
    if (!etterlevelseDokumentasjon.id || etterlevelseDokumentasjon.id === 'ny') {
      await createEtterlevelseDokumentasjon(etterlevelseDokumentasjon).then((response) => {
        setIsEtterlevelseDokumntasjonerModalOpen(false)
        if (props.setEtterlevelseDokumentasjon) {
          props.setEtterlevelseDokumentasjon(response)
        }
        navigate(0)
      })
    } else {
      await updateEtterlevelseDokumentasjon(etterlevelseDokumentasjon).then((response) => {
        setIsEtterlevelseDokumntasjonerModalOpen(false)
        if (props.setEtterlevelseDokumentasjon) {
          props.setEtterlevelseDokumentasjon({ ...response, virkemiddel: selectedVirkemiddel })
        }
      })
    }
  }

  return (
    <div>
      <Button onClick={() => setIsEtterlevelseDokumntasjonerModalOpen(true)} size="small" variant="secondary" className="whitespace-nowrap">
        {props.isEditButton ? 'Rediger etterlevelsesdokumentet' : 'Nytt etterlevelsesdokument'}
      </Button>

      <Modal header={{ heading: props.isEditButton ? 'Rediger etterlevelsesdokumentet' : 'Opprett nytt etterlevelsesdokument' }} open={!!isEtterlevelseDokumentasjonerModalOpen} onClose={() => setIsEtterlevelseDokumntasjonerModalOpen(false)}>
        <Modal.Body>
          <Formik
            initialValues={etterlevelseDokumentasjonMapToFormVal(props.etterlevelseDokumentasjon ? props.etterlevelseDokumentasjon : {})}
            onSubmit={submit}
            validationSchema={etterlevelseDokumentasjonSchema()}
            validateOnChange={false}
            validateOnBlur={false}
          >
            {({ values, submitForm }) => {
              return (
                <Form>
                  <InputField disablePlaceHolder label="Skriv inn tittel på etterlevelsesdokumentet" name="title" />

                  {/* <BoolField label="Er produktet/systemet tilknyttet et virkemiddel?" name="knyttetTilVirkemiddel" /> */}

                  {/* {values.knyttetTilVirkemiddel ? (
                    <FieldWrapper>
                      <Field name="virkemiddelId">
                        {(fp: FieldProps) => {
                          return (
                            <FormControl label={<LabelWithTooltip label={'Legg til virkemiddel'} tooltip="Søk og legg til virkemiddel" />}>
                              <Block>
                                <CustomizedSelect
                                  labelKey={'navn'}
                                  noResultsMsg={intl.emptyTable}
                                  maxDropdownHeight="350px"
                                  searchable={true}
                                  type={TYPE.search}
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
                                  overrides={selectCustomOverrides('virkemiddelId', fp)}
                                />
                                {selectedVirkemiddel && (
                                  <Tag
                                    variant={VARIANT.outlined}
                                    onActionClick={() => {
                                      setSelectedVirkemiddel(undefined)
                                      fp.form.setFieldValue('virkemiddelId', '')
                                    }}
                                    overrides={{
                                      Text: {
                                        style: {
                                          fontSize: theme.sizing.scale650,
                                          lineHeight: theme.sizing.scale750,
                                          fontWeight: 400,
                                        },
                                      },
                                      Root: {
                                        style: {
                                          ...borderWidth('1px'),
                                          ':hover': {
                                            backgroundColor: ettlevColors.green50,
                                            borderColor: '#0B483F',
                                          },
                                        },
                                      },
                                    }}
                                  >
                                    {selectedVirkemiddel.navn}
                                  </Tag>
                                )}
                              </Block>
                            </FormControl>
                          )
                        }}
                      </Field>
                      <Error fieldName="virkemiddelId" fullWidth />
                    </FieldWrapper>
                  ) : ( */}
                  <div>
                    <LabelWithTooltip
                      tooltip="Kun krav fra egenskaper du velger som gjeldende vil være tilgjengelig for dokumentasjon."
                      label={'Hvilke egenskaper gjelder for etterlevelsen?'}
                    />
                    <FieldArray name="irrelevansFor">
                      {(p: FieldArrayRenderProps) => {
                        return (
                          <div className="h-full pt-5 w-[calc(100% - 16px)]" >
                            <ButtonGroup
                              mode="checkbox"
                              kind={KIND.secondary}
                              selected={selectedFilter}
                              size="mini"
                              onClick={(e, i) => {
                                if (!selectedFilter.includes(i)) {
                                  setSelectedFilter([...selectedFilter, i])
                                  p.remove(p.form.values.irrelevansFor.findIndex((ir: Code) => ir.code === relevansOptions[i].value))
                                } else {
                                  setSelectedFilter(selectedFilter.filter((value) => value !== i))
                                  p.push(codelist.getCode(ListName.RELEVANS, relevansOptions[i].value as string))
                                }
                              }}
                              overrides={{
                                Root: {
                                  style: {
                                    flexWrap: 'wrap',
                                  },
                                },
                              }}
                            >
                              {relevansOptions.map((r, i) => {
                                return (
                                  <BaseUIButton
                                    key={'relevans_' + r.value}
                                    type="button"
                                    startEnhancer={() => {
                                      if (selectedFilter.includes(i)) {
                                        return <img src={checkboxChecked} alt="checked" />
                                      } else if (!selectedFilter.includes(i) && hover === i) {
                                        return <img src={checkboxUncheckedHover} alt="checkbox hover" />
                                      } else {
                                        return <img src={checkboxUnchecked} alt="unchecked" />
                                      }
                                    }}
                                    overrides={{
                                      BaseButton: {
                                        style: {
                                          ...buttonContentStyle,
                                          backgroundColor: selectedFilter.includes(i) ? ettlevColors.green100 : ettlevColors.white,
                                          ...borderWidth('1px'),
                                          ...borderStyle('solid'),
                                          ...borderColor('#6A6A6A'),
                                          paddingLeft: '8px',
                                          paddingRight: '16px',
                                          paddingTop: '8px',
                                          paddingBottom: '10px',
                                          marginRight: '16px',
                                          marginBottom: '16px',
                                          ...borderRadius('4px'),
                                          ':hover': {
                                            backgroundColor: ettlevColors.white,
                                            boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.25), inset 0px -1px 0px rgba(0, 0, 0, 0.25);',
                                          },
                                          ':focus': {
                                            boxShadow: '0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 3px 0 rgba(0, 0, 0, .12)',
                                            outlineWidth: '3px',
                                            outlineStyle: 'solid',
                                            outlinwColor: ettlevColors.focusOutline,
                                          },
                                          width: '100%',
                                          maxWidth: '260px',
                                          justifyContent: 'flex-start',
                                        },
                                        props: {
                                          onMouseEnter: () => {
                                            setHover(i)
                                          },
                                          onMouseLeave: () => {
                                            setHover(undefined)
                                          },
                                        },
                                      },
                                    }}
                                  >
                                    <div className="w-full mr-1">
                                      <ParagraphMedium margin="0px" $style={{ lineHeight: '22px' }}>
                                        {r.label}
                                      </ParagraphMedium>
                                    </div>
                                    <Tooltip
                                      content={r.description}
                                      arrow
                                    >
                                      <div className="flex justify-end">
                                        <img src={outlineInfoIcon} alt="informasjons ikon" />
                                      </div>
                                    </Tooltip>
                                  </BaseUIButton>
                                )
                              })}
                            </ButtonGroup>
                          </div>
                        )
                      }}
                    </FieldArray>
                  </div>
                  {/* )} */}

                  <BoolField
                    label="Behandler løsningen du dokumenterer etterlevelse for personopplysninger?"
                    name="behandlerPersonopplysninger"
                    tooltip="Hvis produktet/systemet behandler personopplysninger må du ha en behandling i Behandlingskatalogen. Det er mulig å opprette etterlevelse og legge til behandling etterpå."
                  />

                  {values.behandlerPersonopplysninger && (
                    <FieldWrapper>
                      <FieldArray name="behandlinger">
                        {(p: FieldArrayRenderProps) => {
                          return (
                            <div>
                              <LabelWithTooltip
                                label={'Legg til behandlinger fra Behandlingskatalogen'}
                                tooltip="Siden løsningen behandler personopplysninger må du ha en behandling i Behandlingskatalogen. Du kan knytte én eller flere behandlinger til etterlevelsesdokumentet."
                              />
                              <div className="w-full">
                                <AsyncSelect
                                  aria-label="Søk etter behandlinger"
                                  placeholder="Søk etter behandlinger"
                                  components={{ DropdownIndicator }}
                                  noOptionsMessage={({ inputValue }) => (inputValue.length < 3 ? 'Skriv minst tre tegn for å søke' : `Fant ingen resultater for "${inputValue}"`)}
                                  controlShouldRenderValue={false}
                                  loadingMessage={() => 'Søker...'}
                                  isClearable={false}
                                  loadOptions={searchBehandlingOptions}
                                  onChange={(value) => {
                                    value && p.push(value)
                                  }}
                                  styles={{
                                    control: (base) => ({
                                      ...base,
                                      cursor: 'text',
                                      height: '48px'
                                    })
                                  }}
                                />
                              </div>
                              <RenderTagList list={p.form.values.behandlinger.map((b: Behandling) => 'B' + b.nummer + ' ' + b.navn)} onRemove={p.remove} />
                            </div>
                          )
                        }}
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
                        {(p: FieldArrayRenderProps) => {
                          return (
                            <div>
                              <LabelWithTooltip label="Legg til team fra Teamkatalogen" tooltip="" />
                              <div className="flex">
                                <CustomizedSelect
                                  overrides={selectCustomOverrides('teamsData', p)}
                                  placeholder="Søk team"
                                  aria-label="Søk team"
                                  noResultsMsg={intl.emptyTable}
                                  maxDropdownHeight="350px"
                                  searchable={true}
                                  type={TYPE.search}
                                  labelKey="name"
                                  onInputChange={(event) => {
                                    setTeamSearchResult(event.currentTarget.value)
                                  }}
                                  options={teamSearchResult}
                                  onChange={({ value }) => {
                                    value.length && p.push(value[0])
                                  }}
                                  isLoading={loadingTeamSearchResult}
                                  error={!!p.form.errors.teamsData && !!p.form.submitCount}
                                />
                              </div>
                              <RenderTagList list={p.form.values.teamsData.map((t: Team) => t.name)} onRemove={p.remove} />
                            </div>
                          )
                        }}
                      </FieldArray>
                    </FieldWrapper>
                  )}

                  <div className="flex justify-end">
                    <Button variant="secondary" onClick={() => setIsEtterlevelseDokumntasjonerModalOpen(false)}>
                      Avbryt
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        submitForm()
                      }}
                      className="ml-2.5"
                    >
                      {props.isEditButton ? 'Lagre' : 'Opprett'}
                    </Button>
                  </div>
                </Form>
              )
            }}
          </Formik>
        </Modal.Body>
      </Modal>
    </div>
  )
}
export default EditEtterlevelseDokumentasjonModal
