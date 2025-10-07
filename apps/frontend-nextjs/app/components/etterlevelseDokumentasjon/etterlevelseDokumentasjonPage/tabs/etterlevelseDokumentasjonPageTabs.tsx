'use client'

import { getAllKravPriorityList } from '@/api/kravPriorityList/kravPriorityListApi'
import PrioritertKravListe from '@/components/etterlevelseDokumentasjon/etterlevelseDokumentasjonPage/tabs/prioritertKravListe/prioritertKravListe'
import { IDocumentRelationWithEtterlevelseDokumetajson } from '@/constants/etterlevelseDokumentasjon/dokumentRelasjon/dokumentRelasjonConstants'
import { TEtterlevelseDokumentasjonQL } from '@/constants/etterlevelseDokumentasjon/etterlevelseDokumentasjonConstants'
import { IPvkDokument } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/personvernkonsekvensevurderingConstants'
import { IRisikoscenario } from '@/constants/etterlevelseDokumentasjon/personvernkonsekvensevurdering/risikoscenario/risikoscenarioConstants'
import { TTemaCode } from '@/constants/kodeverk/kodeverkConstants'
import { TKravQL } from '@/constants/krav/kravConstants'
import { IKravPriorityList } from '@/constants/krav/kravPriorityList/kravPriorityListConstants'
import { Button, Tabs } from '@navikt/ds-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { FunctionComponent, useEffect, useState } from 'react'
import { ArkiveringModal } from '../arkivering/arkiveringModal'
import ExportEtterlevelseModal from '../export/exportEtterlevelseModal'
import EtterlevelseDokumentasjonKravListe from './kravListe/etterlevelseDokumentasjonKravListe'
import PvkKravListeTab from './pvkKravListe/pvkKravListeTab'

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
  etterlevelseDokumentasjon,
  setEtterlevelseDokumentasjon,
  temaListe,
  relevanteStats,
  utgaattStats,
  loading,
  morDocumentRelation,
  pvkDokument,
  risikoscenarioList,
  isRisikoscenarioLoading,
}) => {
  const [isArkivModalOpen, setIsArkivModalOpen] = useState<boolean>(false)
  const [allKravPriority, setAllKravPriority] = useState<IKravPriorityList[]>([])
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
        router.push(pathname, { scroll: false })
      }}
    >
      <Tabs.List>
        <Tabs.Tab value='alleKrav' label='Alle Krav' />
        <Tabs.Tab value='prioritertKravliste' label='Prioritert kravliste' />
        {pvkDokument && pvkDokument.skalUtforePvk && (
          <Tabs.Tab value='pvkRelaterteKrav' label='PVK-relaterte krav' />
        )}
      </Tabs.List>
      <Tabs.Panel value='alleKrav'>
        <div className='pt-4 flex flex-col gap-4'>
          <EtterlevelseDokumentasjonKravListe
            temaListe={temaListe}
            relevanteStats={relevanteStats}
            utgaattStats={utgaattStats}
            allKravPriority={allKravPriority}
            etterlevelseDokumentasjon={etterlevelseDokumentasjon}
            loading={loading}
            risikoscenarioList={risikoscenarioList}
            isRisikoscenarioLoading={isRisikoscenarioLoading}
          />

          <div className='w-full flex justify-end items-center'>
            <ExportEtterlevelseModal etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id} />
            <div>
              <Button variant='tertiary' size='small' onClick={() => setIsArkivModalOpen(true)}>
                Arkivér i Public 360
              </Button>
              <ArkiveringModal
                arkivModal={isArkivModalOpen}
                setArkivModal={setIsArkivModalOpen}
                etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
              />
            </div>
          </div>
        </div>
      </Tabs.Panel>
      <Tabs.Panel value='prioritertKravliste'>
        <div className='pt-4 flex flex-col gap-4'>
          <PrioritertKravListe
            loading={loading}
            allKravPriority={allKravPriority}
            etterlevelseDokumentasjon={etterlevelseDokumentasjon}
            setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
            relevanteStats={relevanteStats}
            temaListe={temaListe}
            risikoscenarioList={risikoscenarioList}
            isRisikoscenarioLoading={isRisikoscenarioLoading}
          />
        </div>
      </Tabs.Panel>
      {pvkDokument && pvkDokument.skalUtforePvk && (
        <Tabs.Panel value='pvkRelaterteKrav'>
          <PvkKravListeTab
            etterlevelseDokumentasjon={etterlevelseDokumentasjon}
            pvkDokument={pvkDokument}
            temaListe={temaListe}
            relevanteStats={relevanteStats}
            allKravPriority={allKravPriority}
            loading={loading}
            risikoscenarioList={risikoscenarioList}
            isRisikoscenarioLoading={isRisikoscenarioLoading}
          />
        </Tabs.Panel>
      )}
    </Tabs>
  )
}

export default EtterlevelseDokumentasjonPageTabs
