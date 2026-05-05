'use client'

import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import {
  EActionMenuRoles,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IPvoTilbakemelding } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { IUserContext } from '@/provider/user/userProvider'
import { getRolle } from '@/util/etterlevelseDokumentasjon/rolle/rolleUtil'
import { FunctionComponent } from 'react'
import LesRollePvk from './LesRollePvk/LesRollePvk'
import AdminRollePVK from './adminRollePVK/adminRollePVK'
import EtterleverOgRisikoeierRollePVK from './etterleverOgRisikoeierRollePVK/etterleverOgRisikoeierRollePVK'
import EtterleverRollePVK from './etterleverRollePVK/etterleverRollePVK'
import PersonvernombudRollePVK from './personvernombudRollePVK/personvernombudRollePVK'
import RisikoeierRollePVK from './risikoeierRollePVK/risikoeierRollePVK'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  user: IUserContext
  behandlingensArtOgOmfang?: IBehandlingensArtOgOmfang
  behandlingsLivslop?: IBehandlingensLivslop
  pvkDokument?: IPvkDokument
  pvoTilbakemelding?: IPvoTilbakemelding
}

export const PersonvernkonsekvensvurderingButton: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  user,
  pvkDokument,
  behandlingsLivslop,
  behandlingensArtOgOmfang,
  pvoTilbakemelding,
}) => {
  switch (getRolle(etterlevelseDokumentasjon, user)) {
    case EActionMenuRoles.Etterlever:
      return (
        <EtterleverRollePVK
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
          pvoTilbakemelding={pvoTilbakemelding}
        />
      )
    case EActionMenuRoles.Personvernombud:
      return (
        <PersonvernombudRollePVK
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
          pvoTilbakemelding={pvoTilbakemelding}
        />
      )
    case EActionMenuRoles.Risikoeier:
      return (
        <RisikoeierRollePVK
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
          pvoTilbakemelding={pvoTilbakemelding}
        />
      )
    case EActionMenuRoles.Admin:
      return (
        <AdminRollePVK
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
          pvoTilbakemelding={pvoTilbakemelding}
        />
      )
    case EActionMenuRoles.EtterleverOgRisikoeier:
      return (
        <EtterleverOgRisikoeierRollePVK
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
          behandlingensArtOgOmfang={behandlingensArtOgOmfang}
          behandlingsLivslop={behandlingsLivslop}
          pvoTilbakemelding={pvoTilbakemelding}
        />
      )
    case EActionMenuRoles.Les:
      return (
        <LesRollePvk
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          pvkDokument={pvkDokument}
        />
      )
    default:
      return undefined
  }
}
