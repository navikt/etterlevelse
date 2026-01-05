'use client'

import { IBehandlingensArtOgOmfang } from '@/constants/behandlingensArtOgOmfang/behandlingensArtOgOmfangConstants'
import { IBehandlingensLivslop } from '@/constants/etterlevelseDokumentasjon/behandlingensLivslop/behandlingensLivslopConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { UserContext } from '@/provider/user/userProvider'
import { FunctionComponent, useContext } from 'react'
import TillatGjenbrukModal from '../gjenbruk/TillatGjenbrukModal'
import { AdminMedAlleRollerPaEtterLevelseDokumentasjonButton } from './adminMedAlleRollerPa/adminMedAlleRollerPaEtterLevelseDokumentasjonButton'
import { EtterlevelseButton } from './etterlevelseButton/etterlevelseButton'
import { EtterleverEtterlevelseDokumentasjonsButton } from './etterlever/etterleverEtterlevelseDokumentasjonsButton'
import { PersonvernkonsekvensvurderingButton } from './personvernkonsekvensvurderingButton/personvernkonsekvensvurderingButton'
import { PersonvernombudEtterlevelseDokumentasjonButton } from './personvernombud/personvernombudEtterlevelseDokumentasjonButton'
import { RisikoeierEtterlevelseDokumentasjonButton } from './risikoeier/risikoeierEtterlevelseDokumentasjonButton'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon: (state: TEtterlevelseDokumentasjonQL) => void
  risikoscenarioList: IRisikoscenario[]
  artOgOmfang: IBehandlingensArtOgOmfang
  behandlingsLivslop?: IBehandlingensLivslop
  pvkDokument?: IPvkDokument
}

export const EtterlevelseDokumentasjonButtonGroup: FunctionComponent<TProps> = ({
  etterlevelseDokumentasjon,
  setEtterlevelseDokumentasjon,
  risikoscenarioList,
  // artOgOmfang,
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
      <AdminMedAlleRollerPaEtterLevelseDokumentasjonButton />
      <EtterleverEtterlevelseDokumentasjonsButton />
      <PersonvernombudEtterlevelseDokumentasjonButton />
      <RisikoeierEtterlevelseDokumentasjonButton />
    </>
  )
}

export default EtterlevelseDokumentasjonButtonGroup
