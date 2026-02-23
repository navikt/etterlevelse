'use client'

import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import {
  EActionMenuRoles,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { UserContext } from '@/provider/user/userProvider'
import { FunctionComponent, useContext } from 'react'
import AdminMedAlleAndreRollerOgsaSkruddPaRollePVK from './adminMedAlleAndreRollerOgsaSkruddPaRollePVK/adminMedAlleAndreRollerOgsaSkruddPaRollePVK'
import EtterleverRollePVK from './etterleverRollePVK/etterleverRollePVK'
import PersonvernombudRollePVK from './personvernombudRollePVK/personvernombudRollePVK'
import RisikoeierRollePVK from './risikoeierRollePVK/risikoeierRollePVK'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  behandlingensArtOgOmfang?: IBehandlingensArtOgOmfang
  behandlingsLivslop?: IBehandlingensLivslop
  pvkDokument?: IPvkDokument
}

export const PersonvernkonsekvensvurderingButton: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  pvkDokument,
  behandlingsLivslop,
  behandlingensArtOgOmfang,
}) => {
  const user = useContext(UserContext)

  const getRole = (): EActionMenuRoles => {
    if (user.isAdmin()) {
      return EActionMenuRoles.Admin
    } else if (user.isPersonvernombud()) {
      return EActionMenuRoles.Personvernombud
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

  switch (getRole()) {
    case EActionMenuRoles.Personvernombud:
      return (
        <PersonvernombudRollePVK
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
        />
      )
    case EActionMenuRoles.Risikoeier:
      return (
        <RisikoeierRollePVK
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
        />
      )
    case EActionMenuRoles.Admin:
      return (
        <AdminMedAlleAndreRollerOgsaSkruddPaRollePVK
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
        />
      )
    default:
      return (
        <EtterleverRollePVK
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
        />
      )
  }
}
