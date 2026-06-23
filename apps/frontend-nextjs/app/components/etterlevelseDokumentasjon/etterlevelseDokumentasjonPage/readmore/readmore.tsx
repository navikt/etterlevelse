import { Markdown } from '@/components/common/markdown/markdown'
import { IDocumentRelationWithEtterlevelseDokumetajson } from '@/constants/etterlevelseDokumentasjon/dokumentRelasjon/dokumentRelasjonConstants'
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
  morDokumentRelasjon?: IDocumentRelationWithEtterlevelseDokumetajson
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
  morDokumentRelasjon,
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
        {morDokumentRelasjon && (
          <div className='my-5'>
            <ReadMore
              header='Hvordan dette arvede dokumentet skal brukes'
              aria-label='Hvordan dette arvede dokumentet skal brukes'
              className='w-full'
            >
              <div className='mb-5'>
                <Markdown source={morDokumentRelasjon.fromDocumentWithData.gjenbrukBeskrivelse} />
              </div>
            </ReadMore>
          </div>
        )}

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
