import {Etterlevelse, EtterlevelseStatus, Krav} from '../../constants'
import {Field, FieldProps, Form, Formik, FormikProps} from 'formik'
import {createEtterlevelse, mapEtterlevelseToFormValue, updateEtterlevelse} from '../../api/EtterlevelseApi'
import {Block} from 'baseui/block'
import Button from '../common/Button'
import React, {useEffect} from 'react'
import * as yup from 'yup'
import {getEtterlevelseStatus} from '../../pages/EtterlevelsePage'
import {DateField, FieldWrapper, TextAreaField} from '../common/Inputs'
import {theme} from '../../util'
import {FormControl} from 'baseui/form-control'
import {getKravByKravNumberAndVersion, useKrav, useSearchKrav} from '../../api/KravApi'
import {kravName, kravNumView} from '../../pages/KravPage'
import {behandlingName, useBehandling, useSearchBehandling} from '../../api/BehandlingApi'
import CustomizedSelect from '../common/CustomizedSelect'
import {H1, H2, Label3, Paragraph2} from 'baseui/typography'
import {arkPennIcon} from '../Images'
import {ettlevColors, responsivePaddingLarge} from '../../util/theme'
import {SuksesskriterierBegrunnelseEdit} from './Edit/SuksesskriterieBegrunnelseEdit'
import {Radio, RadioGroup} from 'baseui/radio'
import {Code} from '../../services/Codelist'
import {Error} from '../common/ModalSchema'
import {user} from '../../services/User'
import {KIND as NKIND, Notification} from 'baseui/notification'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faTimesCircle} from '@fortawesome/free-solid-svg-icons'
import {borderColor, borderRadius, borderStyle, borderWidth} from '../common/Style'

type EditEttlevProps = {
  etterlevelse: Etterlevelse
  krav: Krav
  close: (k?: Etterlevelse) => void
  formRef?: React.Ref<any>
  documentEdit?: boolean
  behandlingNavn?: string
}

const padding = '70px'

const modalPaddingRight = '104px'
const modalPaddingLeft = '112px'
const maxTextArea = '750px'


const etterlevelseSchema = () => {
  return yup.object({
    suksesskriterieBegrunnelser: yup.array().of(
      yup.object({
        oppfylt: yup.boolean(),
        ikkeRelevant: yup.boolean(),
        begrunnelse: yup.string().test({
          name: 'begrunnelseText',
          message: 'Du må fylle ut dokumentasjonen',
          test: function (begrunnelse) {
            const {parent} = this
            return ((parent.oppfylt || parent.ikkeRelevant) && !!begrunnelse === true) || (!parent.oppfylt && !parent.ikkeRelevant)
          },
        }),
        suksesskriterieId: yup.number().required('Begrunnelse må være knyttet til et suksesskriterie'),
      }),
    ),
    statusBegrunnelse: yup.string().test({
      name: 'statusBegrunnelse',
      message: 'Du må dokumentere på begrunnelse',
      test: function (statusBegrunnelse) {
        const {parent} = this
        if (parent.status === EtterlevelseStatus.IKKE_RELEVANT && (statusBegrunnelse === '' || statusBegrunnelse === undefined)) {
          return false
        }
        return true
      },
    }),
    status: yup.string().test({
      name: 'etterlevelseStatus',
      message: 'Du må dokumentere alle kriterier før du har dokumentert  ferdig. Du kan velge å lagre og fortsette senere.',
      test: function (status) {
        const {parent} = this
        if (status === EtterlevelseStatus.FERDIG || status === EtterlevelseStatus.FERDIG_DOKUMENTERT) {
          return parent.suksesskriterieBegrunnelser.every((skb: any) => (skb.oppfylt || skb.ikkeRelevant) && !!skb.begrunnelse)
        }
        return true
      },
    }),
  })
}

