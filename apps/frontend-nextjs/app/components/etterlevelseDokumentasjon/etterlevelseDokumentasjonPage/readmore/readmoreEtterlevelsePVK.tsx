import {
  EEtterlevelseDokumentasjonStatus,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IUserContext } from '@/provider/user/userProvider'
import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons'
import { InfoCard } from '@navikt/ds-react'
import { FunctionComponent } from 'react'
import GjenbrukAlert from '../alert/GjenbrukAlert'
import EtterlevelseDokumentasjonExpansionCard from '../expantionCard/etterlevelseDokumentasjonExpansionCard'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  relasjonLoading: boolean
  user: IUserContext
}

export const ReadmoreEtterlevelsePVK: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  relasjonLoading,
  user,
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
      <EtterlevelseDokumentasjonExpansionCard
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        relasjonLoading={relasjonLoading}
      />
    </div>
    {etterlevelseDokumentasjon.forGjenbruk &&
      (etterlevelseDokumentasjon.hasCurrentUserAccess || user.isAdmin()) && (
        <GjenbrukAlert defaultOpen={!etterlevelseDokumentasjon.tilgjengeligForGjenbruk} />
      )}
  </div>
)
