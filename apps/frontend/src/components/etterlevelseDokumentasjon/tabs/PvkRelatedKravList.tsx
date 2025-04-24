import { useEffect, useState } from 'react'
import {
  IKravPriorityList,
  IRisikoscenario,
  TEtterlevelseDokumentasjonQL,
  TKravQL,
} from '../../../constants'
import { TTemaCode } from '../../../services/Codelist'
import KravList from './KravList'

interface IProps {
  temaListe: TTemaCode[]
  relevanteStats: TKravQL[]
  utgaattStats: TKravQL[]
  allKravPriority: IKravPriorityList[]
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  loading: boolean
  risikoscenarioList: IRisikoscenario[]
  isRisikoscenarioLoading: boolean
}

export const PvkRelatedKravList = (props: IProps) => {
  const {
    temaListe,
    loading,
    relevanteStats,
    utgaattStats,
    allKravPriority,
    etterlevelseDokumentasjon,
    risikoscenarioList,
    isRisikoscenarioLoading,
  } = props

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
    <KravList
      temaListe={temaListe}
      relevanteStats={pvkRelevanteStats}
      utgaattStats={pvkUtgaattStats}
      allKravPriority={allKravPriority}
      etterlevelseDokumentasjon={etterlevelseDokumentasjon}
      loading={loading}
      risikoscenarioList={risikoscenarioList}
      isRisikoscenarioLoading={isRisikoscenarioLoading}
    />
  )
}

export default PvkRelatedKravList
