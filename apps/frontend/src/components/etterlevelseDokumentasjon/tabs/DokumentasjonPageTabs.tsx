import { Tabs } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useArkiveringByEtterlevelseDokumentasjonId } from '../../../api/ArkiveringApi'
import { getAllKravPriorityList } from '../../../api/KravPriorityListApi'
import {
  IDocumentRelationWithEtterlevelseDokumetajson,
  IKravPriorityList,
  IPvkDokument,
  IRisikoscenario,
  TEtterlevelseDokumentasjonQL,
  TKravQL,
} from '../../../constants'
import { TTemaCode } from '../../../services/Codelist'
import ExportEtterlevelseModal from '../../export/ExportEtterlevelseModal'
import { ArkiveringModal } from '../ArkiveringModal'
import FocusList from './FocusList'
import KravList from './KravList'
import PvkRelatedKravList from './PvkRelatedKravList'

interface IProps {
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

export const DokumentasjonPageTabs = (props: IProps) => {
  const {
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
  } = props

  const params = useParams<{ id?: string; tema?: string }>()

  const [arkivModal, setArkivModal] = useState<boolean>(false)
  const [allKravPriority, setAllKravPriority] = useState<IKravPriorityList[]>([])

  const [etterlevelseArkiv, setEtterlevelseArkiv] = useArkiveringByEtterlevelseDokumentasjonId(
    params.id
  )

  const [tabValue, setTabValue] = useState('alleKrav')
  const url = new URL(window.location.href)
  const tabQuery = url.searchParams.get('tab')
  const navigate = useNavigate()

  useEffect(() => {
    getAllKravPriorityList().then((priority) => setAllKravPriority(priority))
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
    <div>
      <Tabs
        defaultValue='alleKrav'
        value={tabQuery && tabQuery === 'pvk' ? 'pvkRelaterteKrav' : tabValue}
        onChange={(newValue) => {
          setTabValue(newValue)
          navigate(window.location.pathname)
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
            <KravList
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
              {/* DISABLED UNTIL P360 arkivering is integrated and planned*/}
              {/* <Button variant="tertiary" size="small" onClick={() => setArkivModal(true)}>
                Arkivér i WebSak
              </Button> */}
              <ArkiveringModal
                arkivModal={arkivModal}
                setArkivModal={setArkivModal}
                etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id}
                etterlevelseArkiv={etterlevelseArkiv}
                setEtterlevelseArkiv={setEtterlevelseArkiv}
              />
            </div>
          </div>
        </Tabs.Panel>
        <Tabs.Panel value='prioritertKravliste'>
          <div className='pt-4 flex flex-col gap-4'>
            <FocusList
              loading={loading}
              allKravPriority={allKravPriority}
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
              relevanteStats={relevanteStats}
              utgaattStats={utgaattStats}
              temaListe={temaListe}
              risikoscenarioList={risikoscenarioList}
              isRisikoscenarioLoading={isRisikoscenarioLoading}
            />
          </div>
        </Tabs.Panel>
        <Tabs.Panel value='pvkRelaterteKrav'>
          <div className='pt-4 flex flex-col gap-4'>
            <PvkRelatedKravList
              temaListe={temaListe}
              relevanteStats={relevanteStats}
              utgaattStats={utgaattStats}
              allKravPriority={allKravPriority}
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              loading={loading}
              risikoscenarioList={risikoscenarioList}
              isRisikoscenarioLoading={isRisikoscenarioLoading}
            />
          </div>
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}
export default DokumentasjonPageTabs
