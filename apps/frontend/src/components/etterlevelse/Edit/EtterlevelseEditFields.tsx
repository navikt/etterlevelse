import { Etterlevelse, EtterlevelseStatus, KRAV_FILTER_TYPE, KravQL, KravStatus } from '../../../constants'
import { Form, Formik, FormikProps, validateYupSchema, yupToFormErrors } from 'formik'
import { mapEtterlevelseToFormValue } from '../../../api/EtterlevelseApi'
import React, { useEffect } from 'react'

import { SuksesskriterierBegrunnelseEdit } from './SuksesskriterieBegrunnelseEdit'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import EtterlevelseCard from '../EtterlevelseCard'
import { etterlevelseSchema } from './etterlevelseSchema'
import _ from 'lodash'

import { DateField } from '../../common/Inputs'
import { syncEtterlevelseKriterieBegrunnelseWithKrav } from '../../etterlevelseDokumentasjonTema/common/utils'
import { Alert, BodyShort, Button, Checkbox, Label } from '@navikt/ds-react'

type EditProps = {
  krav: KravQL
  etterlevelse: Etterlevelse
  submit: (etterlevelse: Etterlevelse) => Promise<void>
  formRef?: React.RefObject<any>
  varsleMelding?: string
  disableEdit: boolean
  close: (k?: Etterlevelse | undefined) => void
  navigatePath: string
  editedEtterlevelse?: Etterlevelse
  tidligereEtterlevelser?: Etterlevelse[]
  kravFilter: KRAV_FILTER_TYPE
}

