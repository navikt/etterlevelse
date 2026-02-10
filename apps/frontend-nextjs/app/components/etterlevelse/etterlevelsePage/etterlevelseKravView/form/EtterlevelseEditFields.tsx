'use client'

import { getDocumentRelationByToIdAndRelationType } from '@/api/dokumentRelasjon/dokumentRelasjonApi'
import {
  getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber,
  mapEtterlevelseToFormValue,
} from '@/api/etterlevelse/etterlevelseApi'
import { DateField } from '@/components/common/inputs'
import { EtterlevelseCard } from '@/components/etterlevelse/etterlevelseModal/etterlevelseCard'
import {
  ERelationType,
  IDocumentRelation,
} from '@/constants/etterlevelseDokumentasjon/dokumentRelasjon/dokumentRelasjonConstants'
import {
  EEtterlevelseStatus,
  IEtterlevelse,
  ISuksesskriterieBegrunnelse,
} from '@/constants/etterlevelseDokumentasjon/etterlevelse/etterlevelseConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { EKravStatus, TKravQL } from '@/constants/krav/kravConstants'
import { etterlevelseDokumentasjonIdUrl } from '@/routes/etterlevelseDokumentasjon/etterlevelseDokumentasjonRoutes'
import { syncEtterlevelseKriterieBegrunnelseWithKrav } from '@/util/etterlevelseUtil/etterlevelseUtil'
import { Alert, BodyShort, Button, Checkbox, ErrorSummary, Label, Modal } from '@navikt/ds-react'
import { Form, Formik, FormikErrors, FormikProps, validateYupSchema, yupToFormErrors } from 'formik'
import _ from 'lodash'
import moment from 'moment'
import { useRouter } from 'next/navigation'
import { FunctionComponent, RefObject, useEffect, useRef, useState } from 'react'
import { EtterlevelseViewFields } from '../../readOnly/etterlevelseViewFields'
import { etterlevelseSchema } from './etterlevelseSchema'
import SuksesskriterieErrorFields from './suksesskriterieErrorFields'
import { SuksesskriterierBegrunnelseEdit } from './suksesskriterierBegrunnelseEdit'

type TEditProps = {
  krav: TKravQL
  etterlevelse: IEtterlevelse
  submit: (etterlevelse: IEtterlevelse) => Promise<void>
  formRef?: RefObject<any>
  varsleMelding?: string
  disableEdit: boolean
  editedEtterlevelse?: IEtterlevelse
  tidligereEtterlevelser?: IEtterlevelse[]
  etterlevelseDokumentasjon?: TEtterlevelseDokumentasjonQL
  isPreview: boolean
  etterlevelseDokStatusAlert: boolean
  setEtterlevelseDokStatusAlert: (state: boolean) => void
}

