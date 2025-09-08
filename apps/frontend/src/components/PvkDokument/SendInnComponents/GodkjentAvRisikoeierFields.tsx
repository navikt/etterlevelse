import { Button, Loader } from '@navikt/ds-react'
import { FormikErrors } from 'formik'
import { FunctionComponent, ReactNode } from 'react'
import { arkiver } from '../../../api/P360Api'
import {
  EPvkDokumentStatus,
  IPvkDokument,
  IPvoTilbakemelding,
  TEtterlevelseDokumentasjonQL,
} from '../../../constants'
import { ICode } from '../../../services/Codelist'
import { user } from '../../../services/User'
import ExportPvkModal from '../../export/ExportPvkModal'
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
  setAngretAvRisikoeier: (state: boolean) => void
  pvoVurderingList: ICode[]
}

export const GodkjentAvRisikoeierFields: FunctionComponent<TProps> = ({
  pvkDokument,
  pvoTilbakemelding,
  etterlevelseDokumentasjon,
  isLoading,
  setFieldValue,
  submitForm,
  errorSummaryComponent,
  setAngretAvRisikoeier,
  pvoVurderingList,
}) => {
  const isRisikoeierCheck: boolean =
    etterlevelseDokumentasjon.risikoeiere.includes(user.getIdent()) || user.isAdmin()

  return (
    <div>
      <BeskjedTilPvoReadOnly pvkDokument={pvkDokument} />
      <BeskjedFraPvoReadOnly
        pvoTilbakemelding={pvoTilbakemelding}
        pvoVurderingList={pvoVurderingList}
      />
      <BeskjedTilRisikoeierReadOnly merknadTilRisikoeier={pvkDokument.merknadTilRisikoeier} />
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
              setAngretAvRisikoeier(true)
              await setFieldValue('status', EPvkDokumentStatus.TRENGER_GODKJENNING)
              await submitForm()
            }}
          >
            Angre godkjenning
          </Button>

          {user.isAdmin() && (
            <Button
              type='button'
              onClick={async () => {
                await arkiver(etterlevelseDokumentasjon.id, true, false, true)
              }}
            >
              Arkiver kun synlig for ADMIN :D
            </Button>
          )}
        </div>
      )}

      <div className='w-full flex justify-end items-center'>
        <ExportPvkModal etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id} />
      </div>
    </div>
  )
}
export default GodkjentAvRisikoeierFields
