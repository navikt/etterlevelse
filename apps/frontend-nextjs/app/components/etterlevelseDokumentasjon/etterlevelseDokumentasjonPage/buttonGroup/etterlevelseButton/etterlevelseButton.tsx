'use client'

import {
  EActionMenuRoles,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { UserContext } from '@/provider/user/userProvider'
import { FunctionComponent, useContext } from 'react'
import AdminMedAlleAndreRollerOgsaSkruddPaRolle from './adminMedAlleAndreRollerOgsaSkruddPaRolle/adminMedAlleAndreRollerOgsaSkruddPaRolle'
import EtterleverRolle from './etterleverRolle/etterleverRolle'
import RisikoeierRolle, { RisikoeierOgEtterleverRolle } from './risikoeierRolle/risikoeierRolle'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
}

export const EtterlevelseButton: FunctionComponent<TProps> = ({ etterlevelseDokumentasjon }) => {
  const user = useContext(UserContext)

  const getRolle = (): EActionMenuRoles => {
    if (user.isAdmin()) {
      return EActionMenuRoles.Admin
    } else {
      if (
        etterlevelseDokumentasjon.hasCurrentUserAccess &&
        etterlevelseDokumentasjon.risikoeiere.includes(user.getIdent())
      ) {
        return EActionMenuRoles.EtterleverOgRisikoeier
      } else if (etterlevelseDokumentasjon.risikoeiere.includes(user.getIdent())) {
        return EActionMenuRoles.Risikoeier
      } else if (etterlevelseDokumentasjon.hasCurrentUserAccess) {
        return EActionMenuRoles.Etterlever
      } else {
        return EActionMenuRoles.Les
      }
    }
  }

  switch (getRolle()) {
    case EActionMenuRoles.Risikoeier:
      return <RisikoeierRolle etterlevelseDokumentasjon={etterlevelseDokumentasjon} />
    case EActionMenuRoles.EtterleverOgRisikoeier:
      return <RisikoeierOgEtterleverRolle etterlevelseDokumentasjon={etterlevelseDokumentasjon} />
    case EActionMenuRoles.Admin:
      return (
        <AdminMedAlleAndreRollerOgsaSkruddPaRolle
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        />
      )
    default:
      return <EtterleverRolle etterlevelseDokumentasjon={etterlevelseDokumentasjon} />
  }
}
