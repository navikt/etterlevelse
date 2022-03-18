import { Etterlevelse, EtterlevelseStatus, KravQL, KravStatus } from '../../../constants'
import { Field, FieldProps, Form, Formik, FormikProps, validateYupSchema, yupToFormErrors } from 'formik'
import { mapEtterlevelseToFormValue } from '../../../api/EtterlevelseApi'
import { Block } from 'baseui/block'
import Button from '../../common/Button'
import React, { useEffect } from 'react'
import * as yup from 'yup'
import { DateField, FieldWrapper, TextAreaField } from '../../common/Inputs'
import { theme } from '../../../util'
import { FormControl } from 'baseui/form-control'

import { Label3, Paragraph2, Paragraph4 } from 'baseui/typography'
import { ettlevColors } from '../../../util/theme'
import { SuksesskriterierBegrunnelseEdit } from './SuksesskriterieBegrunnelseEdit'
import { Radio, RadioGroup } from 'baseui/radio'
import { Code } from '../../../services/Codelist'
import { Error } from '../../common/ModalSchema'
import { KIND as NKIND, Notification } from 'baseui/notification'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { borderColor, borderRadius, borderStyle, borderWidth, marginAll, paddingZero } from '../../common/Style'
import moment from 'moment'
import { CustomizedAccordion, CustomizedPanel, CustomPanelDivider } from '../../common/CustomizedAccordion'
import { AllInfo } from '../../krav/ViewKrav'
import CustomizedModal from '../../common/CustomizedModal'
import { useNavigate } from 'react-router-dom'
import EtterlevelseCard from '../EtterlevelseCard'
import { ModalHeader } from 'baseui/modal'
import _ from 'lodash'

type EditProps = {
  krav: KravQL
  etterlevelse: Etterlevelse
  submit: (etterlevelse: Etterlevelse) => Promise<void>
  formRef?: React.RefObject<any>
  varsleMelding?: string
  behandlingId?: string
  behandlingNummer: number
  behandlingformaal: string
  behandlingNavn: string
  disableEdit: boolean
  documentEdit?: boolean
  close: (k?: Etterlevelse | undefined) => void
  setIsAlertUnsavedModalOpen: (state: boolean) => void
  isAlertUnsavedModalOpen: boolean
  navigatePath: string
  setNavigatePath: (state: string) => void
  editedEtterlevelse?: Etterlevelse
  tidligereEtterlevelser?: Etterlevelse[]
}

const etterlevelseSchema = () => {
  return yup.object({
    suksesskriterieBegrunnelser: yup.array().of(
      yup.object({
        oppfylt: yup.boolean(),
        ikkeRelevant: yup.boolean(),
        behovForBegrunnelse: yup.boolean(),
        begrunnelse: yup.string().test({
          name: 'begrunnelseText',
          message: 'Du må fylle ut dokumentasjonen',
          test: function (begrunnelse) {
            const { parent, options } = this
            if (
              (options.context?.status === EtterlevelseStatus.FERDIG || options.context?.status === EtterlevelseStatus.FERDIG_DOKUMENTERT) &&
              (parent.oppfylt || parent.ikkeRelevant) &&
              (begrunnelse === '' || begrunnelse === undefined) &&
              parent.behovForBegrunnelse
            ) {
              return false
            } else {
              return true
            }
          },
        }),
        suksesskriterieId: yup.number().required('Begrunnelse må være knyttet til et suksesskriterie'),
      }),
    ),
    statusBegrunnelse: yup.string().test({
      name: 'statusBegrunnelse',
      message: 'Du må dokumentere på begrunnelse',
      test: function (statusBegrunnelse) {
        const { parent } = this
        if (parent.status === EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT && (statusBegrunnelse === '' || statusBegrunnelse === undefined)) {
          return false
        }
        return true
      },
    }),
    status: yup.string().test({
      name: 'etterlevelseStatus',
      message: 'Du må dokumentere alle kriterier før du har dokumentert  ferdig. Du kan velge å lagre og fortsette senere.',
      test: function (status) {
        const { parent } = this
        if (status === EtterlevelseStatus.FERDIG || status === EtterlevelseStatus.FERDIG_DOKUMENTERT) {
          return parent.suksesskriterieBegrunnelser.every((skb: any) => skb.oppfylt || skb.ikkeRelevant)
        }
        return true
      },
    }),
    fristForFerdigstillelse: yup.string().test({
      name: 'frist',
      message: 'Du må sette på en frist dato for ferdistilling',
      test: function (fristForFerdigstillelse) {
        const { parent } = this
        if (parent.status === EtterlevelseStatus.OPPFYLLES_SENERE && (fristForFerdigstillelse === undefined || fristForFerdigstillelse === null)) {
          return false
        }
        return true
      },
    }),
  })
}

