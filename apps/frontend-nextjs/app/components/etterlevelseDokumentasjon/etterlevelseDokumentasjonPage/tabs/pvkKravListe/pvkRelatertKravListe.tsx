'use client'

import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { ITiltak } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/tiltak/tiltakConstants'
import { TTemaCode } from '@/constants/kodeverk/kodeverkConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import { IKravPriorityList } from '@/constants/krav/kravPriorityList/kravPriorityListConstants'
import { IVurdering } from '@/constants/pvoTilbakemelding/pvoTilbakemeldingConstants'
import { FunctionComponent, useEffect, useState } from 'react'
import EtterlevelseDokumentasjonKravListe from '../kravListe/etterlevelseDokumentasjonKravListe'

type TProps = {
  temaListe: TTemaCode[]
  relevanteStats: TKravQL[]
  allKravPriority: IKravPriorityList[]
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  loading: boolean
  risikoscenarioList: IRisikoscenario[]
  allTiltak: ITiltak[]
  isRisikoscenarioLoading: boolean
  previousVurdering?: IVurdering
}
export const PvkRelatertKravListe: FunctionComponent<TProps> = ({
  temaListe,
  loading,
  relevanteStats,
  allKravPriority,
  etterlevelseDokumentasjon,
  risikoscenarioList,
  isRisikoscenarioLoading,
  allTiltak,
  previousVurdering,
}) => {
  const [pvkRelevanteStats, setPvkRelevanteStats] = useState<TKravQL[]>([])

  useEffect(() => {
    setPvkRelevanteStats(
      relevanteStats.filter(
        (krav) =>
          krav.tagger &&
          krav.tagger.length > 0 &&
          krav.tagger.includes('Personvernkonsekvensvurdering')
      )
    )
  }, [relevanteStats])

  return (
    <EtterlevelseDokumentasjonKravListe
      temaListe={temaListe}
      relevanteStats={pvkRelevanteStats}
      utgaattStats={[]}
      allKravPriority={allKravPriority}
      etterlevelseDokumentasjon={etterlevelseDokumentasjon}
      loading={loading}
      risikoscenarioList={risikoscenarioList}
      allTiltak={allTiltak}
      isRisikoscenarioLoading={isRisikoscenarioLoading}
      defaultOpen={true}
      previousVurdering={previousVurdering}
    />
  )
}

export default PvkRelatertKravListe
