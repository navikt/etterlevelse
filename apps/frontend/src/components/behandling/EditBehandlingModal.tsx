import * as React from 'react'
import CustomizedModal from '../common/CustomizedModal'
import Button, { buttonContentStyle } from '../common/Button'
import { Block } from 'baseui/block'
import { theme } from '../../util'
import { checkboxChecked, checkboxUnchecked, checkboxUncheckedHover, crossIcon } from '../Images'
import { ettlevColors } from '../../util/theme'
import { HeadingXLarge, HeadingXXLarge, ParagraphMedium, ParagraphXSmall } from 'baseui/typography'
import { Behandling, BehandlingEtterlevData, KravQL, KravStatus, PageResponse } from '../../constants'
import { ButtonGroup } from 'baseui/button-group'
import { Button as BaseUIButton, KIND } from 'baseui/button'
import { Code, codelist, ListName } from '../../services/Codelist'
import { borderRadius, marginZero } from '../common/Style'
import { FieldArray, FieldArrayRenderProps, Form, Formik } from 'formik'
import { mapToFormVal, updateBehandling } from '../../api/BehandlingApi'
import * as yup from 'yup'
import { FormControl } from 'baseui/form-control'
import { gql, useQuery } from '@apollo/client'
import { BehandlingStats } from './ViewBehandling'
import { ModalOverrides } from 'baseui/modal'

type EditBehandlingModalProps = {
  showModal: boolean
  behandling: Behandling
  close: (behandling?: BehandlingEtterlevData) => void
  formRef: React.Ref<any>
  setBehandling: Function
}

