import {
  EActionMenuRoles,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { UserContext } from '@/provider/user/userProvider'
import { useContext } from 'react'

export const getRolle = (
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
): EActionMenuRoles => {
  const user = useContext(UserContext)

  if (user.isAdmin()) {
    return EActionMenuRoles.Admin
  } else if (user.isPersonvernombud()) {
    return EActionMenuRoles.Personvernombud
  } else if (
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
