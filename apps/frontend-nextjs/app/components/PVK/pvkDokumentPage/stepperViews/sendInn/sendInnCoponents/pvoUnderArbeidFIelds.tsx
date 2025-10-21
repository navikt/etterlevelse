import CopyAndExportButtons from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/copyAndExportButtons'
import BeskjedTilPvoReadOnly from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/readOnly/beskjedTilPvoReadOnly'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { pvkDokumentStatusToText } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { Alert, Loader } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  pvkDokument: IPvkDokument
  isLoading: boolean
}

export const PVOUnderArbeidFIelds: FunctionComponent<TProps> = ({ pvkDokument, isLoading }) => {
  return (
    <div>
      <BeskjedTilPvoReadOnly pvkDokument={pvkDokument} />
      {isLoading && (
        <div className='flex justify-center items-center w-full'>
          <Loader size='2xlarge' title='lagrer endringer' />
        </div>
      )}

      <div className='max-w-[75ch]'>
        <Alert variant='info' className='my-5'>
          Status: {pvkDokumentStatusToText(pvkDokument.status)}
        </Alert>
      </div>

      <CopyAndExportButtons etterlevelseDokumentasjonId={pvkDokument.etterlevelseDokumentId} />
    </div>
  )
}
export default PVOUnderArbeidFIelds
