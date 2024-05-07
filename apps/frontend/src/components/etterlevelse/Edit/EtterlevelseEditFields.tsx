import { Alert, BodyShort, Button, Checkbox, Label, Modal } from '@navikt/ds-react'
import { Form, Formik, FormikProps, validateYupSchema, yupToFormErrors } from 'formik'
import _ from 'lodash'
import moment from 'moment'
import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { mapEtterlevelseToFormValue } from '../../../api/EtterlevelseApi'
import {
  EEtterlevelseStatus,
  EKravFilterType,
  EKravStatus,
  IEtterlevelse,
  TKravQL,
} from '../../../constants'
import { ampli, userRoleEventProp } from '../../../services/Amplitude'
import { DateField } from '../../common/Inputs'
import { syncEtterlevelseKriterieBegrunnelseWithKrav } from '../../etterlevelseDokumentasjonTema/common/utils'
import EtterlevelseCard from '../EtterlevelseCard'
import { SuksesskriterierBegrunnelseEdit } from './SuksesskriterieBegrunnelseEdit'
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
}: TEditProps) => {
  const [etterlevelseStatus] = React.useState<string>(
    editedEtterlevelse
      ? editedEtterlevelse.status
      : etterlevelse.status || EEtterlevelseStatus.UNDER_REDIGERING
  )
  const [isOppfylesSenere, setOppfylesSenere] = React.useState<boolean>(
    etterlevelseStatus === EEtterlevelseStatus.OPPFYLLES_SENERE
  )
  const [isAvbrytModalOpen, setIsAvbryModalOpen] = React.useState<boolean>(false)
  const location = useLocation()

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
        validateOnBlur={false}
      >
        {({
          values,
          isSubmitting,
          submitForm,
          errors,
          setFieldError,
          dirty,
        }: FormikProps<IEtterlevelse>) => (
          <div className="flex flex-col">
            <Form>
              <div>
                {(etterlevelse.status === EEtterlevelseStatus.IKKE_RELEVANT ||
                  etterlevelse.status === EEtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT) && (
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
                />

                <div className="w-full my-6">
                  {Object.keys(errors).length > 0 && (
                    <Alert fullWidth variant="error">
                      Du må fylle ut alle obligatoriske felter
                    </Alert>
                  )}
                </div>
              </div>
            </Form>

            <div className="w-full border-t border-border-divider pt-5">
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
                    <div className="w-full">
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

              <div className="w-full justify-end">
                <div className="flex w-full pb-3 justify-end">
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
                    <div className="flex">
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
                        disabled={disableEdit || isOppfylesSenere}
                        type="button"
                        onClick={() => {
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
      </Formik>
    </div>
  )
}

export default EtterlevelseEditFields
