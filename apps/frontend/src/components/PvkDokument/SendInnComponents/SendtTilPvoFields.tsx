import { Alert, Button, Loader } from '@navikt/ds-react'
import { FormikErrors } from 'formik'
import { FunctionComponent } from 'react'
import { EPvkDokumentStatus, IPvkDokument } from '../../../constants'
import ExportPvkModal from '../../export/ExportPvkModal'
import CopyAndStatusView from './CopyAndStatusView'
import BeskjedTilPvoReadOnly from './readOnly/BeskjedTilPvoReadOnly'

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
          <Loader size='2xlarge' title='lagrer endringer' />
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
