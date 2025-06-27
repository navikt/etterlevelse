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

      <Alert variant='info' className='my-5'>
        Ved å trekke innsending til personvernombudet vil PVK dokumentet miste plassen i sakskøen
      </Alert>

      {isLoading && (
        <div className='flex justify-center items-center w-full'>
          <Loader size='2xlarge' title='lagrer endringer' />
        </div>
      )}

      <div className='mt-5 flex gap-2 items-center'>
        <Button
          type='button'
          onClick={async () => {
            await setFieldValue('status', EPvkDokumentStatus.UNDERARBEID)
            await submitForm()
          }}
        >
          Trekk innsending til personvernombudet
        </Button>
      </div>
      <div className='w-full flex justify-end items-center'>
        <ExportPvkModal etterlevelseDokumentasjonId={pvkDokument.etterlevelseDokumentId} />
      </div>
    </div>
  )
}
export default SendtTilPvoFields
