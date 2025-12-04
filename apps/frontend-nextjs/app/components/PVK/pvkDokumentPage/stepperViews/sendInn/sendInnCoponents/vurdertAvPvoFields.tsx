'use client'

import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { ICode } from '@/constants/kodeverk/kodeverkConstants'
import { IVurdering } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { Alert, Heading, Loader, Radio, RadioGroup, ReadMore, Stack } from '@navikt/ds-react'
import { Field, FieldProps, FormikErrors } from 'formik'
import { FunctionComponent, ReactNode, useMemo } from 'react'
import CopyAndExportButtons from './copyAndExportButtons'
import { BeskjedFraPvoReadOnly } from './readOnly/beskjedFraPvoReadOnly'
import BeskjedTilPvoReadOnly from './readOnly/beskjedTilPvoReadOnly'
import SendTilPvo from './vurdertAvPvoComponents.tsx/SendTilPvo'
import SendTilRisikoeier from './vurdertAvPvoComponents.tsx/SendTilRisikoeier'

type TProps = {
  pvkDokument: IPvkDokument
  relevantVurdering: IVurdering
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<IPvkDokument>>
  isLoading: boolean
  errorSummaryComponent: ReactNode
  savedAlert: ReactNode
  pvoVurderingList: ICode[]
}

export const VurdertAvPvoFields: FunctionComponent<TProps> = ({
  pvkDokument,
  relevantVurdering,
  setFieldValue,
  isLoading,
  errorSummaryComponent,
  savedAlert,
  pvoVurderingList,
}) => {
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
                  value={fieldProps.form.values.berOmNyVurderingFraPvo}
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
                  <SendTilRisikoeier fieldProps={fieldProps} />
                )}
                {fieldProps.form.values.berOmNyVurderingFraPvo === true && (
                  <SendTilPvo
                    relevantIndex={relevantIndex}
                    pvkDokument={pvkDokument}
                    fieldProps={fieldProps}
                  />
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
        </div>
      )}
    </Field>
  )
}
export default VurdertAvPvoFields