const getEtterlevelseRadioLabel = (status?: EtterlevelseStatus) => {
  if (!status) return ''
  switch (status) {
    case EtterlevelseStatus.UNDER_REDIGERING:
      return 'Kravet skal etterleves nå'
    case EtterlevelseStatus.IKKE_RELEVANT:
      return 'Kravet er ikke relevant'
    case EtterlevelseStatus.OPPFYLLES_SENERE:
      return 'Kravet skal etterleves senere'
    default:
      return status
  }
}

export const EtterlevelseEditFields = ({
  krav, etterlevelse, submit, formRef, behandlingId, disableEdit, documentEdit, close, setIsAlertUnsavedModalOpen,
  isAlertUnsavedModalOpen, navigatePath, setNavigatePath, editedEtterlevelse, tidligereEtterlevelser
}: EditProps) => {
  const [etterlevelseStatus, setEtterlevelseStatus] = React.useState<string>(editedEtterlevelse ? editedEtterlevelse.status : etterlevelse.status || EtterlevelseStatus.UNDER_REDIGERING)
  const [radioHover, setRadioHover] = React.useState<string>('')
  const navigate = useNavigate()

  useEffect(() => {
    if (navigatePath) {
      if (_.isEqualWith(mapEtterlevelseToFormValue(etterlevelse, krav), formRef?.current.values)) {
        navigate(navigatePath)
      } else {
        setIsAlertUnsavedModalOpen(true)
      }
    }
  }, [navigatePath])

  const getTidligereEtterlevelser = () => {
    return tidligereEtterlevelser?.map((e) => {
      return (
        <CustomPanelDivider key={'tidligere_etterlevese_' + e.kravNummer + '_' + e.kravVersjon}>
          <EtterlevelseCard etterlevelse={e} />
        </CustomPanelDivider>
      )
    })
  }

  return (
    <Block width="100%">
      <Formik
        onSubmit={submit}
        initialValues={editedEtterlevelse ? mapEtterlevelseToFormValue(editedEtterlevelse) : mapEtterlevelseToFormValue(etterlevelse)}
        validate={(value) => {
          try {
            validateYupSchema(value, etterlevelseSchema(), true, { status: value.status })
          } catch (err) {
            return yupToFormErrors(err)
          }
        }}
        innerRef={formRef}
        validateOnChange={false}
        validateOnBlur={false}
      >
        {({ values, isSubmitting, submitForm, errors, setFieldError }: FormikProps<Etterlevelse>) => (
          <Block>
            <Block marginTop="32px">
              <Form>
                <Block>
                  <Block>
                    <Block>
                      <Block display="flex" width="100%">
                        <Block display="flex" width="100%" maxWidth="600px">
                          <FieldWrapper marginBottom="0px">
                            <Field name={'status'}>
                              {(p: FieldProps<string | Code>) => (
                                <FormControl
                                  label="Oppgi relevans for behandlingen"
                                  overrides={{
                                    Label: {
                                      style: {
                                        color: ettlevColors.navMorkGra,
                                        fontWeight: 700,
                                        lineHeight: '48px',
                                        fontSize: '18px',
                                        marginTop: '0px',
                                        marginBottom: '0px',
                                      },
                                    },
                                  }}
                                >
                                  <RadioGroup
                                    disabled={disableEdit}
                                    onMouseEnter={(e) => setRadioHover(e.currentTarget.children[1].getAttribute('value') || '')}
                                    onMouseLeave={() => setRadioHover('')}
                                    overrides={{
                                      Root: {
                                        style: {
                                          width: '100%',
                                          alignItems: 'flex-start',
                                        },
                                      },
                                      Label: {
                                        style: {
                                          fontSize: '18px',
                                          fontWeight: 400,
                                          lineHeight: '22px',
                                          width: '100%',
                                        },
                                      },
                                      RadioMarkOuter: {
                                        style: {
                                          height: theme.sizing.scale600,
                                          width: theme.sizing.scale600,
                                        },
                                      },
                                    }}
                                    value={
                                      etterlevelseStatus === EtterlevelseStatus.FERDIG_DOKUMENTERT ? EtterlevelseStatus.FERDIG :
                                        etterlevelseStatus === EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT ? EtterlevelseStatus.IKKE_RELEVANT :
                                          etterlevelseStatus
                                    }
                                    onChange={(event) => {
                                      p.form.setFieldValue('status', event.currentTarget.value)
                                      setEtterlevelseStatus(event.currentTarget.value)
                                    }}
                                  >
                                    {Object.values(EtterlevelseStatus).map((id) => {
                                      if (id === EtterlevelseStatus.OPPFYLLES_SENERE) {
                                        return (
                                          <Radio value={id} key={id}>
                                            <Block $style={{ textDecoration: radioHover === id ? 'underline' : 'none' }}>
                                              <Paragraph2 $style={{ lineHeight: '22px' }} marginTop="0px" marginBottom="0px">
                                                {getEtterlevelseRadioLabel(id)}
                                              </Paragraph2>
                                            </Block>

                                            {etterlevelseStatus === EtterlevelseStatus.OPPFYLLES_SENERE && (
                                              <Block width="100%">
                                                <Block maxWidth="170px" width="100%">
                                                  <DateField error={!!p.form.errors.fristForFerdigstillelse} label="Frist" name="fristForFerdigstillelse" />
                                                </Block>
                                                {p.form.errors.fristForFerdigstillelse && (
                                                  <Block display="flex" width="100%" marginTop=".2rem">
                                                    <Block width="100%">
                                                      <Notification
                                                        overrides={{
                                                          Body: {
                                                            style: { width: 'auto', ...paddingZero, marginTop: 0, backgroundColor: 'transparent', color: ettlevColors.red600 },
                                                          },
                                                        }}
                                                        kind={NKIND.negative}
                                                      >
                                                        {p.form.errors.fristForFerdigstillelse}
                                                      </Notification>
                                                    </Block>
                                                  </Block>
                                                )}
                                              </Block>
                                            )}
                                          </Radio>
                                        )
                                      }
                                      if (id === EtterlevelseStatus.FERDIG || id === EtterlevelseStatus.FERDIG_DOKUMENTERT || id === EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT
                                      ) {
                                        return null
                                      }
                                      return (
                                        <Radio value={id} key={id}>
                                          <Block $style={{ textDecoration: radioHover === id ? 'underline' : 'none' }}>
                                            <Paragraph2 $style={{ lineHeight: '22px' }} marginTop="0px" marginBottom="0px">
                                              {getEtterlevelseRadioLabel(id)}
                                            </Paragraph2>
                                          </Block>
                                        </Radio>
                                      )
                                    })}
                                  </RadioGroup>
                                </FormControl>
                              )}
                            </Field>
                          </FieldWrapper>
                        </Block>
                        <Block display="flex" width="100%">
                          {tidligereEtterlevelser && tidligereEtterlevelser.length >= 1 &&
                            <Block display="flex" width="100%" justifyContent="flex-end">
                              <Block width="100%" maxWidth="460px">
                                <CustomizedAccordion>
                                  <CustomizedPanel
                                    title="Se dokumentasjon på tidligere versjoner"
                                    overrides={{
                                      Content: {
                                        style:
                                        {
                                          backgroundColor: ettlevColors.white
                                        }
                                      },
                                    }}
                                    headerStyle={{
                                      fontSize: '18px',
                                      lineHeight: '18px',
                                      fontWeight: 700
                                    }}
                                  >
                                    {getTidligereEtterlevelser()}
                                  </CustomizedPanel>
                                </CustomizedAccordion>
                              </Block>
                            </Block>}
                        </Block>
                      </Block>
                      {(etterlevelseStatus === EtterlevelseStatus.IKKE_RELEVANT || etterlevelseStatus === EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT) && (
                        <Block maxWidth="471px" width="100%">
                          <TextAreaField label="Beskriv hvorfor kravet ikke er relevant" noPlaceholder name="statusBegrunnelse" />
                          <Error fieldName={'statusBegrunnelse'} fullWidth={true} />
                        </Block>
                      )}
                    </Block>

                    <Label3 $style={{ lineHeight: '32px' }}>Hvilke suksesskriterier er oppfylt?</Label3>

                    <SuksesskriterierBegrunnelseEdit disableEdit={disableEdit} suksesskriterie={krav.suksesskriterier} />

                    {/*
              {!documentEdit &&
                <>
                  <Block height={theme.sizing.scale600} />

                  <BoolField label='Etterleves' name='etterleves' />
                </>
              }

              <TextAreaField label='Dokumentasjon' name='begrunnelse' markdown />
              */}

                    {/*
          <MultiInputField label='Dokumentasjon' name='dokumentasjon'/>

          <Block height={theme.sizing.scale600}/>

          <DateField label='Frist for ferdigstillelse' name='fristForFerdigstillelse'/>

          <Block height={theme.sizing.scale600}/>
         */}

                    <Error fieldName={'status'} fullWidth={true} />

                    <Block marginBottom="24px">
                      <CustomizedAccordion>
                        <CustomizedPanel
                          title="Krav du bør se i relasjon til dette"
                          overrides={{ Content: { style: { backgroundColor: ettlevColors.white, paddingLeft: '20px', paddingRight: '20px' } } }}
                        >
                          <Block />
                        </CustomizedPanel>
                        <CustomizedPanel
                          title="Mer om kravet"
                          overrides={{ Content: { style: { backgroundColor: ettlevColors.white, paddingLeft: '20px', paddingRight: '20px' } } }}
                        >
                          <Block width="100%" height="1px" backgroundColor="#E3E3E3" />
                          <AllInfo krav={krav} alleKravVersjoner={[{ kravNummer: krav.kravNummer, kravVersjon: krav.kravVersjon, kravStatus: krav.status }]} />
                        </CustomizedPanel>
                      </CustomizedAccordion>
                    </Block>

                    <Block width={'100%'} marginTop={'65px'}>
                      {Object.keys(errors).length > 0 && (
                        <Block display="flex" width="60%">
                          <Block width="100%">
                            <Notification
                              overrides={{
                                Body: {
                                  style: {
                                    width: 'auto',
                                    ...borderStyle('solid'),
                                    ...borderWidth('1px'),
                                    ...borderColor(ettlevColors.red600),
                                    ...borderRadius('4px'),
                                  },
                                },
                              }}
                              kind={NKIND.negative}
                            >
                              <Block display="flex" justifyContent="center">
                                <FontAwesomeIcon
                                  icon={faTimesCircle}
                                  style={{
                                    marginRight: '5px',
                                  }}
                                />
                                <Paragraph2 marginBottom="0px" marginTop="0px" $style={{ lineHeight: '18px' }}>
                                  Du må fylle ut alle obligatoriske felter
                                </Paragraph2>
                              </Block>
                            </Notification>
                          </Block>
                        </Block>
                      )}
                    </Block>
                  </Block>
                </Block>
              </Form>
            </Block>

            <Block width="100%" height="140px" backgroundColor={ettlevColors.green100}>
              {!documentEdit && (
                <Block paddingTop="27px" paddingBottom="24px" display="flex" justifyContent="flex-end" width="100%">
                  <Button disabled={krav.status === KravStatus.UTGAATT ? false : disableEdit} type="button" kind="secondary" marginRight onClick={close}>
                    {krav.status === KravStatus.UTGAATT ? 'Lukk' : 'Avbryt og forkast endringene'}
                  </Button>
                  <Button
                    type="button"
                    kind="secondary"
                    marginRight
                    disabled={isSubmitting || disableEdit}
                    onClick={() => {
                      if (values.status === EtterlevelseStatus.FERDIG_DOKUMENTERT || values.status === EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT) {
                        values.status = Object.values(EtterlevelseStatus).filter((e) => e === etterlevelseStatus)[0]
                      }
                      if (values.status === EtterlevelseStatus.UNDER_REDIGERING) {
                        let completed = true
                        values.suksesskriterieBegrunnelser.forEach((value) => {
                          if (value.oppfylt || value.ikkeRelevant) {
                            if (!value.behovForBegrunnelse) {
                              completed = true
                            } else if (value.begrunnelse) {
                              completed = true
                            } else {
                              completed = false
                            }
                          } else {
                            completed = false
                          }
                        })
                        if (completed) {
                          values.status = EtterlevelseStatus.FERDIG
                        }
                      }
                      submitForm()
                    }}
                  >
                    Lagre og fortsett senere
                  </Button>
                  <Button
                    disabled={disableEdit}
                    type="button"
                    onClick={() => {
                      if (values.status !== EtterlevelseStatus.IKKE_RELEVANT && values.status !== EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT && values.status !== EtterlevelseStatus.OPPFYLLES_SENERE) {
                        values.status = EtterlevelseStatus.FERDIG_DOKUMENTERT
                        values.suksesskriterieBegrunnelser.forEach((skb, index) => {
                          if (skb.begrunnelse === '' || skb.begrunnelse === undefined) {
                            setFieldError(`suksesskriterieBegrunnelser[${index}]`, 'Du må fylle ut dokumentasjonen')
                          }
                        })
                      } else if (values.status === EtterlevelseStatus.IKKE_RELEVANT) {
                        values.status = EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT
                      }
                      submitForm()
                    }}
                  >
                    Registrer som ferdig utfylt
                  </Button>
                </Block>
              )}
              {etterlevelse.changeStamp.lastModifiedDate && etterlevelse.changeStamp.lastModifiedBy && (
                <Block paddingBottom="16px" display="flex" justifyContent="flex-end" width="100%">
                  <Paragraph4 marginTop="0px" marginBottom="0px">
                    Sist utfylt: {moment(etterlevelse.changeStamp.lastModifiedDate).format('ll')} av {etterlevelse.changeStamp.lastModifiedBy.split('-')[1]}
                  </Paragraph4>
                </Block>
              )}
            </Block>

            <CustomizedModal
              onClose={() => setIsAlertUnsavedModalOpen(false)}
              isOpen={isAlertUnsavedModalOpen}
              size="default"
              overrides={{
                Dialog: {
                  style: {
                    ...borderRadius('0px'),
                    ...marginAll('0px'),
                    maxWidth: '500px',
                    width: '100%'
                  },
                },
              }}
            >
              <Block width="100%">
                <ModalHeader>
                  Er du sikkert på at du vil forlate redigerings siden uten å lagre?
                </ModalHeader>

                <Block paddingBottom="32px" paddingLeft="24px" paddingRight="32px" display="flex" justifyContent="flex-end">
                  <Button
                    onClick={() => {
                      if (values.status === EtterlevelseStatus.FERDIG_DOKUMENTERT) {
                        values.status = Object.values(EtterlevelseStatus).filter((e) => e === etterlevelseStatus)[0]
                      }
                      submitForm()
                      navigate(navigatePath)
                      setIsAlertUnsavedModalOpen(false)
                    }}>
                    Lagre og fortsett
                  </Button>
                  <Button
                    marginLeft
                    onClick={() => {
                      navigate(navigatePath)
                      setIsAlertUnsavedModalOpen(false)
                    }}>
                    Fortsett uten å lagre
                  </Button>
                  <Button
                    marginLeft
                    kind='secondary'
                    onClick={() => {
                      setNavigatePath('')
                      setIsAlertUnsavedModalOpen(false)
                    }}>
                    Avbryt
                  </Button>
                </Block>
              </Block>
            </CustomizedModal>
          </Block>
        )}
      </Formik>
    </Block>
  )
}

export default EtterlevelseEditFields
