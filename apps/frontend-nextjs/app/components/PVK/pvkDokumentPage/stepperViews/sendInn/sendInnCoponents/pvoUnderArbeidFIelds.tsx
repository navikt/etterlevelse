import { InformationSquareFillIcon } from '@navikt/aksel-icons'
import { InfoCard, Loader } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import CopyAndExportButtons from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/copyAndExportButtons'
import BeskjedTilPvoReadOnly from '@/components/PVK/pvkDokumentPage/stepperViews/sendInn/sendInnCoponents/readOnly/beskjedTilPvoReadOnly'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { pvkDokumentStatusToText } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'

type TProps = {
  pvkDokument: IPvkDokument
  isLoading: boolean
}

const PVOUnderArbeidFIelds: FunctionComponent<TProps> = ({ pvkDokument, isLoading }) => (
  <div className='w-full max-w-[75ch]'>
    <BeskjedTilPvoReadOnly
      meldingTilPvo={
        pvkDokument.meldingerTilPvo.filter(
          (melding) =>
            melding.innsendingId === pvkDokument.antallInnsendingTilPvo &&
            melding.etterlevelseDokumentVersjon === pvkDokument.currentEtterlevelseDokumentVersjon
        )[0]
      }
    />
    {isLoading && (
      <div className='flex justify-center items-center w-full'>
        <Loader size='2xlarge' title='lagrer endringer' />
      </div>
    )}

    <div>
      <InfoCard data-color='info' className='my-5'>
        <InfoCard.Message icon={<InformationSquareFillIcon aria-hidden />}>
          Status: {pvkDokumentStatusToText(pvkDokument.status)}
        </InfoCard.Message>
      </InfoCard>
    </div>

    <CopyAndExportButtons etterlevelseDokumentasjonId={pvkDokument.etterlevelseDokumentId} />
  </div>
)

export default PVOUnderArbeidFIelds
