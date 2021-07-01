import { Etterlevelse, EtterlevelseStatus, Krav } from '../../constants'
import { Field, FieldProps, Form, Formik, FormikProps } from 'formik'
import { createEtterlevelse, mapEtterlevelseToFormValue, updateEtterlevelse } from '../../api/EtterlevelseApi'
import { Block } from 'baseui/block'
import Button from '../common/Button'
import React from 'react'
import * as yup from 'yup'
import { getEtterlevelseStatus } from '../../pages/EtterlevelsePage'
import { DateField, FieldWrapper } from '../common/Inputs'
import { theme } from '../../util'
import { FormControl } from 'baseui/form-control'
import { useKrav, useSearchKrav } from '../../api/KravApi'
import { kravName, kravNumView } from '../../pages/KravPage'
import { behandlingName, useBehandling, useSearchBehandling } from '../../api/BehandlingApi'
import CustomizedSelect from '../common/CustomizedSelect'
import { H2, Label3, Paragraph2 } from 'baseui/typography'
import { ExternalLink } from '../common/RouteLink'
import { circlePencilIcon } from '../Images'
import { ettlevColors } from '../../util/theme'
import { Card } from 'baseui/card'
import { SuksesskriterierBegrunnelseEdit } from './Edit/SuksesskriterieBegrunnelseEdit'
import { Radio, RadioGroup } from 'baseui/radio'
import { Code } from '../../services/Codelist'
import { Error } from '../common/ModalSchema'

type EditEttlevProps = {
  etterlevelse: Etterlevelse
  krav: Krav
  close: (k?: Etterlevelse) => void
  formRef?: React.Ref<any>
  documentEdit?: boolean
}

const padding = '70px'

const etterlevelseSchema = () => {
  return yup.object({
    suksesskriterieBegrunnelser: yup.array().of(
      yup.object({
        oppfylt: yup.boolean(),
        begrunnelse: yup.string().test({
          name: 'begrunnelseText',
          message: 'Du må fylle ut dokumentasjonen',
          test: function (begrunnelse) {
            const { parent } = this
            return (parent.oppfylt && !!begrunnelse === true) || !parent.oppfylt
          },
        }),
        suksesskriterieId: yup.number().required('Begrunnelse må være knyttet til et suksesskriterie'),
      }),
    ),
    status: yup.string().test({
      name: 'etterlevelseStatus',
      message: 'Du må dokumentere på alle suksesskriterier før du er ferdig',
      test: function (status) {
        const { parent } = this
        if (status === EtterlevelseStatus.FERDIG || status === EtterlevelseStatus.FERDIG_DOKUMENTERT) {
          return parent.suksesskriterieBegrunnelser.every((skb: any) => skb.oppfylt && !!skb.begrunnelse)
        }
        return true
      },
    }),
  })
}

export const EditEtterlevelse = ({ krav, etterlevelse, close, formRef, documentEdit }: EditEttlevProps) => {
  const [etterlevelseStatus, setEtterlevelseStatus] = React.useState<string>(etterlevelse.status || EtterlevelseStatus.UNDER_REDIGERING)
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

  return (
    <Formik onSubmit={submit} initialValues={mapEtterlevelseToFormValue(etterlevelse)} validationSchema={etterlevelseSchema()} innerRef={formRef}>
      {({ values, isSubmitting, submitForm }: FormikProps<Etterlevelse>) => (
        <Form>
          <Card>
            <Block display="flex">
              <Block display="flex" marginRight={theme.sizing.scale800}>
                <img src={circlePencilIcon} alt="pencil-icon" />
              </Block>
              <Block>
                <Paragraph2 $style={{ marginTop: '0px', marginBottom: '0px' }}>{kravNumView(krav)}</Paragraph2>
                <H2 $style={{ marginTop: '0px', marginBottom: '0px', color: ettlevColors.navMorkGra }}>{krav.navn}</H2>
              </Block>
            </Block>
            <Block marginLeft={padding}>
              <Paragraph2>
                Gå til <ExternalLink href={'/krav/' + krav?.kravNummer + '/' + krav?.kravVersjon}>detaljert kravbeskrivelse (ny fane)</ExternalLink> for mer informasjon om kravet,
                eksempler på dokumentert etterlevelse og tilbakemeldinger til kraveier
              </Paragraph2>
            </Block>

            <Block>
              <Block paddingLeft={padding} paddingRight={padding} paddingTop={theme.sizing.scale1000} paddingBottom={theme.sizing.scale1600}>
                <Label3 $style={{ lineHeight: '32px' }}>Velg suksesskriterier for dokumentasjon</Label3>

                <SuksesskriterierBegrunnelseEdit suksesskriterie={krav.suksesskriterier} />

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
                          overrides={{
                            Root: {
                              style: {
                                alignItems: 'flex-start',
                              },
                            },
                            Label: {
                              style: {
                                fontSize: '18px',
                                fontWeight: 400,
                                lineHeight: '22px',
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
                                  {getEtterlevelseStatus(id)}

                                  {etterlevelseStatus === EtterlevelseStatus.OPPFYLLES_SENERE && <DateField label="Frist (valgfritt)" name="fristForFerdigstillelse" />}
                                </Radio>
                              )
                            }
                            if (id === EtterlevelseStatus.FERDIG_DOKUMENTERT) {
                              return null
                            }
                            return (
                              <Radio value={id} key={id}>
                                {getEtterlevelseStatus(id)}
                              </Radio>
                            )
                          })}
                        </RadioGroup>
                      </FormControl>
                    )}
                  </Field>
                </FieldWrapper>
                <Error fieldName={'status'} fullWidth={true} />
              </Block>
            </Block>
          </Card>

          {!documentEdit && (
            <Block display="flex" justifyContent="flex-end" marginTop={theme.sizing.scale850} marginBottom={theme.sizing.scale3200}>
              <Button type="button" kind="secondary" marginRight onClick={close}>
                Avbryt og forkast endringene
              </Button>
              <Button type="button" kind="secondary" marginRight disabled={isSubmitting} onClick={submitForm}>
                Lagre og fortsett senere
              </Button>
              <Button
                type="button"
                onClick={() => {
                  values.status = EtterlevelseStatus.FERDIG_DOKUMENTERT
                  submitForm()
                }}
              >
                Jeg har dokumentert ferdig
              </Button>
            </Block>
          )}
        </Form>
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
              options={results.map((k) => ({ id: k.id, label: kravName(k) }))}
              value={krav ? [{ id: krav.id, label: kravName(krav) }] : []}
              onChange={({ value }) => {
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
              options={results.map((k) => ({ id: k.id, label: behandlingName(k) }))}
              value={behandling ? [{ id: behandling.id, label: behandlingName(behandling) }] : []}
              onChange={({ value }) => {
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
