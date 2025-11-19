import CopyAndExportButtons from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/copyAndExportButtons'
import BeskjedTilPvoReadOnly from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/readOnly/beskjedTilPvoReadOnly'
import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import {
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { pvkDokumentStatusToText } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { Alert, Button } from '@navikt/ds-react'
import { FormikErrors } from 'formik'
import { FunctionComponent } from 'react'

type TProps = {
  pvkDokument: IPvkDokument
  isLoading: boolean
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<IPvkDokument>>
  submitForm: () => Promise<void>
}
export const SendtTilPvoFields: FunctionComponent<TProps> = ({
  pvkDokument,
  isLoading,
  setFieldValue,
  submitForm,
}) => {
  return (
    <div className='w-full max-w-[75ch]'>
      <BeskjedTilPvoReadOnly
        meldingTilPvo={
          pvkDokument.meldingerTilPvo.filter(
            (melding) => melding.innsendingId === pvkDokument.antallInnsendingTilPvo
          )[0]
        }
      />

      <Alert variant='info' className='ml-4 my-5' inline>
        Hvis dere har oppdaget betydelige feil eller mangel etter innsending, er det mulig å trekke
        PVO-en deres tilbake. Dette vil kun være mulig enn så lenge PVO ikke har påbegynt
        vurderingen sin. Obs: ved å trekke tilbake PVK, vil dere miste nåværende plass i
        behandlingskøen.
      </Alert>

      {isLoading && (
        <div className='flex justify-center items-center w-full '>
          <CenteredLoader />
        </div>
      )}

      <div>
        <Alert variant='info' className='my-5'>
          Status: {pvkDokumentStatusToText(pvkDokument.status)}
        </Alert>
      </div>

      <div className='mt-5 flex gap-2 items-center'>
        <Button
          type='button'
          variant='secondary'
          onClick={async () => {
            if (pvkDokument.status === EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING) {
              await setFieldValue('status', EPvkDokumentStatus.VURDERT_AV_PVO_TRENGER_MER_ARBEID)
              await setFieldValue('antallInnsendingTilPvo', pvkDokument.antallInnsendingTilPvo - 1)
            } else {
              await setFieldValue('status', EPvkDokumentStatus.UNDERARBEID)
              await setFieldValue('antallInnsendingTilPvo', pvkDokument.antallInnsendingTilPvo - 1)
            }
            await submitForm()
          }}
        >
          Trekk innsending
        </Button>
      </div>

      <CopyAndExportButtons etterlevelseDokumentasjonId={pvkDokument.etterlevelseDokumentId} />
    </div>
  )
}
export default SendtTilPvoFields
