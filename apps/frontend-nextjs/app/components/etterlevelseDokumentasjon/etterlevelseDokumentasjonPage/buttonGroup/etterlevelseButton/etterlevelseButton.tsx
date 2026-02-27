'use client'

import {
  EActionMenuRoles,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { getRole } from '@/util/etterlevelseDokumentasjon/rolle/rolleUtil'
import { FunctionComponent } from 'react'
import AdminRolle from './adminRolle/adminRolle'
import EtterleverRolle from './etterleverRolle/etterleverRolle'
import RisikoeierRolle, { RisikoeierOgEtterleverRolle } from './risikoeierRolle/risikoeierRolle'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
}

export const EtterlevelseButton: FunctionComponent<TProps> = ({ etterlevelseDokumentasjon }) => {
  switch (getRole(etterlevelseDokumentasjon)) {
    case EActionMenuRoles.Etterlever:
      return <EtterleverRolle etterlevelseDokumentasjon={etterlevelseDokumentasjon} />
    case EActionMenuRoles.Risikoeier:
      return <RisikoeierRolle etterlevelseDokumentasjon={etterlevelseDokumentasjon} />
    case EActionMenuRoles.EtterleverOgRisikoeier:
      return <RisikoeierOgEtterleverRolle etterlevelseDokumentasjon={etterlevelseDokumentasjon} />
    case EActionMenuRoles.Admin:
      return <AdminRolle etterlevelseDokumentasjon={etterlevelseDokumentasjon} />
    default:
      return <>Feilmelding: Denne rollen finnes ikke</>
  }
}
