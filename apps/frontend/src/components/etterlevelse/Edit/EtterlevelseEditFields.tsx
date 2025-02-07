import { Alert, BodyShort, Button, Checkbox, ErrorSummary, Label, Modal } from '@navikt/ds-react'
import { Form, Formik, FormikErrors, FormikProps, validateYupSchema, yupToFormErrors } from 'formik'
import _ from 'lodash'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getDocumentRelationByToIdAndRelationType } from '../../../api/DocumentRelationApi'
import {
  getEtterlevelserByEtterlevelseDokumentasjonIdKravNumber,
  mapEtterlevelseToFormValue,
} from '../../../api/EtterlevelseApi'
import {
  EEtterlevelseStatus,
  EKravFilterType,
  EKravStatus,
  ERelationType,
  IDocumentRelation,
  IEtterlevelse,
  ISuksesskriterieBegrunnelse,
  TEtterlevelseDokumentasjonQL,
  TKravQL,
} from '../../../constants'
import { ampli, userRoleEventProp } from '../../../services/Amplitude'
import { DateField } from '../../common/Inputs'
import { syncEtterlevelseKriterieBegrunnelseWithKrav } from '../../etterlevelseDokumentasjonTema/common/utils'
import EtterlevelseCard from '../EtterlevelseCard'
import EtterlevelseViewFields from '../EtterlevelseViewFields'
import { SuksesskriterierBegrunnelseEdit } from './SuksesskriterieBegrunnelseEdit'
import SuksesskriterieErrorFields from './SuksesskriterieErrorFields'
import { etterlevelseSchema } from './etterlevelseSchema'

