'use client'

import { getPvkDokument } from '@/api/pvkDokument/pvkDokumentApi'
import {
  createPvoTilbakemelding,
  getPvoTilbakemeldingByPvkDokumentId,
  mapPvoTilbakemeldingToFormValue,
  updatePvoTilbakemelding,
} from '@/api/pvoTilbakemelding/pvoTilbakemeldingApi'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import { EPvkDokumentStatus } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import {
  EPvoTilbakemeldingStatus,
  IPvoTilbakemelding,
  ITilbakemeldingsinnhold,
  IVurdering,
} from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { UserContext } from '@/provider/user/userProvider'
import { createNewPvoVurderning } from '@/util/pvoTilbakemelding/pvoTilbakemeldingUtils'
import { Alert, BodyShort, Button, Heading, Radio, RadioGroup } from '@navikt/ds-react'
import { AxiosError } from 'axios'
import { Field, FieldProps, Form, Formik } from 'formik'
import moment from 'moment'
import { FunctionComponent, RefObject, useContext, useState } from 'react'
import AlertPvoModal from '../common/alertPvoModal'

export enum EBidragVerdier {
  TILSTREKKELIG = 'TILSTREKELIG',
  TILSTREKKELIG_FORBEHOLDT = 'TILSTREKKELIG_FORBEHOLDT',
  UTILSTREKKELIG = 'UTILSTREKELIG',
}

type TProps = {
  setPvoTilbakemelding: (state: IPvoTilbakemelding) => void
  pvkDokumentId: string
  innsendingId: number
  fieldName:
    | 'behandlingenslivslop'
    | 'behandlingensArtOgOmfang'
    | 'innvolveringAvEksterne'
    | 'risikoscenarioEtterTiltakk'
  initialValue: ITilbakemeldingsinnhold
  formRef: RefObject<any>
}

