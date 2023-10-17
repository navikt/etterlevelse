import { Block } from 'baseui/block'
import { ModalBody, ModalHeader } from 'baseui/modal'
import { useEffect, useState } from 'react'
import { useSearchBehandling } from '../../../api/BehandlingApi'
import {
  createEtterlevelseDokumentasjon,
  etterlevelseDokumentasjonMapToFormVal,
  etterlevelseDokumentasjonSchema,
  updateEtterlevelseDokumentasjon,
} from '../../../api/EtterlevelseDokumentasjonApi'
import { Behandling, EtterlevelseDokumentasjonQL, Team, Virkemiddel } from '../../../constants'
import { Code, codelist, ListName } from '../../../services/Codelist'
import Button, { buttonContentStyle } from '../../common/Button'
import CustomizedModal from '../../common/CustomizedModal'
import { Button as BaseUIButton, KIND } from 'baseui/button'
import { FieldArray, FieldArrayRenderProps, FieldProps, Form, Formik } from 'formik'
import { FormControl } from 'baseui/form-control'
import { BoolField, FieldWrapper, InputField } from '../../common/Inputs'
import { ButtonGroup } from 'baseui/button-group'
import { ACCESSIBILITY_TYPE } from 'baseui/popover'
import { PLACEMENT } from 'baseui/toast'
import { StatefulTooltip } from 'baseui/tooltip'
import { ParagraphMedium } from 'baseui/typography'
import { theme } from '../../../util'
import { ettlevColors } from '../../../util/theme'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import { borderColor, borderRadius, borderStyle, borderWidth } from '../../common/Style'
import { checkboxChecked, checkboxUnchecked, checkboxUncheckedHover, editIcon, outlineInfoIcon, plusIcon, searchIcon } from '../../Images'
import CustomizedSelect from '../../common/CustomizedSelect'
import { intl } from '../../../util/intl/intl'
import { SelectOverrides, TYPE } from 'baseui/select'
import { useSearchTeam } from '../../../api/TeamApi'
import { RenderTagList } from '../../common/TagList'
import { useNavigate } from 'react-router-dom'
import { updateBehandlingNameWithNumber } from '../common/utils'

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
      const irrelevans = props.etterlevelseDokumentasjon.irrelevansFor.map((ir: Code) => relevansOptions.findIndex((o) => o.id === ir.code))
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
      console.log(etterlevelseDokumentasjon)
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
    <Block>
      <Button
        onClick={() => setIsEtterlevelseDokumntasjonerModalOpen(true)}
        startEnhancer={props.isEditButton ? <img src={editIcon} alt="edit icon" /> : <img src={plusIcon} alt="plus icon" />}
        size="compact"
      >
        {props.isEditButton ? 'Rediger etterlevelsesdokumentet' : 'Nytt etterlevelsesdokument'}
      </Button>

      <CustomizedModal size="default" isOpen={!!isEtterlevelseDokumentasjonerModalOpen} onClose={() => setIsEtterlevelseDokumntasjonerModalOpen(false)} closeable={false}>
        <ModalHeader>{props.isEditButton ? 'Rediger etterlevelsesdokumentet' : 'Opprett nytt etterlevelsesdokument'}</ModalHeader>
        <ModalBody>
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
                  <>
                    <LabelWithTooltip
                      tooltip="Kun krav fra egenskaper du velger som gjeldende vil være tilgjengelig for dokumentasjon."
                      label={'Hvilke egenskaper gjelder for etterlevelsen?'}
                    />
                    <FieldArray name="irrelevansFor">
                      {(p: FieldArrayRenderProps) => {
                        return (
                          <FormControl>
                            <Block height="100%" width="calc(100% - 16px)" paddingTop={theme.sizing.scale750}>
                              <ButtonGroup
                                mode="checkbox"
                                kind={KIND.secondary}
                                selected={selectedFilter}
                                size="mini"
                                onClick={(e, i) => {
                                  if (!selectedFilter.includes(i)) {
                                    setSelectedFilter([...selectedFilter, i])
                                    p.remove(p.form.values.irrelevansFor.findIndex((ir: Code) => ir.code === relevansOptions[i].id))
                                  } else {
                                    setSelectedFilter(selectedFilter.filter((value) => value !== i))
                                    p.push(codelist.getCode(ListName.RELEVANS, relevansOptions[i].id as string))
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
                                      key={'relevans_' + r.id}
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
                                      <Block width="100%" marginRight="5px">
                                        <ParagraphMedium margin="0px" $style={{ lineHeight: '22px' }}>
                                          {r.label}
                                        </ParagraphMedium>
                                      </Block>
                                      <StatefulTooltip
                                        content={() => <Block padding="20px">{r.description}</Block>}
                                        placement={PLACEMENT.bottom}
                                        accessibilityType={ACCESSIBILITY_TYPE.tooltip}
                                        returnFocus
                                        showArrow
                                        autoFocus
                                      >
                                        <Block display="flex" justifyContent="flex-end">
                                          <img src={outlineInfoIcon} alt="informasjons ikon" />
                                        </Block>
                                      </StatefulTooltip>
                                    </BaseUIButton>
                                  )
                                })}
                              </ButtonGroup>
                            </Block>
                          </FormControl>
                        )
                      }}
                    </FieldArray>
                  </>
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
                            <FormControl
                              label={
                                <LabelWithTooltip
                                  label={'Legg til behandlinger fra Behandlingskatalogen'}
                                  tooltip="Siden løsningen behandler personopplysninger må du ha en behandling i Behandlingskatalogen. Du kan knytte én eller flere behandlinger til etterlevelsesdokumentet."
                                />
                              }
                            >
                              <Block>
                                <Block display="flex">
                                  <CustomizedSelect
                                    overrides={selectCustomOverrides('behandlinger', p)}
                                    placeholder="Søk behandlinger"
                                    aria-label="Søk behandlinger"
                                    noResultsMsg={intl.emptyTable}
                                    maxDropdownHeight="350px"
                                    searchable={true}
                                    type={TYPE.search}
                                    labelKey="navn"
                                    onInputChange={(event) => setBehandlingSearchResult(event.currentTarget.value)}
                                    options={updateBehandlingNameWithNumber(behandlingSearchResult)}
                                    onChange={({ value }) => {
                                      value.length && p.push(value[0])
                                    }}
                                    isLoading={loadingBehandlingSearchResult}
                                    error={!!p.form.errors.behandlinger && !!p.form.submitCount}
                                  />
                                </Block>
                                <RenderTagList wide list={p.form.values.behandlinger.map((b: Behandling) => b.navn)} onRemove={p.remove} />
                              </Block>
                            </FormControl>
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
                            <FormControl label={<LabelWithTooltip label="Legg til team fra Teamkatalogen" tooltip="" />}>
                              <Block>
                                <Block display="flex">
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
                                </Block>
                                <RenderTagList wide list={p.form.values.teamsData.map((t: Team) => t.name)} onRemove={p.remove} />
                              </Block>
                            </FormControl>
                          )
                        }}
                      </FieldArray>
                    </FieldWrapper>
                  )}

                  <Block display="flex" justifyContent="flex-end">
                    <Button kind="secondary" type="button" onClick={() => setIsEtterlevelseDokumntasjonerModalOpen(false)}>
                      Avbryt
                    </Button>
                    <Button
                      marginLeft={true}
                      type="button"
                      onClick={() => {
                        submitForm()
                      }}
                    >
                      {props.isEditButton ? 'Lagre' : 'Opprett'}
                    </Button>
                  </Block>
                </Form>
              )
            }}
          </Formik>
        </ModalBody>
      </CustomizedModal>
    </Block>
  )
}
export default EditEtterlevelseDokumentasjonModal
