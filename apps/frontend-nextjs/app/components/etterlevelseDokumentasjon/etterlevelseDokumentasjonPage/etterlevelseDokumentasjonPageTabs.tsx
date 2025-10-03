'use client'

import { getAllKravPriorityList } from '@/api/kravPriorityList/kravPriorityListApi'
import { IDocumentRelationWithEtterlevelseDokumetajson } from '@/constants/etterlevelseDokumentasjon/dokumentRelasjon/dokumentRelasjonConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import { IKravPriorityList } from '@/constants/krav/kravPriorityList/kravPriorityListConstants'
import { TTemaCode } from '@/constants/teamkatalogen/teamkatalogConstants'
import { Tabs } from '@navikt/ds-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { FunctionComponent, useEffect, useState } from 'react'

type TProps = {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon: (e: TEtterlevelseDokumentasjonQL) => void
  temaListe: TTemaCode[]
  relevanteStats: TKravQL[]
  utgaattStats: TKravQL[]
  loading: boolean
  morDocumentRelation?: IDocumentRelationWithEtterlevelseDokumetajson
  pvkDokument?: IPvkDokument
  risikoscenarioList: IRisikoscenario[]
  isRisikoscenarioLoading: boolean
}

export const EtterlevelseDokumentasjonPageTabs: FunctionComponent<TProps> = ({
  // etterlevelseDokumentasjon,
  // setEtterlevelseDokumentasjon,
  // temaListe,
  // relevanteStats,
  // utgaattStats,
  // loading,
  morDocumentRelation,
  pvkDokument,
  // risikoscenarioList,
  // isRisikoscenarioLoading,
}) => {
  // const [arkivModal, setArkivModal] = useState<boolean>(false)
  const [, setAllKravPriority] = useState<IKravPriorityList[]>([])
  const queryParams = useSearchParams()
  const tabQuery = queryParams.get('tab')
  const [tabValue, setTabValue] = useState('alleKrav')
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    ;(async () => {
      await getAllKravPriorityList().then((priority) => setAllKravPriority(priority))
    })()
  }, [])

  useEffect(() => {
    if (
      morDocumentRelation &&
      morDocumentRelation.fromDocumentWithData.prioritertKravNummer.length > 0
    ) {
      setTabValue('prioritertKravliste')
    }
  }, [morDocumentRelation, pvkDokument])

  return (
    <Tabs
      defaultValue='alleKrav'
      value={tabQuery && tabQuery === 'pvk' ? 'pvkRelaterteKrav' : tabValue}
      onChange={(newValue) => {
        setTabValue(newValue)
        router.push(pathname)
      }}
    >
      <Tabs.List>
        <Tabs.Tab value='alleKrav' label='Alle Krav' />
        <Tabs.Tab value='prioritertKravliste' label='Prioritert kravliste' />
        {pvkDokument && pvkDokument.skalUtforePvk && (
          <Tabs.Tab value='pvkRelaterteKrav' label='PVK-relaterte krav' />
        )}
      </Tabs.List>
      <Tabs.Panel value='alleKrav'>test</Tabs.Panel>
      <Tabs.Panel value='prioritertKravliste'>test</Tabs.Panel>
      <Tabs.Panel value='pvkRelaterteKrav'>test</Tabs.Panel>
    </Tabs>
  )
}

export default EtterlevelseDokumentasjonPageTabs
