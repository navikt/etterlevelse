import {
  EEtterlevelseDokumentasjonStatus,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons'
import { InfoCard, ReadMore } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import GjenbrukAlert from '../alert/GjenbrukAlert'
import EtterlevelseDokumentasjonExpansionCard from '../expantionCard/etterlevelseDokumentasjonExpansionCard'
import { TilgjengeligForGjenbruk } from '../tilgjengeligForGjenbruk/tilgjengeligForGjenbruk'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  relasjonLoading: boolean
}

enum EReadmoreTilstand {
  TIlGJENGELIG_FOR_GJENBRUK = 'Tilgjengelig for gjenbruk',
  GJENBRUK_AV = 'Gjenbruk er av',
  GJENBRUK_PA = 'Gjenbruk er på',
}

const readmoreTilstandUtil = (
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL,
  relasjonLoading: boolean
): EReadmoreTilstand | undefined => {
  if (etterlevelseDokumentasjon.forGjenbruk && !etterlevelseDokumentasjon.tilgjengeligForGjenbruk) {
    return EReadmoreTilstand.GJENBRUK_AV
  }

  if (!relasjonLoading && etterlevelseDokumentasjon.tilgjengeligForGjenbruk) {
    return EReadmoreTilstand.GJENBRUK_PA
  }

  if (etterlevelseDokumentasjon.forGjenbruk) {
    return EReadmoreTilstand.TIlGJENGELIG_FOR_GJENBRUK
  }
}

export const EtterlevelseDokumentasjonReadmore: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  relasjonLoading,
}) => (
  <div className='max-w-5xl flex-1'>
    {etterlevelseDokumentasjon.status ===
      EEtterlevelseDokumentasjonStatus.SENDT_TIL_GODKJENNING_TIL_RISIKOEIER && (
      <InfoCard data-color='warning' className='my-5 max-w-[75ch]' size='small'>
        <InfoCard.Header icon={<ExclamationmarkTriangleIcon aria-hidden />}>
          <InfoCard.Title>
            Fordi dette etterlevelsesdokumentet ligger til godkjenning hos risikoeier, vil det ikke
            være mulig å redigere kravdokumentasjon fram til at dokumentet er godkjent.
          </InfoCard.Title>
        </InfoCard.Header>
      </InfoCard>
    )}

    <div className='flex mb-5'>
      <div>
        <EtterlevelseDokumentasjonExpansionCard
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        />

        {readmoreTilstandUtil(etterlevelseDokumentasjon, relasjonLoading) ===
          EReadmoreTilstand.GJENBRUK_PA && (
          <div className='mt-5'>
            <ReadMore header='Du kan gjenbruke dette etterlevelsesdokumentet'>
              <TilgjengeligForGjenbruk etterlevelseDokumentasjon={etterlevelseDokumentasjon} />
            </ReadMore>
          </div>
        )}

        {readmoreTilstandUtil(etterlevelseDokumentasjon, relasjonLoading) ===
          EReadmoreTilstand.GJENBRUK_AV && <GjenbrukAlert />}
      </div>
    </div>
  </div>
)
