import { Alert, Heading, Link, List, Tabs } from '@navikt/ds-react'
import { useEffect, useState } from 'react'
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom'
import { useArkiveringByEtterlevelseDokumentasjonId } from '../../../api/ArkiveringApi'
import { getAllKravPriorityList } from '../../../api/KravPriorityListApi'
import {
  EPvkDokumentStatus,
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
  const navigate: NavigateFunction = useNavigate()

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
        {/* 
        export enum EPvkDokumentStatus {
  UNDERARBEID = 'UNDERARBEID',
  SENDT_TIL_PVO = 'SENDT_TIL_PVO',
  PVO_UNDERARBEID = 'PVO_UNDERARBEID',
  VURDERT_AV_PVO = 'VURDERT_AV_PVO',
  TRENGER_GODKJENNING = 'TRENGER_GODKJENNING',
  GODKJENT_AV_RISIKOEIER = 'GODKJENT_AV_RISIKOEIER',
  AKTIV = 'AKTIV',
} */}

        <Tabs.Panel value='pvkRelaterteKrav'>
          <div className='pt-4 flex flex-col gap-4'>
            {pvkDokument &&
              pvkDokument.status !== EPvkDokumentStatus.SENDT_TIL_PVO &&
              pvkDokument.status !== EPvkDokumentStatus.VURDERT_AV_PVO && (
                <Alert className='max-w-[75ch]' variant='info'>
                  <Heading spacing size='small' level='3'>
                    Personvernkonsekvensvurdering: slik gjør dere nå
                  </Heading>
                  <List as='ul'>
                    <List.Item>
                      Beskriv risikoscenarioer og tiltak ved siden av deres
                      etterlevelsesdokumentasjon der dette er aktuelt.
                    </List.Item>
                    <List.Item>
                      Husk at dere kan gjenbruke deres egne risikoscenarioer eller tiltak dersom
                      disse gjelder flere steder.
                    </List.Item>
                    <List.Item>
                      Øvrige risikoscenarioer og tiltak som ikke er tilknyttet spesifikke
                      etterlevelseskrav beskriver dere på{' '}
                      <Link href='demo'>PVK: Identifisering av risikoscenarier og tiltak.</Link>
                    </List.Item>
                  </List>
                </Alert>
              )}

            {pvkDokument && pvkDokument.status === EPvkDokumentStatus.SENDT_TIL_PVO && (
              <Alert className='max-w-[75ch]' variant='warning'>
                <Heading spacing size='small' level='3'>
                  PVK ligger til vurdering hos Personvernombudet om dagen.
                </Heading>
                Dokumentasjon tilknyttet deres PVK er låst og kan ikke redigeres.
                <br />
                Dette gjelder for:
                <List as='ul'>
                  <List.Item>
                    Dokumentasjon av risikoscenarioer og tiltak i forbindelse med PVK
                  </List.Item>
                  <List.Item>
                    Etterlevelsesdokumentasjon tilknyttet alle PVK-relaterte krav.
                  </List.Item>
                  Etterlevelseskrav som ikke er tilknyttet PVK kan forsatt redigeres som normalt.
                  <br />
                  <br />
                  Hvis dere oppdager betydelig behov for å endre på dokumentasjonen i forbindelse
                  med vurdering av PVK, ta kontakt med PVO på personvernombudet@nav.no.
                </List>
              </Alert>
            )}

            {pvkDokument && pvkDokument.status === EPvkDokumentStatus.VURDERT_AV_PVO && (
              <Alert className='max-w-[75ch]' variant='info'>
                <Heading spacing size='small' level='3'>
                  Nå som Personvernombudet har sendt sin tilbakemelding, kan dere redigere
                  PVK-dokumentasjonen på nytt.
                </Heading>
                Dette gjelder for:
                <List as='ul'>
                  <List.Item>Risikoscenario- og tiltaksbeskrivelser</List.Item>
                  <List.Item>Etterlevelsesdokumentasjon tilknyttet PVK-relaterte krav.</List.Item>
                </List>
                Resten av deres etterlevelsesdokumentasjon er alltid redigerbar.
              </Alert>
            )}

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
