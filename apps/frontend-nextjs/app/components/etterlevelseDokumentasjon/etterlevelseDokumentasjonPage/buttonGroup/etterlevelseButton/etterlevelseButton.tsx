'use client'

import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { UserContext } from '@/provider/user/userProvider'
import { FunctionComponent, useContext } from 'react'
import AdminMedAlleAndreRollerOgsaSkruddPaRolle from './adminMedAlleAndreRollerOgsaSkruddPaRolle/adminMedAlleAndreRollerOgsaSkruddPaRolle'
import EtterleverRolle from './etterleverRolle/etterleverRolle'
import RisikoeierRolle, { RisikoeierOgEtterleverRolle } from './risikoeierRolle/risikoeierRolle'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
}

enum EButtonRole {
  Etterleveler = 'Etterleveler',
  EtterlevelerOgRisikoeier = 'EtterlevelerOgRisikoeier',
  Admin = 'Admin',
  Risikoeier = 'Risikoeier',
  Personvernombud = 'Personvernombud',
  Les = 'Les',
}

export const EtterlevelseButton: FunctionComponent<TProps> = ({ etterlevelseDokumentasjon }) => {
  const user = useContext(UserContext)

  const getRolle = (): EButtonRole => {
    if (user.isAdmin()) {
      return EButtonRole.Admin
    } else {
      if (
        etterlevelseDokumentasjon.hasCurrentUserAccess &&
        etterlevelseDokumentasjon.risikoeiere.includes(user.getIdent())
      ) {
        return EButtonRole.EtterlevelerOgRisikoeier
      } else if (etterlevelseDokumentasjon.risikoeiere.includes(user.getIdent())) {
        return EButtonRole.Risikoeier
      } else if (etterlevelseDokumentasjon.hasCurrentUserAccess) {
        return EButtonRole.Etterleveler
      } else {
        return EButtonRole.Les
      }
    }
  }

  switch (getRolle()) {
    case EButtonRole.Risikoeier:
      return <RisikoeierRolle etterlevelseDokumentasjon={etterlevelseDokumentasjon} />
    case EButtonRole.EtterlevelerOgRisikoeier:
      return <RisikoeierOgEtterleverRolle etterlevelseDokumentasjon={etterlevelseDokumentasjon} />
    case EButtonRole.Admin:
      return (
        <AdminMedAlleAndreRollerOgsaSkruddPaRolle
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        />
      )
    default:
      return <EtterleverRolle etterlevelseDokumentasjon={etterlevelseDokumentasjon} />
  }
}
