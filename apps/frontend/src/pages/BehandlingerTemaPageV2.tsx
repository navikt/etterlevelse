import React, {useEffect, useState} from 'react'
import {Block, Display} from 'baseui/block'
import {useNavigate, useParams} from 'react-router-dom'
import {H3, Paragraph2} from 'baseui/typography'
import {ettlevColors} from '../util/theme'
import {codelist, ListName, TemaCode} from '../services/Codelist'
import {useBehandling} from '../api/BehandlingApi'
import {Layout2} from '../components/scaffold/Page'
import {Etterlevelse, EtterlevelseStatus, KravEtterlevelseData, KravQL, KravStatus, PageResponse} from '../constants'
import {useQuery} from '@apollo/client'
import {CustomizedAccordion, CustomizedPanel} from '../components/common/CustomizedAccordion'
import {behandlingKravQuery, KravId} from '../api/KravApi'
import {breadcrumbPaths} from '../components/common/CustomizedBreadcrumbs'
import {Responsive} from 'baseui/theme'
import {KravPanelHeader, KravPanelHeaderWithSorting} from '../components/behandling/KravPanelHeader'
import {sortKraverByPriority} from '../util/sort'
import _ from 'lodash'
import {getAllKravPriority} from '../api/KravPriorityApi'
import {Helmet} from 'react-helmet'
import {Option} from 'baseui/select'
import {getMainHeader} from './BehandlingPage'
import {KravView} from "../components/behandlingsTema/KravView";
import {SecondaryHeader} from "../components/behandlingsTema/SecondaryHeader";
import {KravList} from "../components/behandlingsTema/KravList";

const responsiveBreakPoints: Responsive<Display> = ['block', 'block', 'block', 'flex', 'flex', 'flex']
const responsiveDisplay: Responsive<Display> = ['block', 'block', 'block', 'block', 'flex', 'flex']

const mapEtterlevelseData = (etterlevelse?: Etterlevelse) => ({
  etterlevelseId: etterlevelse?.id,
  etterleves: !!etterlevelse?.etterleves,
  frist: etterlevelse?.fristForFerdigstillelse,
  etterlevelseStatus: etterlevelse?.status,
  etterlevelseChangeStamp: etterlevelse?.changeStamp,
  gammelVersjon: false,
})

export const isFerdigUtfylt = (status: EtterlevelseStatus | undefined) => {
  return status === EtterlevelseStatus.FERDIG_DOKUMENTERT || status === EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT
}

export type Section = 'dokumentasjon' | 'etterlevelser' | 'tilbakemeldinger'


