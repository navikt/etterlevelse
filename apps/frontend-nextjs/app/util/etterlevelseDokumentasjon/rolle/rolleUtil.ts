'use client'

import {
  EActionMenuRoles,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IUserContext } from '@/provider/user/userProvider'

export const getRolle = (
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL,
  user: IUserContext
): EActionMenuRoles => {
  if (user.isAdmin()) {
    return EActionMenuRoles.Admin
  } else if (
    etterlevelseDokumentasjon.hasCurrentUserAccess &&
    etterlevelseDokumentasjon.risikoeiere.includes(user.getIdent())
  ) {
    return EActionMenuRoles.EtterleverOgRisikoeier
  } else if (etterlevelseDokumentasjon.risikoeiere.includes(user.getIdent())) {
    return EActionMenuRoles.Risikoeier
  } else if (etterlevelseDokumentasjon.hasCurrentUserAccess) {
    return EActionMenuRoles.Etterlever
  } else if (user.isPersonvernombud()) {
    return EActionMenuRoles.Personvernombud
  } else {
    return EActionMenuRoles.Les
  }
}
