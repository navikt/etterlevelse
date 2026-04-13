import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IUserContext } from '@/provider/user/userProvider'
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
    {etterlevelseDokumentasjon.forGjenbruk &&
      !etterlevelseDokumentasjon.tilgjengeligForGjenbruk &&
      (etterlevelseDokumentasjon.hasCurrentUserAccess || user.isAdmin()) && <GjenbrukAlert />}

    <div className='flex mb-5'>
      <EtterlevelseDokumentasjonExpansionCard
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        relasjonLoading={relasjonLoading}
      />
    </div>
  </div>
)