export const BehandlingerTemaPageV2 = () => {
  const params = useParams<{ id?: string; tema?: string }>()
  const temaData: TemaCode | undefined = codelist.getCode(ListName.TEMA, params.tema?.replace('i', ''))
  const irrelevantKrav = params?.tema?.charAt(0) === 'i' ? true : false
  const [behandling, setBehandling] = useBehandling(params.id)
  const lovListe = codelist.getCodesForTema(temaData?.code)
  const lover = lovListe.map((c) => c.code)
  const variables = { behandlingId: params.id, lover: lover, gjeldendeKrav: true, behandlingIrrevantKrav: irrelevantKrav }

  const { data: rawData, loading } = useQuery<{ krav: PageResponse<KravQL> }>(behandlingKravQuery, {
    variables,
    skip: !params.id || !lover.length,
    fetchPolicy: 'no-cache'
  })

  const { data: irrelevantData, loading: irrelevantDataLoading } = useQuery<{ krav: PageResponse<KravQL> }>(behandlingKravQuery, {
    variables: { ...variables, behandlingIrrevantKrav: !irrelevantKrav },
    skip: !params.id || !lover.length || params?.tema?.charAt(0) === 'i',
    fetchPolicy: 'no-cache'
  })

  const [kravData, setKravData] = useState<KravEtterlevelseData[]>([])
  const [irrelevantKravData, setIrrelevantKravData] = useState<KravEtterlevelseData[]>([])

  const [activeEtterlevleseStatus, setActiveEtterlevelseStatus] = useState<EtterlevelseStatus | undefined>()

  const [edit, setEdit] = useState<string | undefined>()
  const [kravId, setKravId] = useState<KravId | undefined>()
  const [isExpanded, setIsExpanded] = useState<boolean>(false)
  const sortingOptions = [
    { label: 'Anbefalt rekkefølge', id: 'priority' },
    { label: 'Sist endret av meg', id: 'lastModified' },
  ]
  const [sorting, setSorting] = useState<readonly Option[]>([sortingOptions[0]])
  const [isTemaModalOpen, setIsTemaModalOpen] = useState<boolean>(false)
  const [isAlertUnsavedModalOpen, setIsAlertUnsavedModalOpen] = useState<boolean>(false)
  const [isNavigateButtonClicked, setIsNavigateButtonClicked] = useState<boolean>(false)
  const [tab, setTab] = useState<Section>('dokumentasjon')
  const navigate = useNavigate()


  const filterKrav = async (kravList?: KravQL[], filterFerdigDokumentert?: boolean) => {

    const allKravPriority = await getAllKravPriority()

    const unfilteredkraver = kravList ? _.cloneDeep(kravList) : []

    unfilteredkraver.map((k) => {
      const priority = allKravPriority.filter((kp) => kp.kravNummer === k.kravNummer && kp.kravVersjon === k.kravVersjon)
      k.prioriteringsId = priority.length ? priority[0].prioriteringsId : ''
    })

    const sortedKrav = sortKraverByPriority<KravQL>(unfilteredkraver, temaData?.shortName || '')

    const mapped = sortedKrav.map((krav) => {
      const etterlevelse = krav.etterlevelser.length ? krav.etterlevelser[0] : undefined
      return {
        kravNummer: krav.kravNummer,
        kravVersjon: krav.kravVersjon,
        navn: krav.navn,
        status: krav.status,
        suksesskriterier: krav.suksesskriterier,
        varselMelding: krav.varselMelding,
        prioriteringsId: krav.prioriteringsId,
        ...mapEtterlevelseData(etterlevelse),
      }
    })

    if (filterFerdigDokumentert) {
      for (let index = mapped.length - 1; index > 0; index--) {
        if (mapped[index].kravNummer === mapped[index - 1].kravNummer && mapped[index - 1].etterlevelseStatus === EtterlevelseStatus.FERDIG_DOKUMENTERT) {
          mapped[index - 1].gammelVersjon = true
        } else if (mapped[index].kravNummer === mapped[index - 1].kravNummer && mapped[index - 1].etterlevelseStatus !== EtterlevelseStatus.FERDIG_DOKUMENTERT) {
          mapped.splice(index - 1, 1)
        }
      }
    }

    return mapped
  }

  useEffect(() => {
    (async () => {
      filterKrav(rawData?.krav.content, true).then((kravListe) => {
        setKravData(kravListe.filter((k) => !(k.status === KravStatus.UTGAATT && k.etterlevelseStatus === undefined)))
      })
    })()
  }, [rawData])

  useEffect(() => {
    (async () => {
      kravData.length && filterKrav(irrelevantData?.krav.content).then((kravListe) => {
        const newKravList = kravListe
          .filter((k) => {
            if (k.etterlevelseStatus === undefined) {
              let notFound = true

              kravData.forEach((krav) => {
                if (krav.kravNummer === k.kravNummer && krav.kravVersjon === k.kravVersjon) {
                  notFound = false
                }
              })

              return notFound
            } else {
              return false
            }
          })
        setIrrelevantKravData(newKravList)
      })
    })()
  }, [irrelevantData, kravData])

  const update = (etterlevelse: Etterlevelse) => {
    setKravData(kravData.map((e) => (e.kravVersjon === etterlevelse.kravVersjon && e.kravNummer === etterlevelse.kravNummer ? { ...e, ...mapEtterlevelseData(etterlevelse) } : e)))
  }


  const breadcrumbPaths: breadcrumbPaths[] = [
    {
      pathName: 'Dokumenter etterlevelse',
      href: '/behandlinger',
    },
  ]

  return (
    <>
      {behandling && (
        <Layout2
          headerBackgroundColor="#F8F8F8"
          headerOverlap="31px"
          mainHeader={getMainHeader(
            behandling,
            <Helmet>
              <meta charSet="utf-8" />
              <title>
                {temaData?.shortName} B{behandling.nummer.toString()} {behandling.navn.toString()}
              </title>
            </Helmet>,
          )}
          secondaryHeaderBackgroundColor={ettlevColors.green100}
          secondaryHeader={<SecondaryHeader
            edit={edit}
            behandling={behandling}
            setEdit={setEdit}
            navigate={navigate}
            setIsAlertUnsavedModalOpen={setIsAlertUnsavedModalOpen}
            activeEtterlevleseStatus={activeEtterlevleseStatus}
            isTemaModalOpen={isTemaModalOpen}
            lovListe={lovListe}
            setIsNavigateButtonClicked={setIsNavigateButtonClicked}
            setIsTemaModalOpen={setIsTemaModalOpen}
            tab={tab}
            setTab={setTab}
            temaData={temaData}
          />}
          childrenBackgroundColor={ettlevColors.grey25}
          currentPage={behandling?.navn}
          breadcrumbPaths={breadcrumbPaths}
        >
          <Block display="flex" width="100%" justifyContent="space-between" flexWrap marginBottom="64px">
            <Block width="100%" display={edit ? 'none' : 'block'}>
              <Block
                $style={{
                  backgroundColor: ettlevColors.white,
                  borderRadius: '4px'
                }}
              >
                <Block display="flex" justifyContent="center" $style={{ paddingTop: '26px', paddingBottom: '22px', paddingLeft: '16px' }}>
                  <KravPanelHeaderWithSorting kravData={kravData} sortingOptions={sortingOptions} sorting={sorting} setSorting={setSorting}/>
                </Block>
                <KravList
                  kravList={kravData}
                  emptyMessage={'Ingen krav som skal fylles ut'}
                  sortingAvailable={true}
                  sorting={sorting}
                  sortingOptions={sortingOptions}
                  behandling={behandling}
                  setActiveEtterlevelseStatus={setActiveEtterlevelseStatus}
                  setEdit={setEdit}
                  setKravId={setKravId}
                  edit={edit}
                />
              </Block>
              {irrelevantKravData.length > 0 && (
                <Block marginTop="64px" width="100%">
                  <H3 marginTop="0px" marginBottom="16px">
                    Krav dere har filtrert bort
                  </H3>
                  <Paragraph2 marginTop="0px" marginBottom="25px" maxWidth="574px" width="100%">
                    Dere har filtrert bort krav under dette tema, som dere allikevel må kjenne til og vurdere om dere skal dokumentere på
                  </Paragraph2>
                  <Block width="100%">
                    <CustomizedAccordion>
                      <CustomizedPanel
                        HeaderActiveBackgroundColor={ettlevColors.green50}
                        onClick={() => setIsExpanded(!isExpanded)}
                        title={<KravPanelHeader title="Må vurderes av dere" kravData={irrelevantKravData} />}
                      >
                        <KravList
                          kravList={irrelevantKravData}
                          emptyMessage={'Ingen krav som skal fylles ut'}
                          sortingAvailable={false}
                          sorting={sorting}
                          sortingOptions={sortingOptions}
                          behandling={behandling}
                          setActiveEtterlevelseStatus={setActiveEtterlevelseStatus}
                          setEdit={setEdit}
                          setKravId={setKravId}
                          noStatus={true}
                          edit={edit}
                        />
                      </CustomizedPanel>
                    </CustomizedAccordion>
                  </Block>
                </Block>
              )}
            </Block>
            {edit && behandling && (
              <KravView
                behandlingNavn={behandling.navn}
                etterlevelseId={edit}
                behandlingId={behandling.id}
                behandlingformaal={behandling.overordnetFormaal.shortName || ''}
                behandlingNummer={behandling.nummer || 0}
                kravId={kravId}
                setIsAlertUnsavedModalOpen={setIsAlertUnsavedModalOpen}
                isAlertUnsavedModalOpen={isAlertUnsavedModalOpen}
                isNavigateButtonClicked={isNavigateButtonClicked}
                close={(e) => {
                  setEdit(undefined)
                  e && update(e)
                }}
                tab={tab}
                setTab={setTab}
              />
            )}
          </Block>
        </Layout2>
      )}
    </>
  )
}