const paddingRight = ['16px', '16px', '16px', '16px', theme.sizing.scale3200, theme.sizing.scale3200]
const paddingLeft = ['16px', '16px', '16px', '16px', theme.sizing.scale3200, theme.sizing.scale3200]
const EditBehandlingModal = (props: EditBehandlingModalProps) => {
  const options = codelist.getParsedOptions(ListName.RELEVANS)
  const [selected, setSelected] = React.useState<number[]>([])
  const [hover, setHover] = React.useState<number>()

  const { data } = useQuery<{ behandling: PageResponse<{ stats: BehandlingStats }> }>(statsQuery, {
    variables: {
      relevans: options.map((o) => {
        return o.id
      }),
    },
    skip: !props.behandling?.id,
    fetchPolicy: 'no-cache',
  })

  const [stats, setStats] = React.useState<any[]>([])

  const filterData = (
    unfilteredData:
      | {
          behandling: PageResponse<{
            stats: BehandlingStats
          }>
        }
      | undefined,
  ) => {
    let StatusListe: any[] = []

    const filterKrav = (k: KravQL) => {
      if (k.regelverk.length && k.status === KravStatus.AKTIV) {
        const relevans = k.relevansFor.map((r) => r.code)
        if (!relevans.length || !relevans.every((r) => !selected.map((i) => options[i].id).includes(r))) {
          StatusListe.push(k)
        } else if (k.etterlevelser.filter((e) => e.behandlingId === props.behandling?.id).length) {
          StatusListe.push(k)
        }
      }
    }

    unfilteredData?.behandling.content.forEach(({ stats }) => {
      stats.fyltKrav.forEach((k) => {
        filterKrav(k)
      })
      stats.ikkeFyltKrav.forEach((k) => {
        filterKrav(k)
      })
    })

    StatusListe.sort((a, b) => {
      if (a.kravNummer === b.kravNummer) {
        return a.kravVersjon - b.kravVersjon
      }

      return a.kravNummer - b.kravNummer
    })

    for (let index = StatusListe.length - 1; index > 0; index--) {
      if (StatusListe[index].kravNummer === StatusListe[index - 1].kravNummer) {
        StatusListe.splice(index - 1, 1)
      }
    }

    return StatusListe
  }

  React.useEffect(() => {
    setStats(filterData(data))
  }, [selected])

  React.useEffect(() => {
    setStats(filterData(data))
  }, [data])

  React.useEffect(() => {
    if (props.behandling.irrelevansFor.length) {
      const irrelevans = props.behandling.irrelevansFor.map((ir: Code) => options.findIndex((o) => o.id === ir.code))
      setSelected(
        options
          .map((r, i) => {
            return i
          })
          .filter((n) => !irrelevans.includes(n)),
      )
    } else {
      setSelected(
        options.map((r, i) => {
          return i
        }),
      )
    }
  }, [props.behandling])

  const customOverrides: ModalOverrides = {
    DialogContainer: {
      style: {
        paddingTop: '100px',
      },
    },
    Dialog: {
      style: {
        height: '100%',
        ...borderRadius('8px'),
      },
    },
  }

  return (
    <Formik
      onSubmit={async (b: BehandlingEtterlevData) => props.close(await updateBehandling(b))}
      initialValues={mapToFormVal(props.behandling)}
      validationSchema={behandlingSchema()}
      innerRef={props.formRef}
    >
      {({ isSubmitting, isValid, errors, submitForm }) => (
        <Form>
          <CustomizedModal isOpen={!!props.showModal} overrides={customOverrides}>
            <Block $style={{ borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }} backgroundColor={ettlevColors.green800} height="100px" width="100%">
              <Block display="flex" justifyContent="space-between" paddingLeft={paddingLeft} paddingRight={theme.sizing.scale900}>
                <Block>
                  <HeadingXXLarge color={ettlevColors.grey50} marginBottom="0px">
                    Tilpass egenskaper
                  </HeadingXXLarge>
                  <ParagraphXSmall $style={{ lineHeight: '20px', color: ettlevColors.grey50 }} marginTop={theme.sizing.scale0}>
                    {`B${props.behandling.nummer} - ${props.behandling.overordnetFormaal.shortName}: ${props.behandling.navn}`}
                  </ParagraphXSmall>
                </Block>
                <Block display="flex" justifyContent="flex-end" paddingLeft={theme.sizing.scale1000}>
                  <Button kind="tertiary" onClick={props.close} $style={{ ':hover': { backgroundColor: 'transparent' } }}>
                    <img src={crossIcon} alt="close" />
                  </Button>
                </Block>
              </Block>
            </Block>

            <Block paddingLeft={paddingLeft} paddingRight={paddingRight} marginTop={theme.sizing.scale1400}>
              <HeadingXLarge>Egenskaper til behandling</HeadingXLarge>
              <ParagraphMedium $style={{ lineHeight: '20px' }}>Ved å oppgi egenskaper til behandlingen, blir kun relevante krav synlig for dokumentasjon.</ParagraphMedium>
              <FieldArray name="irrelevansFor">
                {(p: FieldArrayRenderProps) => {
                  return (
                    <FormControl>
                      <Block height="100%" width="calc(100% - 16px)" paddingLeft={theme.sizing.scale700} paddingTop={theme.sizing.scale750}>
                        <ButtonGroup
                          mode="checkbox"
                          kind={KIND.secondary}
                          selected={selected}
                          size="mini"
                          onClick={(e, i) => {
                            if (!selected.includes(i)) {
                              setSelected([...selected, i])
                              p.remove(p.form.values.irrelevansFor.findIndex((ir: Code) => ir.code === options[i].id))
                            } else {
                              setSelected(selected.filter((value) => value !== i))
                              p.push(codelist.getCode(ListName.RELEVANS, options[i].id as string))
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
                          {options.map((r, i) => {
                            return (
                              <BaseUIButton
                                key={'relevans_' + r.id}
                                startEnhancer={() => {
                                  if (selected.includes(i)) {
                                    return <img src={checkboxChecked} alt="" />
                                  } else if (!selected.includes(i) && hover === i) {
                                    return <img src={checkboxUncheckedHover} alt="" />
                                  } else {
                                    return <img src={checkboxUnchecked} alt="" />
                                  }
                                }}
                                overrides={{
                                  BaseButton: {
                                    style: {
                                      ...buttonContentStyle,
                                      backgroundColor: selected.includes(i) ? ettlevColors.green100 : ettlevColors.white,
                                      border: '1px solid #6A6A6A',
                                      paddingLeft: '8px',
                                      paddingRight: '16px',
                                      paddingTop: '8px',
                                      paddingBottom: '10px',
                                      marginRight: '16px',
                                      marginBottom: '16px',
                                      borderRadius: '4px',
                                      ':hover': {
                                        backgroundColor: ettlevColors.white,
                                        boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.25), inset 0px -1px 0px rgba(0, 0, 0, 0.25);',
                                      },
                                      ':focus': {
                                        boxShadow: '0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 3px 0 rgba(0, 0, 0, .12)',
                                        outline: `3px solid ${ettlevColors.focusOutline}`,
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
                                <ParagraphMedium margin="0px" $style={{ lineHeight: '22px' }}>
                                  {r.label}
                                </ParagraphMedium>
                              </BaseUIButton>
                            )
                          })}
                        </ButtonGroup>
                      </Block>
                    </FormControl>
                  )
                }}
              </FieldArray>

              <Block marginBottom="50px">
                <ParagraphMedium $style={{ lineHeight: '20px' }} marginTop={theme.sizing.scale900} marginBottom={theme.sizing.scale600}>
                  Basert på dine opplysninger, skal behandlingen etterleve
                </ParagraphMedium>
                <Block>
                  <Block>
                    <Block display="flex" alignItems="baseline" marginRight="30px">
                      <ParagraphMedium
                        $style={{ ...marginZero, fontWeight: 900, fontSize: '32px', lineHeight: '40px' }}
                        color={ettlevColors.navOransje}
                        marginRight={theme.sizing.scale300}
                      >
                        {stats.length}
                      </ParagraphMedium>
                      <ParagraphMedium $style={{ ...marginZero }}>krav</ParagraphMedium>
                    </Block>
                  </Block>
                  <Block
                    display="flex"
                    justifyContent="flex-end"
                    $style={{
                      borderBottomWidth: '1px',
                      borderBottomStyle: 'solid',
                      borderBottomColor: '#E3E3E3',
                      marginBottom: '22px',
                      marginTop: '-30px',
                    }}
                  >
                    <ParagraphXSmall $style={{ lineHeight: '20px', fontWeight: 700 }}>Egenskaper: {selected.length} valgt</ParagraphXSmall>
                  </Block>
                  <Block>
                    <Block display="flex" justifyContent="flex-end">
                      <Block>{!isValid && JSON.stringify(errors)}</Block>
                      <Button type="button" kind="secondary" marginRight onClick={props.close}>
                        Avbryt
                      </Button>
                      <Button type="button" disabled={isSubmitting} onClick={submitForm}>
                        Lagre
                      </Button>
                    </Block>
                  </Block>
                </Block>
              </Block>
            </Block>
          </CustomizedModal>
        </Form>
      )}
    </Formik>
  )
}

const behandlingSchema = () => {
  return yup.object({})
}

const statsQuery = gql`
  query getBehandlingStats($relevans: [String!]) {
    behandling(filter: { relevans: $relevans }) {
      content {
        stats {
          fyltKrav {
            kravNummer
            kravVersjon
            status
            relevansFor {
              code
            }
            etterlevelser(onlyForBehandling: true) {
              behandlingId
              status
            }
            regelverk {
              lov {
                code
                shortName
              }
            }
          }
          ikkeFyltKrav {
            kravNummer
            kravVersjon
            status
            relevansFor {
              code
            }
            etterlevelser(onlyForBehandling: true) {
              behandlingId
              status
            }
            regelverk {
              lov {
                code
                shortName
              }
            }
          }
        }
      }
    }
  }
`

export default EditBehandlingModal
