'use client'

import {
  EActionMenuRoles,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IUserContext } from '@/provider/user/userProvider'
import { getRolle } from '@/util/etterlevelseDokumentasjon/rolle/rolleUtil'
import { FunctionComponent } from 'react'
import TilstandGjenbruk from './tilstandGjenbruk/tilstandGjenbruk'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon: (state: TEtterlevelseDokumentasjonQL) => void
  user: IUserContext
}

const GjenbrukButton: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  setEtterlevelseDokumentasjon,
  user,
}) => {
  switch (getRolle(etterlevelseDokumentasjon, user)) {
    case EActionMenuRoles.Etterlever:
    case EActionMenuRoles.EtterleverOgRisikoeier:
    case EActionMenuRoles.Admin:
      return (
        <TilstandGjenbruk
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
        />
      )
    case EActionMenuRoles.Personvernombud:
    case EActionMenuRoles.Risikoeier:
    case EActionMenuRoles.Les:
      return <>Disse rollene skal ikke ha gjenbruk som alternativ</>
    default:
      return <>Feilmelding: Denne rollen finnes ikke</>
  }
}

export default GjenbrukButton
