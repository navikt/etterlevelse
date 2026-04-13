'use client'

import {
  EActionMenuRoles,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IUserContext } from '@/provider/user/userProvider'
import { getRolle } from '@/util/etterlevelseDokumentasjon/rolle/rolleUtil'
import { FunctionComponent } from 'react'
import AdminRolle from './adminRolle/adminRolle'
import { EtterlevelseReadOnlyActionMenuVariant } from './commonEtterlevelse/commonEtterlevelse'
import EtterleverRolle from './etterleverRolle/etterleverRolle'
import RisikoeierRolle, { RisikoeierOgEtterleverRolle } from './risikoeierRolle/risikoeierRolle'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  user: IUserContext
}

export const EtterlevelseButton: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  user,
}) => {
  switch (getRolle(etterlevelseDokumentasjon, user)) {
    case EActionMenuRoles.Etterlever:
      return <EtterleverRolle etterlevelseDokumentasjon={etterlevelseDokumentasjon} />
    case EActionMenuRoles.Personvernombud:
    case EActionMenuRoles.Risikoeier:
      return <RisikoeierRolle etterlevelseDokumentasjon={etterlevelseDokumentasjon} />
    case EActionMenuRoles.EtterleverOgRisikoeier:
      return <RisikoeierOgEtterleverRolle etterlevelseDokumentasjon={etterlevelseDokumentasjon} />
    case EActionMenuRoles.Admin:
      return <AdminRolle etterlevelseDokumentasjon={etterlevelseDokumentasjon} />
    default:
      return (
        <EtterlevelseReadOnlyActionMenuVariant
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        />
      )
  }
}
