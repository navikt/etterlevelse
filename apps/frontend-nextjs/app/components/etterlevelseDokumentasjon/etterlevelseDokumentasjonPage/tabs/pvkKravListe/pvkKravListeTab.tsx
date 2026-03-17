'use client'

import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { TTemaCode } from '@/constants/kodeverk/kodeverkConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import { IKravPriorityList } from '@/constants/krav/kravPriorityList/kravPriorityListConstants'
import { IVurdering } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { UserContext } from '@/provider/user/userProvider'
import { FunctionComponent, useContext } from 'react'
import PvkAlertGuide from './PvkAlertGuide'
import PvkRelatertKravListe from './pvkRelatertKravListe'

type TProps = {
  pvkDokument: IPvkDokument
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  temaListe: TTemaCode[]
  relevanteStats: TKravQL[]
  allKravPriority: IKravPriorityList[]
  loading: boolean
  risikoscenarioList: IRisikoscenario[]
  allTiltak: ITiltak[]
  isRisikoscenarioLoading: boolean
  previousVurdering?: IVurdering
}

export const PvkKravListeTab: FunctionComponent<TProps> = ({
  pvkDokument,
  etterlevelseDokumentasjon,
  temaListe,
  relevanteStats,
  allKravPriority,
  loading,
  risikoscenarioList,
  allTiltak,
  isRisikoscenarioLoading,
  previousVurdering,
}) => {
  const user = useContext(UserContext)
  return (
    <div className='pt-4 flex flex-col gap-4'>
      {(etterlevelseDokumentasjon.hasCurrentUserAccess || user.isAdmin()) && (
        <PvkAlertGuide
          pvkDokument={pvkDokument}
          etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        />
      )}
      <PvkRelatertKravListe
        temaListe={temaListe}
        relevanteStats={relevanteStats}
        allKravPriority={allKravPriority}
        etterlevelseDokumentasjon={etterlevelseDokumentasjon}
        loading={loading}
        risikoscenarioList={risikoscenarioList}
        isRisikoscenarioLoading={isRisikoscenarioLoading}
        previousVurdering={previousVurdering}
        allTiltak={allTiltak}
      />
    </div>
  )
}

export default PvkKravListeTab
