import { Button, Tabs } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useArkiveringByEtterlevelseDokumentasjonId } from '../../../api/ArkiveringApi'
import { getAllKravPriorityList } from '../../../api/KravPriorityListApi'
import {
  IDocumentRelationWithEtterlevelseDokumetajson,
  IKravPriorityList,
  TEtterlevelseDokumentasjonQL,
  TKravQL,
} from '../../../constants'
import { TTemaCode } from '../../../services/Codelist'
import ExportEtterlevelseModal from '../../export/ExportEtterlevelseModal'
import { ArkiveringModal } from '../ArkiveringModal'
import FocusList from '../FocusList'
import KravList from './KravList'

interface IProps {
  etterlevelseDokumentasjon: TEtterlevelseDokumentasjonQL
  setEtterlevelseDokumentasjon: (e: TEtterlevelseDokumentasjonQL) => void
  temaListe: TTemaCode[]
  relevanteStats: TKravQL[]
  utgaattStats: TKravQL[]
  loading: boolean
  documentRelation?: IDocumentRelationWithEtterlevelseDokumetajson
}

export const DokumentasjonPageTabs = (props: IProps) => {
  const {
    etterlevelseDokumentasjon,
    setEtterlevelseDokumentasjon,
    temaListe,
    relevanteStats,
    utgaattStats,
    loading,
    documentRelation,
  } = props

  const params = useParams<{ id?: string; tema?: string }>()

  const [arkivModal, setArkivModal] = useState<boolean>(false)
  const [allKravPriority, setAllKravPriority] = useState<IKravPriorityList[]>([])

  const [etterlevelseArkiv, setEtterlevelseArkiv] = useArkiveringByEtterlevelseDokumentasjonId(
    params.id
  )

  const [tabValue, setTabValue] = useState('alleKrav')

  useEffect(() => {
    getAllKravPriorityList().then((priority) => setAllKravPriority(priority))
  }, [])

  useEffect(() => {
    if (documentRelation && documentRelation.fromDocumentWithData.prioritertKravNummer.length > 0) {
      setTabValue('prioritertKravliste')
    }
  }, [documentRelation])

  return (
    <div>
      <Tabs defaultValue="alleKrav" value={tabValue} onChange={(newValue) => setTabValue(newValue)}>
        <Tabs.List>
          <Tabs.Tab value="alleKrav" label="Alle Krav" />
          <Tabs.Tab value="prioritertKravliste" label="Prioritert kravliste" />
        </Tabs.List>
        <Tabs.Panel value="alleKrav">
          <div className="pt-4 flex flex-col gap-4">
            <KravList
              temaListe={temaListe}
              relevanteStats={relevanteStats}
              utgaattStats={utgaattStats}
              allKravPriority={allKravPriority}
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              loading={loading}
            />
            <div className="w-full flex justify-end items-center">
              <ExportEtterlevelseModal etterlevelseDokumentasjonId={etterlevelseDokumentasjon.id} />
              <Button variant="tertiary" size="small" onClick={() => setArkivModal(true)}>
                Arkivér i WebSak
              </Button>
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
        <Tabs.Panel value="prioritertKravliste">
          <div className="pt-4 flex flex-col gap-4">
            <FocusList
              loading={loading}
              allKravPriority={allKravPriority}
              etterlevelseDokumentasjon={etterlevelseDokumentasjon}
              setEtterlevelseDokumentasjon={setEtterlevelseDokumentasjon}
              relevanteStats={relevanteStats}
              utgaattStats={utgaattStats}
              temaListe={temaListe}
            />
          </div>
        </Tabs.Panel>
      </Tabs>
    </div>
  )
}
export default DokumentasjonPageTabs
