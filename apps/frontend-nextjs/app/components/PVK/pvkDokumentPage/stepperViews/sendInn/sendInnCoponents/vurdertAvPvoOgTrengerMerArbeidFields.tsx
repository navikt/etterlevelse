'use client'

import { mapMeldingTilPvoToFormValue } from '@/api/pvkDokument/pvkDokumentApi'
import CopyAndExportButtons from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/copyAndExportButtons'
import LagreOgFortsettSenereButton from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/lagreOgFortsettSenereButton'
import { BeskjedFraPvoReadOnly } from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/readOnly/beskjedFraPvoReadOnly'
import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import { TextAreaField } from '@/components/common/textAreaField/textAreaField'
import {
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { ICode } from '@/constants/kodeverk/kodeverkConstants'
import { IVurdering } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { pvkDokumentStatusToText } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { Alert, Button } from '@navikt/ds-react'
import { FormikErrors } from 'formik'
import { FunctionComponent, ReactNode, useMemo } from 'react'

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
  pvoVurderingList: ICode[]
}

export const VurdertAvPvoOgTrengerMerArbeidFields: FunctionComponent<TProps> = ({
  pvkDokument,
  relevantVurdering,
  setFieldValue,
  submitForm,
  initialStatus,
  isLoading,
  errorSummaryComponent,
  pvoVurderingList,
}) => {
  const relevantMeldingTilPvo = pvkDokument.meldingerTilPvo.filter(
    (melding) => melding.innsendingId === pvkDokument.antallInnsendingTilPvo + 1
  )

  const relevantIndex = useMemo(() => {
    if (relevantMeldingTilPvo.length === 0) {
      setFieldValue('meldingerTilPvo', [
        ...pvkDokument.meldingerTilPvo,
        mapMeldingTilPvoToFormValue({
          innsendingId: pvkDokument.antallInnsendingTilPvo + 1,
        }),
      ])
      return pvkDokument.meldingerTilPvo.length
    } else {
      return pvkDokument.meldingerTilPvo.findIndex(
        (melding) => melding.innsendingId === pvkDokument.antallInnsendingTilPvo + 1
      )
    }
  }, [])

  return (
    <div>
      <div className='flex justify-center w-full'>
        <div className='w-full max-w-[75ch]'>
          <BeskjedFraPvoReadOnly
            relevantVurdering={relevantVurdering}
            pvoVurderingList={pvoVurderingList}
          />

          <div className='mt-8 mb-3'>
            <TextAreaField
              height='150px'
              noPlaceholder
              label='Er det noe annet dere ønsker å formidle til Personvernombudet? (valgfritt)'
              name={`meldingerTilPvo[${relevantIndex}].merknadTilPvo`}
              markdown
            />
          </div>

          {errorSummaryComponent}

          {isLoading && (
            <div className='flex justify-center items-center w-full'>
              <CenteredLoader />
            </div>
          )}

          <div>
            <Alert variant='info' className='my-5 '>
              Status: {pvkDokumentStatusToText(pvkDokument.status)}
            </Alert>
          </div>
        </div>
      </div>

      <div className='mt-5 flex gap-2 items-center'>
        <LagreOgFortsettSenereButton
          setFieldValue={setFieldValue}
          submitForm={submitForm}
          initialStatus={initialStatus}
        />

        <Button
          type='button'
          variant='primary'
          onClick={async () => {
            await setFieldValue('status', EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING)
            await setFieldValue('antallInnsendingTilPvo', pvkDokument.antallInnsendingTilPvo + 1)
            await submitForm()
          }}
        >
          Lagre og send tilbake til PVO
        </Button>
      </div>

      <CopyAndExportButtons etterlevelseDokumentasjonId={pvkDokument.etterlevelseDokumentId} />
    </div>
  )
}

export default VurdertAvPvoOgTrengerMerArbeidFields