export const PvoTilbakemeldingForm: FunctionComponent<TProps> = ({
  setPvoTilbakemelding,
  fieldName,
  pvkDokumentId,
  innsendingId,
  initialValue,
  formRef,
}) => {
  const user = useContext(UserContext)
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false)
  const [saveSuccessful, setSaveSuccessful] = useState<boolean>(false)

  const resetFormWithNewInitalValue = (relevantVurdering: IVurdering) => {
    if (fieldName === 'behandlingenslivslop') {
      return relevantVurdering.behandlingenslivslop
    } else if (fieldName === 'behandlingensArtOgOmfang') {
      return relevantVurdering.behandlingensArtOgOmfang
    } else if (fieldName === 'innvolveringAvEksterne') {
      return relevantVurdering.innvolveringAvEksterne
    } else if (fieldName === 'risikoscenarioEtterTiltakk') {
      return relevantVurdering.risikoscenarioEtterTiltakk
    }
  }

  const submit = async (tilbakemeldingsInnhold: ITilbakemeldingsinnhold): Promise<void> => {
    const mutatedTilbakemeldingsInnhold: ITilbakemeldingsinnhold = {
      ...tilbakemeldingsInnhold,
      sistRedigertAv: user.getIdent() + ' - ' + user.getName(),
      sistRedigertDato: new Date().toISOString(),
    }

    let pvkStatus = ''

    await getPvkDokument(pvkDokumentId).then((response) => (pvkStatus = response.status))

    if (
      ![
        EPvkDokumentStatus.SENDT_TIL_PVO,
        EPvkDokumentStatus.PVO_UNDERARBEID,
        EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING,
      ].includes(pvkStatus as EPvkDokumentStatus)
    ) {
      setIsAlertModalOpen(true)
    } else {
      await getPvoTilbakemeldingByPvkDokumentId(pvkDokumentId)
        .then(async (response: IPvoTilbakemelding) => {
          if (response) {
            if (
              !response.vurderinger.find((vurdering) => vurdering.innsendingId === innsendingId)
            ) {
              response.vurderinger.push(createNewPvoVurderning(innsendingId))
            }

            const updatedValues: IPvoTilbakemelding = {
              ...response,
              vurderinger: response.vurderinger.map((vurdering) => {
                if (vurdering.innsendingId === innsendingId) {
                  return {
                    ...vurdering,
                    behandlingenslivslop:
                      fieldName === 'behandlingenslivslop'
                        ? mutatedTilbakemeldingsInnhold
                        : vurdering.behandlingenslivslop,
                    behandlingensArtOgOmfang:
                      fieldName === 'behandlingensArtOgOmfang'
                        ? mutatedTilbakemeldingsInnhold
                        : vurdering.behandlingensArtOgOmfang,
                    innvolveringAvEksterne:
                      fieldName === 'innvolveringAvEksterne'
                        ? mutatedTilbakemeldingsInnhold
                        : vurdering.innvolveringAvEksterne,
                    risikoscenarioEtterTiltakk:
                      fieldName === 'risikoscenarioEtterTiltakk'
                        ? mutatedTilbakemeldingsInnhold
                        : vurdering.risikoscenarioEtterTiltakk,
                  }
                } else {
                  return vurdering
                }
              }),

              status:
                response.status === EPvoTilbakemeldingStatus.IKKE_PABEGYNT ||
                response.status === EPvoTilbakemeldingStatus.TRENGER_REVURDERING
                  ? EPvoTilbakemeldingStatus.UNDERARBEID
                  : response.status,
            }

            if (response.status === EPvoTilbakemeldingStatus.FERDIG) {
              setIsAlertModalOpen(true)
            } else {
              await updatePvoTilbakemelding(updatedValues).then((response) => {
                setPvoTilbakemelding(response)
                const relevantVurdering = response.vurderinger.filter(
                  (vurdering) => vurdering.innsendingId === innsendingId
                )[0]
                const newInitailValues = resetFormWithNewInitalValue(relevantVurdering)

                formRef.current.resetForm({ values: newInitailValues })
                setSaveSuccessful(true)
              })
            }
          }
        })
        .catch(async (error: AxiosError) => {
          if (error.status === 404) {
            const newVurdering = createNewPvoVurderning(innsendingId)
            const createValue = mapPvoTilbakemeldingToFormValue({
              pvkDokumentId: pvkDokumentId,
              vurderinger: [
                {
                  ...newVurdering,
                  behandlingenslivslop:
                    fieldName === 'behandlingenslivslop'
                      ? mutatedTilbakemeldingsInnhold
                      : newVurdering.behandlingenslivslop,
                  behandlingensArtOgOmfang:
                    fieldName === 'behandlingensArtOgOmfang'
                      ? mutatedTilbakemeldingsInnhold
                      : newVurdering.behandlingensArtOgOmfang,
                  innvolveringAvEksterne:
                    fieldName === 'innvolveringAvEksterne'
                      ? mutatedTilbakemeldingsInnhold
                      : newVurdering.innvolveringAvEksterne,
                  risikoscenarioEtterTiltakk:
                    fieldName === 'risikoscenarioEtterTiltakk'
                      ? mutatedTilbakemeldingsInnhold
                      : newVurdering.risikoscenarioEtterTiltakk,
                },
              ],

              status: EPvoTilbakemeldingStatus.UNDERARBEID,
            })
            await createPvoTilbakemelding(createValue).then((response) => {
              setPvoTilbakemelding(response)
              const relevantVurdering = response.vurderinger.filter(
                (vurdering) => vurdering.innsendingId === innsendingId
              )[0]
              const newInitailValues = resetFormWithNewInitalValue(relevantVurdering)

              formRef.current.resetForm({ values: newInitailValues })
              setSaveSuccessful(true)
            })
          } else {
            console.debug(error)
          }
        })
    }
  }

  return (
    <div>
      <Formik
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={(values: ITilbakemeldingsinnhold) => {
          submit(values)
        }}
        initialValues={initialValue}
        innerRef={formRef}
      >
        {({ setFieldValue, submitForm }) => (
          <Form>
            <div className='z-10 flex flex-col w-full button_container sticky top-0 bg-[#e3eff7]'>
              <div className='mt-2 mb-5 flex flex-row gap-2'>
                <div>
                  <Button size='small' type='button' onClick={submitForm}>
                    Lagre
                  </Button>
                </div>
                <div>
                  <Button
                    size='small'
                    type='button'
                    variant='secondary'
                    onClick={() => {
                      window.location.reload()
                    }}
                  >
                    Forkast endringer
                  </Button>
                </div>
              </div>
              {saveSuccessful && (
                <div className='my-5'>
                  <Alert
                    size='small'
                    variant='success'
                    closeButton
                    onClose={() => setSaveSuccessful(false)}
                  >
                    Lagring vellykket
                  </Alert>
                </div>
              )}
            </div>

            <div>
              {initialValue.sistRedigertAv && initialValue.sistRedigertDato && (
                <BodyShort size='medium' className='pb-5'>
                  Sist endret: {moment(initialValue.sistRedigertDato).format('LL')} av{' '}
                  {initialValue.sistRedigertAv.split('-')[1]}
                </BodyShort>
              )}
            </div>

            <div className='my-5'>
              <TextAreaField
                noPlaceholder
                markdown
                height='15.625rem'
                name='internDiskusjon'
                label='Skriv eventuelt interne PVO-notater her'
                caption='Denne teksten er privat for PVO og skal ikke deles med etterleveren'
                withHighlight={true}
                withUnderline={true}
              />
            </div>

            <div className='h-0.5  w-full border-2 my-7' />

            <div>
              <Heading level='2' size='small' className='mb-5'>
                Gi tilbakemelding
              </Heading>

              <Field name='bidragsVurdering'>
                {(fieldProps: FieldProps) => (
                  <RadioGroup
                    legend='Vurder om etterleverens bidrag er tilstrekkelig'
                    value={fieldProps.field.value}
                    onChange={(value) => {
                      fieldProps.form.setFieldValue('bidragsVurdering', value)
                    }}
                    description='Denne vurderingen blir ikke tilgjengelig for etterleveren før dere har ferdigstilt selve vurderingen.'
                  >
                    <Radio value={EBidragVerdier.TILSTREKKELIG}>Ja, tilstrekkelig </Radio>
                    <Radio value={EBidragVerdier.TILSTREKKELIG_FORBEHOLDT}>
                      Tilstrekkelig, forbeholdt at etterleveren tar stilling til anbefalinger som
                      beskrives i fritekst under
                    </Radio>
                    <Radio value={EBidragVerdier.UTILSTREKKELIG}>
                      Utilstrekkelig, beskrives nærmere under
                    </Radio>
                  </RadioGroup>
                )}
              </Field>
            </div>

            <div className='my-2'>
              <Button
                size='small'
                type='button'
                variant='secondary'
                onClick={async () => {
                  await setFieldValue('bidragsVurdering', '')
                }}
              >
                Nullstill valg
              </Button>
            </div>

            <div className='my-5'>
              <TextAreaField
                noPlaceholder
                markdown
                height='15.625rem'
                name='tilbakemeldingTilEtterlevere'
                label='Skriv tilbakemelding til etterleveren'
                withUnderline={true}
              />
            </div>
          </Form>
        )}
      </Formik>

      {isAlertModalOpen && (
        <AlertPvoModal
          isOpen={isAlertModalOpen}
          onClose={() => setIsAlertModalOpen(false)}
          pvkDokumentId={pvkDokumentId}
        />
      )}
    </div>
  )
}

export default PvoTilbakemeldingForm
