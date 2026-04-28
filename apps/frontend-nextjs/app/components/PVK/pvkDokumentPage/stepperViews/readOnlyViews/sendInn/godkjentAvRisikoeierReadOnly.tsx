'use client'

import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { ICode } from '@/constants/kodeverk/kodeverkConstants'
import { IPvoTilbakemelding } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { pvkDokumentStatusToText } from '@/util/etterlevelseDokumentasjon/pvkDokument/pvkDokumentUtils'
import { Alert, Heading, Loader } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import CopyAndExportButtons from '../../sendInn/sendInnCoponents/copyAndExportButtons'
import TilbakemeldingsHistorikk from '../../sendInn/sendInnCoponents/readOnly/TilbakemeldingsHistorikk'
import BeskjedTilRisikoeierReadOnly from '../../sendInn/sendInnCoponents/readOnly/beskjedTilRisikoeierReadOnly'
import BeskjedFraRisikoeierReadOnly from '../beskjedFraRisikoeierReadOnly'

type TProps = {
  pvkDokument: IPvkDokument
  pvoTilbakemelding: IPvoTilbakemelding
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  isLoading: boolean
  pvoVurderingList: ICode[]
}

export const GodkjentAvRisikoeierReadOnly: FunctionComponent<TProps> = ({
  pvkDokument,
  pvoTilbakemelding,
  etterlevelseDokumentasjon,
  isLoading,
  pvoVurderingList,
}) => {
  return (
    <div className='w-full max-w-[75ch]'>
      <TilbakemeldingsHistorikk
        antallInnsendingTilPvo={pvkDokument.antallInnsendingTilPvo}
        meldingerTilPvo={pvkDokument.meldingerTilPvo}
        vurderinger={pvoTilbakemelding.vurderinger}
        pvoVurderingList={pvoVurderingList}
        etterlevelseDokumentVersjon={etterlevelseDokumentasjon.etterlevelseDokumentVersjon}
        defaultFirstOpen={true}
      />

      <Heading size='medium' level='2' className='mb-5 mt-8'>
        Sendt PVK til godkjenning av risikoeier
      </Heading>

      <BeskjedTilRisikoeierReadOnly merknadTilRisikoeier={pvkDokument.merknadTilRisikoeier} />
      <BeskjedFraRisikoeierReadOnly merknadFraRisikoeier={pvkDokument.merknadFraRisikoeier} />

      {isLoading && (
        <div className='flex justify-center items-center w-full'>
          <Loader size='2xlarge' title='lagrer endringer' />
        </div>
      )}

      <div>
        <Alert variant='info' className='my-5 '>
          Status: {pvkDokumentStatusToText(pvkDokument.status)}
        </Alert>
      </div>

      <CopyAndExportButtons etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id} />
    </div>
  )
}
export default GodkjentAvRisikoeierReadOnly
