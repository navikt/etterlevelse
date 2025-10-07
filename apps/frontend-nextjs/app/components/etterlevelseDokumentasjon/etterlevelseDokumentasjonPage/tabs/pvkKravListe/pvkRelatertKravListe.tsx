'use client'

import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { TTemaCode } from '@/constants/kodeverk/kodeverkConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import { IKravPriorityList } from '@/constants/krav/kravPriorityList/kravPriorityListConstants'
import { FunctionComponent, useEffect, useState } from 'react'
import EtterlevelseDokumentasjonKravListe from '../kravListe/etterlevelseDokumentasjonKravListe'

type TProps = {
  temaListe: TTemaCode[]
  relevanteStats: TKravQL[]
  utgaattStats: TKravQL[]
  allKravPriority: IKravPriorityList[]
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  loading: boolean
  risikoscenarioList: IRisikoscenario[]
  isRisikoscenarioLoading: boolean
}
export const PvkRelatertKravListe: FunctionComponent<TProps> = ({
  temaListe,
  loading,
  relevanteStats,
  utgaattStats,
  allKravPriority,
  etterlevelseDokumentasjon,
  risikoscenarioList,
  isRisikoscenarioLoading,
}) => {
  const [pvkRelevanteStats, setPvkRelevanteStats] = useState<TKravQL[]>([])
  const [pvkUtgaattStats, setPvkUtgaattStats] = useState<TKravQL[]>([])

  useEffect(() => {
    setPvkRelevanteStats(
      relevanteStats.filter(
        (krav) =>
          krav.tagger &&
          krav.tagger.length > 0 &&
          krav.tagger.includes('Personvernkonsekvensvurdering')
      )
    )
    setPvkUtgaattStats(
      utgaattStats.filter(
        (krav) =>
          krav.tagger &&
          krav.tagger.length > 0 &&
          krav.tagger.includes('Personvernkonsekvensvurdering')
      )
    )
  }, [relevanteStats, utgaattStats])

  return (
    <EtterlevelseDokumentasjonKravListe
      temaListe={temaListe}
      relevanteStats={pvkRelevanteStats}
      utgaattStats={pvkUtgaattStats}
      allKravPriority={allKravPriority}
      etterlevelseDokumentasjon={etterlevelseDokumentasjon}
      loading={loading}
      risikoscenarioList={risikoscenarioList}
      isRisikoscenarioLoading={isRisikoscenarioLoading}
      defaultOpen={true}
    />
  )
}

export default PvkRelatertKravListe
