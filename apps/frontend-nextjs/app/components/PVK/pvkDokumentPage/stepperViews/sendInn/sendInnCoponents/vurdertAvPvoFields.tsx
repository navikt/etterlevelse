'use client'

import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import {
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { ICode } from '@/constants/kodeverk/kodeverkConstants'
import { IVurdering } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import {
  Alert,
  Button,
  Heading,
  Loader,
  Modal,
  Radio,
  RadioGroup,
  ReadMore,
  Stack,
} from '@navikt/ds-react'
import { Field, FieldProps, FormikErrors } from 'formik'
import { FunctionComponent, ReactNode, useMemo, useState } from 'react'
import CopyAndExportButtons from './copyAndExportButtons'
import LagreOgFortsettSenereButton from './lagreOgFortsettSenereButton'
import { BeskjedFraPvoReadOnly } from './readOnly/beskjedFraPvoReadOnly'
import BeskjedTilPvoReadOnly from './readOnly/beskjedTilPvoReadOnly'

type TProps = {
  pvkDokument: IPvkDokument
  relevantVurdering: IVurdering
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<IPvkDokument>>
  submitForm: () => Promise<void>
  initialStatus: EPvkDokumentStatus
  isLoading: boolean
  errorSummaryComponent: ReactNode
  savedAlert: ReactNode
  pvoVurderingList: ICode[]
}

export const VurdertAvPvoFields: FunctionComponent<TProps> = ({
  pvkDokument,
  relevantVurdering,
  setFieldValue,
  submitForm,
  initialStatus,
  isLoading,
  errorSummaryComponent,
  savedAlert,
  pvoVurderingList,
}) => {
  const [isSendTilPvoForRevurderingModalOpen, setIsSendTilPvoForRevurderingModalOpen] =
    useState(false)

  const relevantMeldingTilPvo = pvkDokument.meldingerTilPvo.filter(
    (melding) => melding.innsendingId === pvkDokument.antallInnsendingTilPvo + 1
  )

  const relevantIndex = useMemo(() => {
    if (relevantMeldingTilPvo.length === 0) {
      return pvkDokument.meldingerTilPvo.length
    } else {
      return pvkDokument.meldingerTilPvo.findIndex(
        (melding) => melding.innsendingId === pvkDokument.antallInnsendingTilPvo + 1
      )
    }
  }, [])

  return (
    <Field>
      {(fieldProps: FieldProps) => (
        <div className='w-full'>
          <div className='w-full flex justify-center'>
            <div className='w-full max-w-[75ch]'>
              <BeskjedTilPvoReadOnly
                meldingTilPvo={
                  pvkDokument.meldingerTilPvo.filter(
                    (melding) => melding.innsendingId === pvkDokument.antallInnsendingTilPvo
                  )[0]
                }
              />
              <BeskjedFraPvoReadOnly
                relevantVurdering={relevantVurdering}
                pvoVurderingList={pvoVurderingList}
              />
              <div className='pt-9 mb-3'>
                <Heading size='medium' level='2' className='mb-5'>
                  Send oppdatert PVK
                </Heading>

                <RadioGroup
                  legend='Hvem skal dere sende PVK-en til?'
                  onChange={async (value: boolean) => {
                    await setFieldValue('berOmNyVurderingFraPvo', value)
                  }}
                >
                  <Stack
                    gap='space-0 space-24'
                    direction={{ xs: 'column', sm: 'row' }}
                    wrap={false}
                  >
                    <Radio value={false}>Risikoeier, til godkjenning</Radio>
                    <Radio value={true}>PVO, til ny vurdering</Radio>
                  </Stack>
                </RadioGroup>

                <ReadMore header='Når bør PVK sendes til PVO for ny vurdering?'>
                  PVO har ikke bedt om å få deres PVK i retur. Men dersom risikobildet er endret
                  siden dere sendte inn til PVO sist, burde dere sende til PVO for ny vurdering.
                </ReadMore>

                {fieldProps.form.values.berOmNyVurderingFraPvo === false && (
                  <div>
                    <Heading size='small' level='3' className='mb-5 mt-8'>
                      Send til risikoeier for godkjenning
                    </Heading>

                    <TextAreaField
                      height='150px'
                      noPlaceholder
                      label='Oppsummer for risikoeieren eventuelle endringer gjort som følge av PVOs tilbakemelding'
                      name='merknadTilRisikoeier'
                      markdown
                    />

                    <Alert variant='info' inline className='my-8'>
                      Når dere sender inn PVK, vil hele dokumentasjonen, inkludert
                      etterlevelsesdokumentasjon ved PVK-relaterte krav, låses og ikke kunne
                      redigeres. Dette innholdet forbli låst enn så lenge saken ligger hos
                      Personvernombudet.
                    </Alert>

                    <div className='mt-5 flex justify-end gap-2 items-center'>
                      <LagreOgFortsettSenereButton
                        setFieldValue={setFieldValue}
                        submitForm={submitForm}
                        initialStatus={initialStatus}
                        resetForm={() =>
                          fieldProps.form.resetForm({ values: fieldProps.form.values })
                        }
                      />

                      <Button
                        type='button'
                        onClick={async () => {
                          await setFieldValue('status', EPvkDokumentStatus.TRENGER_GODKJENNING)
                          await submitForm()
                        }}
                      >
                        Lagre og send til risikoeier
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {relevantMeldingTilPvo.length !== 0 &&
                !['', null].includes(relevantMeldingTilPvo[0].sendtTilPvoDato) && (
                  <Alert variant='info' className='my-5'>
                    Innsending til PVO trukket <br />
                    Etter at dere blir ferdig med endringer, må dere sende inn på nytt. PVK-en blir
                    deretter behandlet som en ny innsending
                  </Alert>
                )}

              {errorSummaryComponent}

              {isLoading && (
                <div className='flex justify-center items-center w-full'>
                  <Loader size='2xlarge' title='lagrer endringer' />
                </div>
              )}

              <div>{!fieldProps.form.dirty && savedAlert}</div>
            </div>
          </div>

          <CopyAndExportButtons etterlevelseDokumentasjonId={pvkDokument.etterlevelseDokumentId} />

          <Modal
            header={{ heading: 'Vil dere sende til Personvernombudet for revurdering?' }}
            open={isSendTilPvoForRevurderingModalOpen}
            onClose={() => setIsSendTilPvoForRevurderingModalOpen(false)}
          >
            <Modal.Body>
              <Alert variant='warning' inline className='mb-5'>
                PVO har ikke bedt om å få deres PVK i retur. Men dersom risikobildet er endret siden
                dere sendte inn til PVO sist, burde dere sende inn på nytt.
              </Alert>
              <div className='mt-8 mb-3'>
                <TextAreaField
                  height='150px'
                  noPlaceholder
                  label='Forklar hvorfor dere ønsker å sende inn til ny vurdering'
                  name={`meldingerTilPvo[${relevantIndex}].merknadTilPvo`}
                  markdown
                />

                {fieldProps.form.getFieldMeta(`meldingerTilPvo[${relevantIndex}].merknadTilPvo`)
                  .error && (
                  <Alert variant='error' inline className='mt-3'>
                    Forklar hvorfor dere ønsker å sende inn til ny vurdering må fylles ut.
                  </Alert>
                )}
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                type='button'
                variant='primary'
                onClick={async () => {
                  if (fieldProps.form.values.meldingerTilPvo[relevantIndex].merknadTilPvo === '') {
                    fieldProps.form.setFieldError(
                      `meldingerTilPvo[${relevantIndex}].merknadTilPvo`,
                      'Forklar hvorfor dere ønsker å sende inn til ny vurdering må fylles ut.'
                    )
                  } else {
                    await setFieldValue('status', EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING)
                    await setFieldValue(
                      'antallInnsendingTilPvo',
                      pvkDokument.antallInnsendingTilPvo + 1
                    )
                    setIsSendTilPvoForRevurderingModalOpen(false)
                    await submitForm()
                  }
                }}
              >
                Send til PVO for revurdering
              </Button>

              <Button
                type='button'
                variant='secondary'
                onClick={async () => {
                  await submitForm()
                  setIsSendTilPvoForRevurderingModalOpen(false)
                  fieldProps.form.resetForm({ values: fieldProps.form.values })
                }}
              >
                Lagre og fortsett senere
              </Button>

              <Button
                type='button'
                variant='tertiary'
                onClick={() => setIsSendTilPvoForRevurderingModalOpen(false)}
              >
                Avbryt
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </Field>
  )
}
export default VurdertAvPvoFields
