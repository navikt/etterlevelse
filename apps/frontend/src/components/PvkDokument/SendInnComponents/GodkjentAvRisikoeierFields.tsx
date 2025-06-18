import { Button, Loader } from '@navikt/ds-react'
import { FormikErrors } from 'formik'
import { FunctionComponent, ReactNode } from 'react'
import {
  EPvkDokumentStatus,
  IPvkDokument,
  IPvoTilbakemelding,
  TEtterlevelseDokumentasjonQL,
} from '../../../constants'
import { user } from '../../../services/User'
import CopyAndStatusView from './CopyAndStatusView'
import { BeskjedFraPvoReadOnly } from './readOnly/BeskjedFraPvoReadOnly'
import BeskjedFraRisikoeierReadOnly from './readOnly/BeskjedFraRisikoeierReadOnly'
import BeskjedTilPvoReadOnly from './readOnly/BeskjedTilPvoReadOnly'
import BeskjedTilRisikoeierReadOnly from './readOnly/BeskjedTilRisikoeierReadOnly'

type TProps = {
  pvkDokument: IPvkDokument
  pvoTilbakemelding: IPvoTilbakemelding
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  isLoading: boolean
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<IPvkDokument>>
  submitForm: () => Promise<void>
  errorSummaryComponent: ReactNode
}

export const GodkjentAvRisikoeierFields: FunctionComponent<TProps> = ({
  pvkDokument,
  pvoTilbakemelding,
  etterlevelseDokumentasjon,
  isLoading,
  setFieldValue,
  submitForm,
  errorSummaryComponent,
}) => {
  const isRisikoeierCheck: boolean =
    etterlevelseDokumentasjon.risikoeiere.includes(user.getIdent()) || user.isAdmin()

  return (
    <div>
      <BeskjedTilPvoReadOnly pvkDokument={pvkDokument} />
      <BeskjedFraPvoReadOnly pvoTilbakemelding={pvoTilbakemelding} />
      <BeskjedTilRisikoeierReadOnly merknadTilRisikoeier={pvkDokument.merknadFraRisikoeier} />
      <BeskjedFraRisikoeierReadOnly merknadFraRisikoeier={pvkDokument.merknadFraRisikoeier} />

      <CopyAndStatusView pvkDokumentStatus={pvkDokument.status} />

      {errorSummaryComponent}

      {isLoading && (
        <div className='flex justify-center items-center w-full'>
          <Loader size='2xlarge' title='lagrer endringer' />
        </div>
      )}

      {isRisikoeierCheck && (
        <div className='mt-5 flex gap-2 items-center'>
          <Button
            type='button'
            onClick={async () => {
              await setFieldValue('status', EPvkDokumentStatus.TRENGER_GODKJENNING)
              await submitForm()
            }}
          >
            Angre godkjenning
          </Button>
        </div>
      )}
    </div>
  )
}
export default GodkjentAvRisikoeierFields
