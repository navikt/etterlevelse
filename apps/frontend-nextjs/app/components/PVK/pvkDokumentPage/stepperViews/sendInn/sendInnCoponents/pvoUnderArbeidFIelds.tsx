import CopyAndExportButtons from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/copyAndExportButtons'
import BeskjedTilPvoReadOnly from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/readOnly/beskjedTilPvoReadOnly'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { pvkDokumentStatusToText } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { Alert, Loader } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

type TProps = {
  pvkDokument: IPvkDokument
  etterlevelseDokumentVersjon: number
  isLoading: boolean
}

export const PVOUnderArbeidFIelds: FunctionComponent<TProps> = ({
  pvkDokument,
  etterlevelseDokumentVersjon,
  isLoading,
}) => {
  return (
    <div className='w-full max-w-[75ch]'>
      <BeskjedTilPvoReadOnly
        meldingTilPvo={
          pvkDokument.meldingerTilPvo.find(
            (melding) =>
              melding.innsendingId === pvkDokument.antallInnsendingTilPvo &&
              melding.etterlevelseDokumentVersjon === etterlevelseDokumentVersjon
          ) ??
          pvkDokument.meldingerTilPvo.filter(
            (melding) => melding.innsendingId === pvkDokument.antallInnsendingTilPvo
          )[0]
        }
      />
      {isLoading && (
        <div className='flex justify-center items-center w-full'>
          <Loader size='2xlarge' title='lagrer endringer' />
        </div>
      )}

      <div>
        <Alert variant='info' className='my-5'>
          Status: {pvkDokumentStatusToText(pvkDokument.status)}
        </Alert>
      </div>

      <CopyAndExportButtons etterlevelseDokumentasjonId={pvkDokument.etterlevelseDokumentId} />
    </div>
  )
}
export default PVOUnderArbeidFIelds
