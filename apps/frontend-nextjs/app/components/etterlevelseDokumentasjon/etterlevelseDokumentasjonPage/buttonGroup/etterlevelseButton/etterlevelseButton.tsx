'use client'

import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { UserContext } from '@/provider/user/userProvider'
import { FunctionComponent, useContext } from 'react'
import AdminMedAlleAndreRollerOgsaSkruddPaRolle from './adminMedAlleAndreRollerOgsaSkruddPaRolle/adminMedAlleAndreRollerOgsaSkruddPaRolle'
import EtterleverRolle from './etterleverRolle/etterleverRolle'
import RisikoeierRolle from './risikoeierRolle/risikoeierRolle'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
}

enum EButtonRole {
  Etterleveler = 'Etterleveler',
  Admin = 'Admin',
  Risikoeier = 'Risikoeier',
  Les = 'Les',
}

export const EtterlevelseButton: FunctionComponent<TProps> = ({ etterlevelseDokumentasjon }) => {
  const user = useContext(UserContext)

  const getRolle = (): EButtonRole => {
    if (user.isAdmin()) {
      return EButtonRole.Admin
    } else {
      if (etterlevelseDokumentasjon.risikoeiere.includes(user.getIdent())) {
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
      return (
        <RisikoeierRolle
        // etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        // risikoscenarioList={risikoscenarioList}
        // behandlingsLivslop={behandlingsLivslop}
        // pvkDokument={pvkDokument}
        // isRisikoeier={isRisikoeier}
        />
      )
    case EButtonRole.Admin:
      return (
        <AdminMedAlleAndreRollerOgsaSkruddPaRolle
        // etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        // risikoscenarioList={risikoscenarioList}
        // behandlingsLivslop={behandlingsLivslop}
        // pvkDokument={pvkDokument}
        // isRisikoeier={isRisikoeier}
        />
      )
    default:
      return <EtterleverRolle etterlevelseDokumentasjon={etterlevelseDokumentasjon} />
  }
}
