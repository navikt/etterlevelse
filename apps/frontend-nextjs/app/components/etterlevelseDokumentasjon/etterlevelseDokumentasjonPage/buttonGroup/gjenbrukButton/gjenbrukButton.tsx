'use client'

import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import {
  EActionMenuRoles,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { UserContext } from '@/provider/user/userProvider'
import { FunctionComponent, useContext } from 'react'
import { CommonVariantOneGjenbruk } from './commonGjenbruk/commonGjenbruk'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon: (state: TEtterlevelseDokumentasjonQL) => void
  behandlingsLivslop?: IBehandlingensLivslop
  pvkDokument?: IPvkDokument
}

const GjenbrukButton: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  setEtterlevelseDokumentasjon,
}) => {
  const user = useContext(UserContext)

  const getRole = (): EActionMenuRoles => {
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
    }
    return EActionMenuRoles.Les
  }

  if (!etterlevelseDokumentasjon.forGjenbruk) {
    return <></>
  }

  const role = getRole()

  if (role === EActionMenuRoles.Risikoeier) {
    return <></>
  }

  const canManage = role !== EActionMenuRoles.Les

  return (
    <CommonVariantOneGjenbruk
      etterlevelseDokumentasjon={etterlevelseDokumentasjon}
      setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
      canManage={canManage}
    />
  )
}

export default GjenbrukButton