type TEditProps = {
  krav: TKravQL
  etterlevelse: IEtterlevelse
  submit: (etterlevelse: IEtterlevelse) => Promise<void>
  formRef?: React.RefObject<any>
  varsleMelding?: string
  disableEdit: boolean
  close: (k?: IEtterlevelse | undefined) => void
  navigatePath: string
  editedEtterlevelse?: IEtterlevelse
  tidligereEtterlevelser?: IEtterlevelse[]
  kravFilter: EKravFilterType
  etterlevelseDokumentasjon?: TEtterlevelseDokumentasjonQL
  isPreview: boolean
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
  etterlevelseDokumentasjon,
  isPreview,
}: TEditProps) => {
  const [etterlevelseStatus] = useState<string>(
    editedEtterlevelse
      ? editedEtterlevelse.status
      : etterlevelse.status || EEtterlevelseStatus.UNDER_REDIGERING
  )
  const [isOppfylesSenere, setOppfylesSenere] = useState<boolean>(
    etterlevelseStatus === EEtterlevelseStatus.OPPFYLLES_SENERE
  )
  const [isAvbrytModalOpen, setIsAvbryModalOpen] = useState<boolean>(false)
  const location = useLocation()

  const [morDokumentRelasjon, setMorDokumentRelasjon] = useState<IDocumentRelation>()
  const [morEtterlevelse, setMorEtterlevelse] = useState<IEtterlevelse>()

  const errorSummaryRef = React.useRef<HTMLDivElement>(null)
  const [validateOnBlur, setValidateOnBlur] = useState(false)

  const navigate = useNavigate()
  useEffect(() => {
    if (navigatePath) {
      if (
        _.isEqualWith(mapEtterlevelseToFormValue(etterlevelse, krav), formRef?.current.values) ||
        kravFilter === EKravFilterType.UTGAATE_KRAV ||
        kravFilter === EKravFilterType.BORTFILTTERTE_KRAV
      ) {
        navigate(navigatePath)
      }
    }
  }, [navigatePath])

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

  return (
    <div className="w-full">
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
          <div className="w-full">
            {!isPreview && (
              <div className="flex flex-col">
                <Form>
                  <div>
                    {(etterlevelse.status === EEtterlevelseStatus.IKKE_RELEVANT ||
                      etterlevelse.status ===
                        EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT) && (
                      <div className={'mb-12'}>
                        <Alert className="mb-1" size="small" variant="info">
                          Dette kravet er dokumentert som ikke relevant 20.05.2022
                        </Alert>
                        <Label>Beskrivelse av hvorfor kraver er ikke relevant</Label>
                        <BodyShort>{etterlevelse.statusBegrunnelse}</BodyShort>
                      </div>
                    )}
                    <div className="flex w-full items-center mb-4">
                      {tidligereEtterlevelser && tidligereEtterlevelser.length > 0 && (
                        <div className="flex w-full justify-end">
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
                </Form>

                <div className="w-full border-t border-[#071a3636] pt-5">
                  {kravFilter === EKravFilterType.RELEVANTE_KRAV && (
                    <div className="w-full flex flex-col min-w-fit mb-4">
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
                        <div className="w-full" id="fristForFerdigstillelse">
                          <div className="w-full max-w-[10.625rem]">
                            <DateField name="fristForFerdigstillelse" />
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

                  {!_.isEmpty(errors) && (
                    <ErrorSummary
                      ref={errorSummaryRef}
                      heading="Du må rette disse feilene før du kan fortsette"
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

                  <div className="w-full justify-end mt-5">
                    <div className="flex w-full pb-3 flex-row-reverse">
                      <Button
                        disabled={disableEdit || isOppfylesSenere}
                        type="button"
                        onClick={() => {
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
                          ampli.logEvent('knapp klikket', {
                            tekst: 'Sett krav til ferdig utfylt',
                            pagePath: location.pathname,
                            ...userRoleEventProp,
                          })
                          submitForm()
                        }}
                      >
                        {/* Sett krav til ferdig utfylt og fortsett til neste krav */}
                        Ferdig utfylt
                      </Button>

                      {kravFilter === EKravFilterType.UTGAATE_KRAV && (
                        <Button
                          className="mr-6"
                          type="button"
                          disabled={isSubmitting || disableEdit}
                          onClick={() => {
                            submitForm()
                          }}
                        >
                          Lagre endringer
                        </Button>
                      )}

                      {kravFilter === EKravFilterType.RELEVANTE_KRAV && (
                        <div className="flex flex-row-reverse">
                          <Button
                            className="mr-6"
                            type="button"
                            variant="secondary"
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
                              ampli.logEvent('knapp klikket', {
                                tekst: 'Lagre og fortsett',
                                pagePath: location.pathname,
                                ...userRoleEventProp,
                              })
                              submitForm()
                            }}
                          >
                            {/* Lagre og fortsett til neste krav */}
                            Lagre og fortsett senere
                          </Button>

                          <Button
                            className="mr-6"
                            disabled={krav.status === EKravStatus.UTGAATT ? false : disableEdit}
                            type="button"
                            variant="secondary"
                            onClick={() => {
                              if (!dirty) {
                                ampli.logEvent('knapp klikket', {
                                  tekst: 'Avbryt uten endring i etterlevelse',
                                  pagePath: location.pathname,
                                  ...userRoleEventProp,
                                })
                                close()
                              } else {
                                setIsAvbryModalOpen(true)
                              }

                              // original logic for buttons, uncommet and use code above to test new logic.
                              // close()
                            }}
                          >
                            {krav.status === EKravStatus.UTGAATT ? 'Lukk' : 'Avbryt'}
                          </Button>
                        </div>
                      )}
                    </div>

                    {etterlevelse.changeStamp.lastModifiedDate &&
                      etterlevelse.changeStamp.lastModifiedBy && (
                        <div className="pb-6 flex justify-end w-full">
                          <BodyShort>
                            Sist utfylt:{' '}
                            {moment(etterlevelse.changeStamp.lastModifiedDate).format('ll')} av{' '}
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
                        Er du sikker på at du vil avbryte dokumentering? Endringer du har gjort blir
                        ikke lagret og du blir sendt til teamoversikten.
                      </Modal.Body>
                      <Modal.Footer>
                        <Button
                          onClick={() => {
                            ampli.logEvent('knapp klikket', {
                              context: 'Avbryt med endring i etterlevelse',
                              tekst: 'Avbryt med endring i etterlevelse',
                              pagePath: location.pathname,
                              ...userRoleEventProp,
                            })
                            close()
                          }}
                          type="button"
                        >
                          Ja, jeg vil avbryte
                        </Button>
                        <Button
                          onClick={() => {
                            ampli.logEvent('knapp klikket', {
                              tekst: 'Nei, jeg vil fortsette',
                              pagePath: location.pathname,
                            })
                            setIsAvbryModalOpen(false)
                          }}
                          type="button"
                          variant="secondary"
                        >
                          Nei, jeg vil fortsette
                        </Button>
                      </Modal.Footer>
                    </Modal>
                  </div>
                </div>
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
