import * as React from 'react'
import CustomizedModal from '../common/CustomizedModal'
import Button from '../common/Button'
import { Block } from 'baseui/block'
import { theme } from '../../util'
import { checkmarkIcon, crossIcon } from '../Images'
import { ettlevColors } from '../../util/theme'
import { H1, H2, Paragraph2, Paragraph4 } from 'baseui/typography'
import { Behandling, BehandlingEtterlevData, PageResponse } from '../../constants'
import { ButtonGroup, SHAPE } from 'baseui/button-group'
import { Button as BaseUIButton, KIND } from 'baseui/button'
import { Code, codelist, ListName } from '../../services/Codelist'
import { borderStyle, borderWidth } from '../common/Style'
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

const paddingRight = theme.sizing.scale3200
const paddingLeft = theme.sizing.scale3200

const EditBehandlingModal = (props: EditBehandlingModalProps) => {
  const options = codelist.getParsedOptions(ListName.RELEVANS)
  const [selected, setSelected] = React.useState<number[]>([])

  const { data, refetch } = useQuery<{ behandling: PageResponse<{ stats: BehandlingStats }> }>(statsQuery, {
    variables: { relevans: [] },
    skip: !props.behandling?.id,
  })

  const [stats, setStats] = React.useState<any[]>([])

  // TODO IMPLEMENT ENDPOINT FOR FETCHING ALL KRAV BASE ON RELEVANS
  // TODO OR USE KRAVGRAPQLAPI useKravFilter
  const filterData = (
    unfilteredData:
      | {
          behandling: PageResponse<{
            stats: BehandlingStats
          }>
        }
      | undefined,
  ) => {
    const StatusListe: any[] = []
    unfilteredData?.behandling.content.forEach(({ stats }) => {
      stats.fyltKrav.forEach((k) => {
        if (k.regelverk.length) {
          const relevans = k.relevansFor.map((r) => r.code)
          if (!relevans.length || !relevans.every((r) => !selected.map((i) => options[i].id).includes(r))) {
            StatusListe.push(k)
          } else if (k.etterlevelser.filter((e) => e.behandlingId === props.behandling?.id)) {
            StatusListe.push(k)
          }
        }
      })
      stats.ikkeFyltKrav.forEach((k) => {
        if (k.regelverk.length) {
          const relevans = k.relevansFor.map((r) => r.code)
          if (!relevans.length || !relevans.every((r) => !selected.map((i) => options[i].id).includes(r))) {
            StatusListe.push(k)
          } else if (k.etterlevelser.filter((e) => e.behandlingId === props.behandling?.id).length) {
            StatusListe.push(k)
          }
        }
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
    refetch()
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
            <Block backgroundColor={ettlevColors.green800} height="100px" width="100%">
              <Block display="flex" justifyContent="space-between" paddingLeft={paddingLeft} paddingRight={theme.sizing.scale900}>
                <Block>
                  <H1 color={ettlevColors.grey50} marginBottom="0px">
                    Tilpass egenskaper
                  </H1>
                  <Paragraph4 $style={{ lineHeight: '20px', color: ettlevColors.grey50 }} marginTop={theme.sizing.scale0}>
                    Behandling, overordnet behandlingsaktivitet
                  </Paragraph4>
                </Block>
                <Block display="flex" justifyContent="flex-end" paddingLeft={theme.sizing.scale1000}>
                  <Button kind="tertiary" onClick={props.close} $style={{ ':hover': { backgroundColor: 'transparent' } }}>
                    <img src={crossIcon} alt="close" />
                  </Button>
                </Block>
              </Block>
            </Block>

            <Block paddingLeft={paddingLeft} paddingRight={paddingRight} marginTop={theme.sizing.scale1400}>
              <H2>Egenskaper til behandling</H2>
              <FieldArray name="irrelevansFor">
                {(p: FieldArrayRenderProps) => {
                  return (
                    <FormControl>
                      <Block
                        maxHeight="100px"
                        height="100%"
                        width="100%"
                        backgroundColor={ettlevColors.grey50}
                        paddingLeft={theme.sizing.scale700}
                        paddingTop={theme.sizing.scale750}
                      >
                        <ButtonGroup
                          mode="checkbox"
                          shape={SHAPE.pill}
                          kind={KIND.secondary}
                          selected={selected}
                          onClick={(_event, index) => {
                            if (!selected.includes(index)) {
                              setSelected([...selected, index])
                              p.remove(p.form.values.irrelevansFor.findIndex((ir: Code) => ir.code === options[index].id))
                            } else {
                              setSelected(selected.filter((value) => value !== index))
                              p.push(codelist.getCode(ListName.RELEVANS, options[index].id as string))
                            }
                          }}
                        >
                          {options.map((r, i) => (
                            <BaseUIButton
                              key={r.id}
                              startEnhancer={selected.includes(i) ? <img src={checkmarkIcon} /> : undefined}
                              overrides={{
                                BaseButton: {
                                  style: {
                                    color: selected.includes(i) ? ettlevColors.green800 : ettlevColors.navGra80,
                                    backgroundColor: selected.includes(i) ? ettlevColors.green50 : ettlevColors.white,
                                    marginRight: theme.sizing.scale600,
                                    boxShadow: '0 3px 1px -2px rgba(0, 0, 0, .2), 0 2px 2px 0 rgba(0, 0, 0, .14), 0 1px 2px 0 rgba(0, 0, 0, .12)',
                                    ':hover': { boxShadow: '0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 3px 0 rgba(0, 0, 0, .12)' },
                                    ':active': { boxShadow: '0 2px 1px -2px rgba(0, 0, 0, .2), 0 1px 1px 0 rgba(0, 0, 0, .14), 0 1px 1px 0 rgba(0, 0, 0, .12)' },
                                    ':focus': {
                                      boxShadow: '0 2px 4px -1px rgba(0, 0, 0, .2), 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 3px 0 rgba(0, 0, 0, .12)',
                                      outline: `3px solid ${ettlevColors.focusOutline}`,
                                    },
                                    ...borderStyle('solid'),
                                    ...borderWidth('1px'),
                                  },
                                },
                              }}
                            >
                              {}
                              {r.label}
                            </BaseUIButton>
                          ))}
                        </ButtonGroup>
                        <Paragraph4 $style={{ lineHeight: '20px', fontWeight: 700 }} paddingBottom={theme.sizing.scale500}>
                          Egenskaper: {selected.length}
                        </Paragraph4>
                      </Block>
                    </FormControl>
                  )
                }}
              </FieldArray>

              <Block marginBottom="50px">
                <Paragraph2 $style={{ lineHeight: '20px' }} marginTop={theme.sizing.scale900} marginBottom={theme.sizing.scale900}>
                  Basert på dine opplysninger, skal behandlingen etterleve
                </Paragraph2>
                <Block display="flex" justifyContent="space-between">
                  <Block display="flex" alignItems="baseline" marginRight="30px">
                    <H1 color={ettlevColors.navOransje} marginRight={theme.sizing.scale300}>
                      {stats.length}
                    </H1>
                    <Paragraph2>krav</Paragraph2>
                  </Block>

                  <Block>
                    <Block display="flex" justifyContent="flex-end">
                      <Block>{!isValid && JSON.stringify(errors)}</Block>
                      <Button type="button" disabled={isSubmitting} marginRight onClick={submitForm}>
                        Lagre
                      </Button>
                      <Button type="button" kind="secondary" onClick={props.close}>
                        Avbryt
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
