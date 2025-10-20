import ExportPvkModal from '@/components/PVK/export/exportPvkModal'
import CopyAndStatusView from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/copyAndStatusView'
import BeskjedTilPvoReadOnly from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/readOnly/beskjedTilPvoReadOnly'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { Loader } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

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