export const EtterlevelseEditFields: FunctionComponent<TEditProps> = ({
  krav,
  etterlevelse,
  submit,
  formRef,
  disableEdit,
  editedEtterlevelse,
  tidligereEtterlevelser,
  etterlevelseDokumentasjon,
  isPreview,
  etterlevelseDokStatusAlert,
  setEtterlevelseDokStatusAlert,
}) => {
  const [etterlevelseStatus] = useState<string>(
    editedEtterlevelse
      ? editedEtterlevelse.status
      : etterlevelse.status || EEtterlevelseStatus.UNDER_REDIGERING
  )
  const [isOppfylesSenere, setOppfylesSenere] = useState<boolean>(
    etterlevelseStatus === EEtterlevelseStatus.OPPFYLLES_SENERE
  )
  const [isAvbrytModalOpen, setIsAvbryModalOpen] = useState<boolean>(false)

  const [morDokumentRelasjon, setMorDokumentRelasjon] = useState<IDocumentRelation>()
  const [morEtterlevelse, setMorEtterlevelse] = useState<IEtterlevelse>()

  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const [validateOnBlur, setValidateOnBlur] = useState(false)
  const [submitClick, setSubmitClick] = useState<boolean>(false)

  const router = useRouter()

  useEffect(() => {
    ;(async () => {
      if (etterlevelseDokumentasjon)
        await getDocumentRelationByToIdAndRelationType(
          etterlevelseDokumentasjon.id,
          ERelationType.ARVER
        ).then((resp) => {
          if (resp.length !== 0) {
            setMorDokumentRelasjon(resp[0])
          }
        })
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      if (morDokumentRelasjon) {
        await getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber(
          morDokumentRelasjon.fromDocument,
          krav.kravNummer
        ).then((resp) => {
          const morEtterlevelse = resp.content.filter(
            (morEtterlevelse) => morEtterlevelse.kravVersjon === krav.kravVersjon
          )[0]
          setMorEtterlevelse(morEtterlevelse)
        })
      }
    })()
  }, [morDokumentRelasjon])

  useEffect(() => {
    if (!_.isEmpty(formRef?.current.errors) && errorSummaryRef.current) {
      errorSummaryRef.current.focus()
    }
  }, [submitClick])

  return (
    <div className='w-full'>
      <Formik
        onSubmit={submit}
        initialValues={
          editedEtterlevelse
            ? mapEtterlevelseToFormValue(editedEtterlevelse, krav)
            : mapEtterlevelseToFormValue(etterlevelse, krav)
        }
        validate={(value) => {
          const mutatedEtterlevelse = value
          value.suksesskriterieBegrunnelser = syncEtterlevelseKriterieBegrunnelseWithKrav(
            value,
            krav
          )

          try {
            validateYupSchema(mutatedEtterlevelse, etterlevelseSchema(), true, {
              status: value.status,
            })
          } catch (err) {
            return yupToFormErrors(err)
          }
        }}
        innerRef={formRef}
        validateOnChange={false}
        validateOnBlur={validateOnBlur}
      >
        {({
          values,
          isSubmitting,
          submitForm,
          errors,
          setFieldError,
          dirty,
        }: FormikProps<IEtterlevelse>) => (
          <div className='w-full'>
            {!isPreview && (
              <div className='flex flex-col'>
                <Form>
                  <div>
                    {(etterlevelse.status === EEtterlevelseStatus.IKKE_RELEVANT ||
                      etterlevelse.status ===
                        EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT) && (
                      <div className={'mb-12'}>
                        <Alert className='mb-1' size='small' variant='info'>
                          Dette kravet er dokumentert som ikke relevant 20.05.2022
                        </Alert>
                        <Label>Beskrivelse av hvorfor kraver er ikke relevant</Label>
                        <BodyShort>{etterlevelse.statusBegrunnelse}</BodyShort>
                      </div>
                    )}
                    <div className='flex w-full items-center mb-4'>
                      {tidligereEtterlevelser && tidligereEtterlevelser.length > 0 && (
                        <div className='flex w-full justify-end'>
                          <EtterlevelseCard etterlevelse={tidligereEtterlevelser[0]} />
                        </div>
                      )}
                    </div>

                    <SuksesskriterierBegrunnelseEdit
                      disableEdit={disableEdit}
                      suksesskriterie={krav.suksesskriterier}
                      forGjenbruk={etterlevelseDokumentasjon?.forGjenbruk}
                      morEtterlevelse={morEtterlevelse}
                    />
                  </div>

                  <div className='w-full border-t border-[#071a3636] pt-5'>
                    <div className='w-full flex flex-col min-w-fit mb-4'>
                      <Checkbox
                        checked={isOppfylesSenere}
                        onChange={() => {
                          setOppfylesSenere(!isOppfylesSenere)
                        }}
                        key={EEtterlevelseStatus.OPPFYLLES_SENERE}
                      >
                        Kravet skal etterleves senere
                      </Checkbox>

                      {isOppfylesSenere && (
                        <div className='w-full' id='fristForFerdigstillelse'>
                          <div className='w-full max-w-[10.625rem]'>
                            <DateField name='fristForFerdigstillelse' />
                          </div>
                          {errors.fristForFerdigstillelse && (
                            <Alert variant='error' size='small'>
                              {errors.fristForFerdigstillelse}
                            </Alert>
                          )}
                        </div>
                      )}
                    </div>

                    {!_.isEmpty(errors) && (
                      <ErrorSummary
                        ref={errorSummaryRef}
                        heading='Du må rette disse feilene før du kan fortsette'
                        onClick={() => console.debug(errors)}
                      >
                        {errors.suksesskriterieBegrunnelser && (
                          <SuksesskriterieErrorFields
                            errors={
                              errors.suksesskriterieBegrunnelser as FormikErrors<ISuksesskriterieBegrunnelse>[]
                            }
                          />
                        )}

                        {errors.fristForFerdigstillelse && (
                          <ErrorSummary.Item href={'#fristForFerdigstillelse'}>
                            {errors.fristForFerdigstillelse}
                          </ErrorSummary.Item>
                        )}
                      </ErrorSummary>
                    )}

                    {etterlevelseDokStatusAlert && (
                      <Alert
                        variant='error'
                        closeButton
                        onClose={() => setEtterlevelseDokStatusAlert(false)}
                      >
                        Fordi dette etterlevelsesdokumentet ligger til godkjenning hos risikoeier,
                        vil det ikke være mulig å redigere kravdokumentasjon fram til at dokumentet
                        er godkjent.
                      </Alert>
                    )}

                    <div className='w-full justify-end mt-5'>
                      <div className='flex w-full pb-3 flex-row-reverse'>
                        <Button
                          disabled={disableEdit || isOppfylesSenere}
                          type='button'
                          onClick={async () => {
                            setValidateOnBlur(true)
                            values.status = EEtterlevelseStatus.FERDIG_DOKUMENTERT
                            values.suksesskriterieBegrunnelser.forEach((skb, index) => {
                              if (skb.begrunnelse === '' || skb.begrunnelse === undefined) {
                                setFieldError(
                                  `suksesskriterieBegrunnelser[${index}]`,
                                  'Du må fylle ut dokumentasjonen'
                                )
                              }
                            })
                            await submitForm()
                            setSubmitClick(!submitClick)
                          }}
                        >
                          {/* Sett krav til ferdig utfylt og fortsett til neste krav */}
                          Ferdig utfylt
                        </Button>

                        {krav.status === EKravStatus.UTGAATT && (
                          <Button
                            className='mr-6'
                            type='button'
                            disabled={isSubmitting || disableEdit}
                            onClick={() => {
                              submitForm()
                            }}
                          >
                            Lagre endringer
                          </Button>
                        )}

                        {krav.status === EKravStatus.AKTIV && (
                          <div className='flex flex-row-reverse'>
                            <Button
                              className='mr-6'
                              type='button'
                              variant='secondary'
                              disabled={isSubmitting || disableEdit}
                              onClick={() => {
                                if (
                                  values.status === EEtterlevelseStatus.FERDIG_DOKUMENTERT ||
                                  !isOppfylesSenere
                                ) {
                                  values.status = EEtterlevelseStatus.UNDER_REDIGERING
                                } else if (isOppfylesSenere) {
                                  values.status = EEtterlevelseStatus.OPPFYLLES_SENERE
                                }
                                submitForm()
                              }}
                            >
                              {/* Lagre og fortsett til neste krav */}
                              Lagre og fortsett senere
                            </Button>

                            <Button
                              className='mr-6'
                              disabled={disableEdit}
                              type='button'
                              variant='secondary'
                              onClick={() => {
                                if (!dirty) {
                                  setTimeout(
                                    () =>
                                      router.push(
                                        etterlevelseDokumentasjonIdUrl(
                                          etterlevelseDokumentasjon?.id
                                        )
                                      ),
                                    1
                                  )
                                } else {
                                  setIsAvbryModalOpen(true)
                                }

                                // original logic for buttons, uncommet and use code above to test new logic.
                                // close()
                              }}
                            >
                              Avbryt
                            </Button>
                          </div>
                        )}
                      </div>

                      {etterlevelse.changeStamp.lastModifiedDate &&
                        etterlevelse.changeStamp.lastModifiedBy && (
                          <div className='pb-6 flex justify-end w-full'>
                            <BodyShort>
                              Sist utfylt:{' '}
                              {moment(etterlevelse.changeStamp.lastModifiedDate).format('LL')} av{' '}
                              {etterlevelse.changeStamp.lastModifiedBy.split('-')[1]}
                            </BodyShort>
                          </div>
                        )}

                      <Modal
                        onClose={() => setIsAvbryModalOpen(false)}
                        header={{ heading: 'Avbryt dokumentering' }}
                        open={isAvbrytModalOpen}
                      >
                        <Modal.Body>
                          Er du sikker på at du vil avbryte dokumentering? Endringer du har gjort
                          blir ikke lagret og du blir sendt til teamoversikten.
                        </Modal.Body>
                        <Modal.Footer>
                          <Button
                            onClick={() => {
                              close()
                            }}
                            type='button'
                          >
                            Ja, jeg vil avbryte
                          </Button>
                          <Button
                            onClick={() => {
                              setIsAvbryModalOpen(false)
                            }}
                            type='button'
                            variant='secondary'
                          >
                            Nei, jeg vil fortsette
                          </Button>
                        </Modal.Footer>
                      </Modal>
                    </div>
                  </div>
                </Form>
              </div>
            )}
            {isPreview && (
              <EtterlevelseViewFields
                etterlevelse={values}
                suksesskriterier={krav.suksesskriterier}
                tidligereEtterlevelser={tidligereEtterlevelser}
              />
            )}
          </div>
        )}
      </Formik>
    </div>
  )
}

export default EtterlevelseEditFields