export const EtterlevelseEditFields = ({
  krav,
  etterlevelse,
  submit,
  formRef,
  disableEdit,
  close,
  navigatePath,
  editedEtterlevelse,
  tidligereEtterlevelser,
  kravFilter,
}: EditProps) => {
  const [etterlevelseStatus] = React.useState<string>(editedEtterlevelse ? editedEtterlevelse.status : etterlevelse.status || EtterlevelseStatus.UNDER_REDIGERING)
  const [isOppfylesSenere, setOppfylesSenere] = React.useState<boolean>(etterlevelseStatus === EtterlevelseStatus.OPPFYLLES_SENERE)

  const navigate = useNavigate()

  useEffect(() => {
    if (navigatePath) {
      if (
        _.isEqualWith(mapEtterlevelseToFormValue(etterlevelse, krav), formRef?.current.values) ||
        kravFilter === KRAV_FILTER_TYPE.UTGAATE_KRAV ||
        kravFilter === KRAV_FILTER_TYPE.BORTFILTTERTE_KRAV
      ) {
        navigate(navigatePath)
      }
    }
  }, [navigatePath])

  return (
    <div className="w-full">
      <Formik
        onSubmit={submit}
        initialValues={editedEtterlevelse ? mapEtterlevelseToFormValue(editedEtterlevelse) : mapEtterlevelseToFormValue(etterlevelse)}
        validate={(value) => {
          const mutatedEtterlevelse = value
          value.suksesskriterieBegrunnelser = syncEtterlevelseKriterieBegrunnelseWithKrav(value, krav)

          try {
            validateYupSchema(mutatedEtterlevelse, etterlevelseSchema(), true, { status: value.status })
          } catch (err) {
            return yupToFormErrors(err)
          }
        }}
        innerRef={formRef}
        validateOnChange={false}
        validateOnBlur={false}
      >
        {({ values, isSubmitting, submitForm, errors, setFieldError }: FormikProps<Etterlevelse>) => (
          <div className="flex flex-col">
            <Form>
              <div>
                {(etterlevelse.status === EtterlevelseStatus.IKKE_RELEVANT || etterlevelse.status === EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT) && (
                  <div className={'mb-12'}>
                    <Alert className="mb-1" size="small" variant="info">
                      Dette kravet er dokumentert som ikke relevant 20.05.2022
                    </Alert>
                    <Label>Beskrivelse av hvorfor kraver er ikke relevant</Label>
                    <BodyShort>{etterlevelse.statusBegrunnelse}</BodyShort>
                  </div>
                )}
                <div className="flex w-full items-center mb-4">
                  <Label className="min-w-fit">Hvilke suksesskriterier er oppfylt?</Label>
                  {tidligereEtterlevelser && tidligereEtterlevelser.length > 0 && (
                    <div className="flex w-full justify-end">
                      <EtterlevelseCard etterlevelse={tidligereEtterlevelser[0]} />
                    </div>
                  )}
                </div>

                <SuksesskriterierBegrunnelseEdit disableEdit={disableEdit} suksesskriterie={krav.suksesskriterier} />

                <div className="w-full my-6">
                  {Object.keys(errors).length > 0 && (
                    <Alert fullWidth variant="error">
                      Du må fylle ut alle obligatoriske felter
                    </Alert>
                  )}
                </div>
              </div>
            </Form>

            <div className=" flex w-full border-t border-border-divider pt-5">
              {kravFilter === KRAV_FILTER_TYPE.RELEVANTE_KRAV && (
                <div className="w-full flex flex-col min-w-fit">
                  <Checkbox
                    checked={isOppfylesSenere}
                    onChange={() => {
                      setOppfylesSenere(!isOppfylesSenere)
                    }}
                    key={EtterlevelseStatus.OPPFYLLES_SENERE}
                  >
                    Kravet skal etterleves senere
                  </Checkbox>

                  {isOppfylesSenere && (
                    <div className="w-full">
                      <div className="w-full max-w-[170px]">
                        <DateField error={!!errors.fristForFerdigstillelse} label="Dato" name="fristForFerdigstillelse" />
                      </div>
                      {errors.fristForFerdigstillelse && (
                        <Alert variant="error" size="small">
                          {errors.fristForFerdigstillelse}
                        </Alert>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="w-full justify-end">
                <div className="flex w-full pb-3 justify-end">
                  {kravFilter === KRAV_FILTER_TYPE.UTGAATE_KRAV && (
                    <Button
                      type="button"
                      disabled={isSubmitting || disableEdit}
                      onClick={() => {
                        submitForm()
                      }}
                    >
                      Lagre endringer
                    </Button>
                  )}
                  {kravFilter === KRAV_FILTER_TYPE.RELEVANTE_KRAV && (
                    <div className="flex">
                      <Button
                        className="mr-6"
                        type="button"
                        variant="secondary"
                        disabled={isSubmitting || disableEdit}
                        onClick={() => {
                          if (values.status === EtterlevelseStatus.FERDIG_DOKUMENTERT || !isOppfylesSenere) {
                            values.status = EtterlevelseStatus.UNDER_REDIGERING
                          } else if (isOppfylesSenere) {
                            values.status = EtterlevelseStatus.OPPFYLLES_SENERE
                          }
                          submitForm()
                        }}
                      >
                        Lagre og fortsett senere
                      </Button>
                      <Button
                        disabled={disableEdit || isOppfylesSenere}
                        type="button"
                        onClick={() => {
                          values.status = EtterlevelseStatus.FERDIG_DOKUMENTERT
                          values.suksesskriterieBegrunnelser.forEach((skb, index) => {
                            if (skb.begrunnelse === '' || skb.begrunnelse === undefined) {
                              setFieldError(`suksesskriterieBegrunnelser[${index}]`, 'Du må fylle ut dokumentasjonen')
                            }
                          })
                          submitForm()
                        }}
                      >
                        Ferdig utfylt
                      </Button>
                    </div>
                  )}
                </div>

                <div className="pb-6 flex justify-end w-full">
                  <Button disabled={krav.status === KravStatus.UTGAATT ? false : disableEdit} type="button" variant="tertiary" onClick={() => close()}>
                    {krav.status === KravStatus.UTGAATT ? 'Lukk' : 'Avbryt'}
                  </Button>
                </div>

                {etterlevelse.changeStamp.lastModifiedDate && etterlevelse.changeStamp.lastModifiedBy && (
                  <div className="pb-6 flex justify-end w-full">
                    <BodyShort>
                      Sist utfylt: {moment(etterlevelse.changeStamp.lastModifiedDate).format('ll')} av {etterlevelse.changeStamp.lastModifiedBy.split('-')[1]}
                    </BodyShort>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Formik>
    </div>
  )
}

export default EtterlevelseEditFields
