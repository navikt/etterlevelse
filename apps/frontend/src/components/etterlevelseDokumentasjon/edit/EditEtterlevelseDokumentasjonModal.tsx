import { Block } from 'baseui/block'
import { ModalBody, ModalFooter, ModalHeader } from 'baseui/modal'
import { useState } from 'react'
import { useSearchBehandling } from '../../../api/BehandlingApi'
import { etterlevelseDokumentasjonMapToFormVal, etterlevelseDokumentasjonToDto } from '../../../api/EtterlevelseDokumentasjonApi'
import { Behandling, EtterlevelseDokumentasjon } from '../../../constants'
import { Code, codelist, ListName } from '../../../services/Codelist'
import Button, { buttonContentStyle } from '../../common/Button'
import CustomizedModal from '../../common/CustomizedModal'
import { Button as BaseUIButton, KIND } from 'baseui/button'
import { Field, FieldArray, FieldArrayRenderProps, FieldProps, Form, Formik } from 'formik'
import { FormControl } from 'baseui/form-control'
import { FieldWrapper, InputField } from '../../common/Inputs'
import { ButtonGroup } from 'baseui/button-group'
import { ACCESSIBILITY_TYPE } from 'baseui/popover'
import { PLACEMENT } from 'baseui/toast'
import { StatefulTooltip } from 'baseui/tooltip'
import { ParagraphMedium } from 'baseui/typography'
import { theme } from '../../../util'
import { ettlevColors } from '../../../util/theme'
import LabelWithTooltip from '../../common/LabelWithTooltip'
import { borderWidth, borderStyle, borderColor, borderRadius } from '../../common/Style'
import { checkboxChecked, checkboxUncheckedHover, checkboxUnchecked, outlineInfoIcon, searchIcon } from '../../Images'
import { Tag, VARIANT } from 'baseui/tag'
import { Error } from '../../common/ModalSchema'
import CustomizedSelect from '../../common/CustomizedSelect'
import { intl } from '../../../util/intl/intl'
import { TYPE } from 'baseui/select'

export const EditEtterlevelseDokumentasjonModal = () => {
  const [etterlevelseDokumentasjon, setEtterlevelseDokumentasjon] = useState<EtterlevelseDokumentasjon>(etterlevelseDokumentasjonMapToFormVal({}))
  const relevansOptions = codelist.getParsedOptions(ListName.RELEVANS)
  const [selectedFilter, setSelectedFilter] = useState<number[]>(relevansOptions.map((r, i) => i))
  const [hover, setHover] = useState<number>()
  const [isEtterlevelseDokumentasjonerModalOpen, setIsEtterlevelseDokumntasjonerModalOpen] = useState<boolean>(false)
  const [behandlingSearchResult, setbehandlingSearchResult, loadingBehandlingSearchResult] = useSearchBehandling()
  const [selectedBehandling, setSelectedBehandling] = useState<Behandling>()

  return (
    <>
      <Button onClick={() => setIsEtterlevelseDokumntasjonerModalOpen(true)}>
        Ny Dokumentasjon
      </Button>

      <CustomizedModal isOpen={!!isEtterlevelseDokumentasjonerModalOpen} onClose={() => setIsEtterlevelseDokumntasjonerModalOpen(false)}>
        <ModalHeader>Etterlevelsedokumentasjon</ModalHeader>
        <ModalBody>
          <Formik initialValues={etterlevelseDokumentasjon} onSubmit={(values) => {
            let etterlevelseDokumentasjontemp = etterlevelseDokumentasjonToDto(values)
            console.log(values)
          }}>
            {({values}) => {
              return (
                <Form>
                  <InputField label={"Title"} name={"title"} />

                  <FieldWrapper>
                    <Field name="behandlingId">
                      {(fp: FieldProps) => {
                        return (
                          <FormControl label={<LabelWithTooltip label={'Behandling'} />}>
                            <Block>
                              <CustomizedSelect
                                overrides={{
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
                                    },
                                  },
                                }}
                                labelKey={'navn'}
                                noResultsMsg={intl.emptyTable}
                                maxDropdownHeight="350px"
                                searchable={true}
                                type={TYPE.search}
                                options={behandlingSearchResult}
                                placeholder={'Begreper'}
                                onInputChange={(event) => setbehandlingSearchResult(event.currentTarget.value)}
                                onChange={(params) => {
                                  let behandling = params.value.length ? params.value[0] : undefined
                                  if (behandling) {
                                    fp.form.values['behandlingId'] = behandling.id
                                    setSelectedBehandling(behandling as Behandling)
                                  }
                                }}
                                // error={!!fp.form.errors.begreper && !!fp.form.submitCount}
                                isLoading={loadingBehandlingSearchResult}
                              />
                              {selectedBehandling && (
                                <Tag
                                  variant={VARIANT.outlined}
                                  onActionClick={() => {
                                    setSelectedBehandling(undefined)
                                    fp.form.setFieldValue("behandlingId", "")
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
                                  {selectedBehandling.navn}
                                </Tag>
                              )}

                            </Block>
                          </FormControl>
                        )
                      }}
                    </Field>
                    <Error fieldName="begreper" fullWidth />
                  </FieldWrapper>

                  <LabelWithTooltip label={"Oppgi egenskaper til etterlevelsedokumentasjon. Kun relevante kraver blir synlig for etterlevelsedokumentasjon"} />
                  <FieldArray name="irrelevansFor">
                    {(p: FieldArrayRenderProps) => {
                      return (
                        <FormControl>
                          <Block height="100%" width="calc(100% - 16px)" paddingLeft={theme.sizing.scale700} paddingTop={theme.sizing.scale750}>
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

                  <Button>Submit</Button>
                  <Button onClick={() => setIsEtterlevelseDokumntasjonerModalOpen(false)}>Avbryt</Button>

                </Form>
              )
            }}
          </Formik>
        </ModalBody>
      </CustomizedModal>

    </>
  )
}
export default EditEtterlevelseDokumentasjonModal