'use client'

import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { UserContext } from '@/provider/user/userProvider'
import { FunctionComponent, useContext } from 'react'
import TillatGjenbrukModal from '../gjenbruk/TillatGjenbrukModal'
import { EtterlevelseButton } from './etterlevelseButton/etterlevelseButton'
import { PersonvernkonsekvensvurderingButton } from './personvernkonsekvensvurderingButton/personvernkonsekvensvurderingButton'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon: (state: TEtterlevelseDokumentasjonQL) => void
  risikoscenarioList: IRisikoscenario[]
  behandlingsLivslop?: IBehandlingensLivslop
  pvkDokument?: IPvkDokument
}

export const EtterlevelseDokumentasjonButtonGroup: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  setEtterlevelseDokumentasjon,
  risikoscenarioList,
  behandlingsLivslop,
  pvkDokument,
}) => {
  const user = useContext(UserContext)
  const isRisikoeier: boolean = etterlevelseDokumentasjon.risikoeiere.includes(user.getIdent())

  return (
    <>
      {etterlevelseDokumentasjon.forGjenbruk && (
        <TillatGjenbrukModal
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
          setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
        />
      )}
      <EtterlevelseButton etterlevelseDokumentasjon={etterlevelseDokumentasjon} />
      <PersonvernkonsekvensvurderingButton
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        risikoscenarioList={risikoscenarioList}
        behandlingsLivslop={behandlingsLivslop}
        pvkDokument={pvkDokument}
        isRisikoeier={isRisikoeier}
      />
    </>
  )
}

export default EtterlevelseDokumentasjonButtonGroup
