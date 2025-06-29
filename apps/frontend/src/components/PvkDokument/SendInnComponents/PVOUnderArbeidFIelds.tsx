import { Loader } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import { IPvkDokument } from '../../../constants'
import ExportPvkModal from '../../export/ExportPvkModal'
import CopyAndStatusView from './CopyAndStatusView'
import BeskjedTilPvoReadOnly from './readOnly/BeskjedTilPvoReadOnly'

type TProps = {
  pvkDokument: IPvkDokument
  isLoading: boolean
}

export const PVOUnderArbeidFIelds: FunctionComponent<TProps> = ({ pvkDokument, isLoading }) => {
  return (
    <div>
      <BeskjedTilPvoReadOnly pvkDokument={pvkDokument} />

      <CopyAndStatusView pvkDokumentStatus={pvkDokument.status} />

      {isLoading && (
        <div className='flex justify-center items-center w-full'>
          <Loader size='2xlarge' title='lagrer endringer' />
        </div>
      )}

      <div className='w-full flex justify-end items-center'>
        <ExportPvkModal etterlevelseDokumentasjonId={pvkDokument.etterlevelseDokumentId} />
      </div>
    </div>
  )
}
export default PVOUnderArbeidFIelds