export const EditEtterlevelse = ({krav, etterlevelse, close, formRef, documentEdit, behandlingNavn}: EditEttlevProps) => {
  const [etterlevelseStatus, setEtterlevelseStatus] = React.useState<string>(etterlevelse.status || EtterlevelseStatus.UNDER_REDIGERING)
  const [nyereKrav, setNyereKrav] = React.useState<Krav>()
  const [disableEdit, setDisableEdit] = React.useState<boolean>(false)
  const [radioHover, setRadioHover] = React.useState<string>('')
  const submit = async (etterlevelse: Etterlevelse) => {
    const mutatedEtterlevelse = {
      ...etterlevelse,
      fristForFerdigstillelse: etterlevelse.status !== EtterlevelseStatus.OPPFYLLES_SENERE ? '' : etterlevelse.fristForFerdigstillelse,
    }

    if (etterlevelse.id) {
      close(await updateEtterlevelse(mutatedEtterlevelse))
    } else {
      close(await createEtterlevelse(mutatedEtterlevelse))
    }
  }

  useEffect(() => {
    getKravByKravNumberAndVersion(krav.kravNummer, krav.kravVersjon + 1).then(setNyereKrav)
  }, [krav])

  useEffect(() => {
    if (nyereKrav && !user.isAdmin()) {
      setDisableEdit(true)
    }
  }, [nyereKrav])

  return (
    <Formik
      onSubmit={submit}
      initialValues={mapEtterlevelseToFormValue(etterlevelse)}
      validationSchema={etterlevelseSchema()}
      innerRef={formRef}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {({values, isSubmitting, submitForm, errors}: FormikProps<Etterlevelse>) => (
        <Block>
          <Block backgroundColor={ettlevColors.green800}>
            <Block>
              <Block paddingLeft={responsivePaddingLarge} paddingRight={responsivePaddingLarge}>
                <Paragraph2 $style={{marginTop: '0px', marginBottom: '0px', color: ettlevColors.white}}>{kravNumView(krav)}</Paragraph2>
                <H1 $style={{marginTop: '0px', marginBottom: '0px', color: ettlevColors.white}}>{krav.navn}</H1>
                <Paragraph2 color={ettlevColors.white} marginBottom={0}>
                  <a href={'/krav/' + krav?.kravNummer + '/' + krav?.kravVersjon} style={{color: ettlevColors.white}} target="_blank"
                     rel="noopener noreferrer">
                    <span style={{display: 'inline-block', paddingBottom: '1px', borderBottom: '1px solid white'}}>detaljert kravbeskrivelse (ny fane)</span>
                  </a>
                </Paragraph2>
              </Block>
              <Block display="flex" paddingLeft={responsivePaddingLarge} paddingRight={responsivePaddingLarge} paddingBottom={theme.sizing.scale900}
                     paddingTop={theme.sizing.scale800}>
                <Block>
                  <Block display="flex">
                    <Label3 $style={{fontSize: '18px', color: ettlevColors.white}}>Du dokumenterer for:</Label3>
                  </Block>
                  <Paragraph2 $style={{marginTop: 0, marginBottom: 0, color: ettlevColors.white, maxWidth: '700px'}}>{behandlingNavn}</Paragraph2>
                </Block>
              </Block>
            </Block>
          </Block>
          <Block flex="1" backgroundColor={ettlevColors.white}>
            <Block
              paddingLeft={responsivePaddingLarge}
              paddingRight={responsivePaddingLarge}
              paddingBottom="16px"
              paddingTop="16px"
              display="flex"
            >
              <Block marginRight="20px">
                <img src={arkPennIcon} alt="test" height="56px" width="40px"/>
              </Block>
              <Block>
                <Paragraph2 marginBottom="0px" marginTop="0px">
                  Steg 3 av 3
                </Paragraph2>
                <H2 marginTop="0px" marginBottom="0px">
                  Dokumentasjon
                </H2>
              </Block>
            </Block>
          </Block>
          <Block paddingLeft={responsivePaddingLarge} paddingRight={responsivePaddingLarge}>
            <Block marginTop="51px">
              <Form>
                <Block>
                  <Block>
                    <FieldWrapper>
                      <Field name={'status'}>
                        {(p: FieldProps<string | Code>) => (
                          <FormControl
                            label="Er kravet oppfylt?"
                            overrides={{
                              Label: {
                                style: {
                                  color: ettlevColors.navMorkGra,
                                  fontWeight: 700,
                                  lineHeight: '48px',
                                  fontSize: '18px',
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
                              value={etterlevelseStatus === EtterlevelseStatus.FERDIG_DOKUMENTERT ? EtterlevelseStatus.FERDIG : etterlevelseStatus}
                              onChange={(event) => {
                                p.form.setFieldValue('status', event.currentTarget.value)
                                setEtterlevelseStatus(event.currentTarget.value)
                              }}
                            >
                              {Object.values(EtterlevelseStatus).map((id) => {
                                if (id === EtterlevelseStatus.OPPFYLLES_SENERE) {
                                  return (
                                    <Radio value={id} key={id}>
                                      <Block $style={{textDecoration: radioHover === id ? 'underline' : 'none'}}>
                                        <Paragraph2 $style={{lineHeight: '22px'}} marginTop="0px" marginBottom="0px">
                                          {getEtterlevelseStatus(id)}
                                        </Paragraph2>
                                      </Block>

                                      {etterlevelseStatus === EtterlevelseStatus.OPPFYLLES_SENERE && (
                                        <Block maxWidth="170px" width="100%">
                                          <DateField label="Frist (valgfritt)" name="fristForFerdigstillelse"/>
                                        </Block>
                                      )}
                                    </Radio>
                                  )
                                }
                                if (id === EtterlevelseStatus.IKKE_RELEVANT) {
                                  return (
                                    <Radio value={id} key={id}>
                                      <Block $style={{textDecoration: radioHover === id ? 'underline' : 'none'}}>
                                        <Paragraph2 $style={{lineHeight: '22px'}} marginTop="0px" marginBottom="0px">
                                          {getEtterlevelseStatus(id)}
                                        </Paragraph2>
                                      </Block>
                                      {etterlevelseStatus === EtterlevelseStatus.IKKE_RELEVANT && (
                                        <Block maxWidth="471px" width="100%">
                                          <TextAreaField label="Beskriv hvorfor kravet ikke er relevant" noPlaceholder name="statusBegrunnelse"/>
                                          <Error fieldName={'statusBegrunnelse'} fullWidth={true}/>
                                        </Block>
                                      )}
                                    </Radio>
                                  )
                                }
                                if (id === EtterlevelseStatus.FERDIG_DOKUMENTERT) {
                                  return null
                                }
                                return (
                                  <Radio value={id} key={id}>
                                    <Block $style={{textDecoration: radioHover === id ? 'underline' : 'none'}}>
                                      <Paragraph2 $style={{lineHeight: '22px'}} marginTop="0px" marginBottom="0px">
                                        {getEtterlevelseStatus(id)}
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

                    <Label3 $style={{lineHeight: '32px'}}>Hvilke suksesskriterier er oppfylt?</Label3>

                    <SuksesskriterierBegrunnelseEdit disableEdit={disableEdit} suksesskriterie={krav.suksesskriterier}/>

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

                    <Error fieldName={'status'} fullWidth={true}/>
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
                                  }
                                }
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
                                <Paragraph2 marginBottom="0px" marginTop="0px" $style={{lineHeight: '18px'}}>
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
          </Block>
          {!documentEdit && (
            <Block
              className="edit-etterlevelse-button-container"
              paddingLeft={responsivePaddingLarge}
              paddingRight={responsivePaddingLarge}
              paddingTop="14px"
              paddingBottom="14px"
              display="flex"
              marginBottom={theme.sizing.scale3200}
            >
              <Button disabled={disableEdit} type="button" kind="secondary" marginRight onClick={close}>
                Avbryt og forkast endringene
              </Button>
              <Button type="button" kind="secondary" marginRight disabled={isSubmitting || disableEdit} onClick={submitForm}>
                Lagre og fortsett senere
              </Button>
              <Button
                disabled={disableEdit}
                type="button"
                onClick={() => {
                  if (values.status !== EtterlevelseStatus.IKKE_RELEVANT) {
                    values.status = EtterlevelseStatus.FERDIG_DOKUMENTERT
                  }
                  submitForm()
                }}
              >
                Jeg har dokumentert ferdig
              </Button>
            </Block>
          )}
        </Block>
      )}
    </Formik>
  )
}

export const SearchKrav = (props: { kravNummer: number; kravVersjon: number }) => {
  const [results, setSearch, loading] = useSearchKrav()
  const [krav, setKrav] = useKrav(props, true)

  return (
    <Field name={'kravNummer'}>
      {(p: FieldProps<string>) => {
        return (
          <FormControl label={'Krav'} error={p.meta.error}>
            <CustomizedSelect
              placeholder={'Søk krav'}
              maxDropdownHeight="400px"
              filterOptions={(o) => o}
              searchable
              noResultsMsg="Ingen resultat"
              options={results.map((k) => ({id: k.id, label: kravName(k)}))}
              value={krav ? [{id: krav.id, label: kravName(krav)}] : []}
              onChange={({value}) => {
                const kravSelect = value.length ? results.find((k) => k.id === value[0].id)! : undefined
                setKrav(kravSelect)
                p.form.setFieldValue('kravNummer', kravSelect?.kravNummer)
                p.form.setFieldValue('kravVersjon', kravSelect?.kravVersjon)
              }}
              onInputChange={(event) => setSearch(event.currentTarget.value)}
              isLoading={loading}
            />
          </FormControl>
        )
      }}
    </Field>
  )
}

export const SearchBehandling = (props: { id: string }) => {
  const [results, setSearch, loading] = useSearchBehandling()
  const [behandling, setBehandling] = useBehandling(props.id)

  return (
    <Field name={'behandlingId'}>
      {(p: FieldProps<string>) => {
        return (
          <FormControl label={'Behandling'} error={p.meta.error}>
            <CustomizedSelect
              placeholder={'Søk behandling'}
              maxDropdownHeight="400px"
              filterOptions={(o) => o}
              searchable
              noResultsMsg="Ingen resultat"
              options={results.map((k) => ({id: k.id, label: behandlingName(k)}))}
              value={behandling ? [{id: behandling.id, label: behandlingName(behandling)}] : []}
              onChange={({value}) => {
                const select = value.length ? results.find((k) => k.id === value[0].id)! : undefined
                setBehandling(select)
                p.form.setFieldValue('behandlingId', select?.id)
              }}
              onInputChange={(event) => setSearch(event.currentTarget.value)}
              isLoading={loading}
            />
          </FormControl>
        )
      }}
    </Field>
  )
}
