import ExportPvkModal from '@/components/PVK/export/exportPvkModal'
import CopyAndStatusView from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/copyAndStatusView'
import BeskjedTilPvoReadOnly from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/readOnly/beskjedTilPvoReadOnly'
import { CenteredLoader } from '@/components/common/centeredLoader/centeredLoader'
import {
  EPvkDokumentStatus,
  IPvkDokument,
} from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
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
    <div>
      <BeskjedTilPvoReadOnly pvkDokument={pvkDokument} />

      <CopyAndStatusView pvkDokumentStatus={pvkDokument.status} />

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

      <div className='ml-13 mt-5 flex gap-2 items-center'>
        <Button
          type='button'
          variant='secondary'
          onClick={async () => {
            if (pvkDokument.status === EPvkDokumentStatus.SENDT_TIL_PVO_FOR_REVURDERING) {
              await setFieldValue('status', EPvkDokumentStatus.VURDERT_AV_PVO_TRENGER_MER_ARBEID)
            } else {
              await setFieldValue('status', EPvkDokumentStatus.UNDERARBEID)
            }
            await submitForm()
          }}
        >
          Trekk innsending
        </Button>
      </div>
      <div className='w-full flex justify-end items-center'>
        <ExportPvkModal etterlevelseDokumentasjonId={pvkDokument.etterlevelseDokumentId} />
      </div>
    </div>
  )
}
export default SendtTilPvoFields
