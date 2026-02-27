'use client'

import {
  EActionMenuRoles,
  TEtterlevelseDokumentasjonQL,
} from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { getRole } from '@/util/etterlevelseDokumentasjon/rolle/rolleUtil'
import { FunctionComponent } from 'react'
import TilstandGjenbruk from './tilstandGjenbruk/tilstandGjenbruk'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon: (state: TEtterlevelseDokumentasjonQL) => void
}

const GjenbrukButton: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  setEtterlevelseDokumentasjon,
}) => {
  switch (getRole(etterlevelseDokumentasjon)) {
    case (EActionMenuRoles.Etterlever, EActionMenuRoles.Admin):
      return (
        <TilstandGjenbruk
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
        />
      )
    case (EActionMenuRoles.Personvernombud,
    EActionMenuRoles.Risikoeier,
    EActionMenuRoles.EtterleverOgRisikoeier,
    EActionMenuRoles.Les):
      return <>Disse rollene skal ikke ha gjenbruk som alternativ</>
    default:
      return <>Feilmelding: Denne rollen finnes ikke</>
  }
}

export default GjenbrukButton
