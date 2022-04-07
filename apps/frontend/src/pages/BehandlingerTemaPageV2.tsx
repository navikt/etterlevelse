import React, {useEffect, useState} from 'react'
import {Block, Display} from 'baseui/block'
import {useParams} from 'react-router-dom'
import {H4, Paragraph2} from 'baseui/typography'
import {ettlevColors} from '../util/theme'
import {codelist, ListName, TemaCode} from '../services/Codelist'
import {useBehandling} from '../api/BehandlingApi'
import {Layout2} from '../components/scaffold/Page'
import {Etterlevelse, EtterlevelseStatus, Krav, KRAV_FILTER_TYPE, KravEtterlevelseData, KravPrioritering, KravQL, KravStatus, PageResponse} from '../constants'
import {useQuery} from '@apollo/client'
import {behandlingKravQuery, getAllKrav} from '../api/KravApi'
import {breadcrumbPaths} from '../components/common/CustomizedBreadcrumbs'
import {Responsive} from 'baseui/theme'
import {KravPanelHeaderWithSorting} from '../components/behandling/KravPanelHeader'
import {Helmet} from 'react-helmet'
import {Option} from 'baseui/select'
import {getMainHeader} from './BehandlingPage'
import {SecondaryHeader} from '../components/behandlingsTema/SecondaryHeader'
import {KravList} from '../components/behandlingsTema/KravList'
import {ampli} from '../services/Amplitude'
import {getFilterType} from "./EtterlevelseDokumentasjonPage";
import {filterKrav} from "../components/behandlingsTema/common/utils";
import {getAllKravPriority} from "../api/KravPriorityApi";

const responsiveBreakPoints: Responsive<Display> = ['block', 'block', 'block', 'flex', 'flex', 'flex']
const responsiveDisplay: Responsive<Display> = ['block', 'block', 'block', 'block', 'flex', 'flex']

export const sortingOptions = [
  {label: 'Anbefalt rekkefølge', id: 'priority'},
  {label: 'Sist endret av meg', id: 'lastModified'},
]

export const kravRelevansOptions = [
  {label: 'Relevante krav', id: KRAV_FILTER_TYPE.RELEVANTE_KRAV},
  {label: 'Bortfiltrerte krav', id: KRAV_FILTER_TYPE.BORTFILTTERTE_KRAV},
  {label: 'Utgåtte krav', id: KRAV_FILTER_TYPE.UTGAATE_KRAV},
]

export const mapEtterlevelseData = (etterlevelse?: Etterlevelse) => ({
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

export const BehandlingerTemaPageV2 = () => {
  const params = useParams<{ id?: string; tema?: string }>()
  const temaData: TemaCode | undefined = codelist.getCode(ListName.TEMA, params.tema)
  const [behandling, setBehandling] = useBehandling(params.id)
  const lovListe = codelist.getCodesForTema(temaData?.code)
  const lover = lovListe.map((c) => c.code)
  const [allKrav, setAllKrav] = useState<Krav[]>([])
  const variables = {behandlingId: params.id, lover: lover, gjeldendeKrav: true, behandlingIrrevantKrav: false, status: KravStatus.AKTIV}
  const [allKravPriority, setAllKravPriority] = useState<KravPrioritering[]>([])

  const {data: relevanteKraverGraphQLResponse, loading: relevanteKraverGraphQLLoading} = useQuery<{ krav: PageResponse<KravQL> }>(behandlingKravQuery, {
    variables,
    skip: !params.id || !lover.length,
    fetchPolicy: 'no-cache',
  })

  const {data: irrelevanteKraverGraphQLResponse, loading: irrelevanteKraverGraphQLLoading} = useQuery<{ krav: PageResponse<KravQL> }>(behandlingKravQuery, {
    variables: {...variables, behandlingIrrevantKrav: true},
    skip: !params.id || !lover.length,
    fetchPolicy: 'no-cache',
  })

  const {data: utgaateKraverGraphQLResponse, loading: utgaateKraverGraphQLLoading} = useQuery<{ krav: PageResponse<KravQL> }>(behandlingKravQuery, {
    variables: {status: KravStatus.UTGAATT},
    fetchPolicy: 'no-cache',
  })
  const [relevantKravData, setRelevantKravData] = useState<KravEtterlevelseData[]>([])
  const [irrelevantKravData, setIrrelevantKravData] = useState<KravEtterlevelseData[]>([])
  const [utgaatKravData, setUtgaatKravData] = useState<KravEtterlevelseData[]>([])

  const [sorting, setSorting] = useState<readonly Option[]>([sortingOptions[0]])
  const [kravRelevans, setKravRelevans] = useState<readonly Option[]>([kravRelevansOptions[0]])

  // useEffect(() => {
  //   if(!user.isLoggedIn()) {
  //     navigate(loginUrl(location, location.pathname))
  //   }
  // },[])

  useEffect(() => {
    (async () => {
      setAllKrav(await getAllKrav())
      setAllKravPriority(await getAllKravPriority())
    })()
  }, []);

  useEffect(() => {
    if (behandling && temaData) {
      ampli.logEvent('sidevisning', {
        side: 'Tema side for behandlingen',
        sidetittel: `B${behandling.nummer.toString()} ${behandling.navn.toString()}`,
        section: `${temaData.shortName}`,
      })
    }
  }, [behandling])

  useEffect(() => {
    return () => {
      const utgaatRelevanteKraver = allKrav.filter((k) => {
        if (relevantKravData)
          return relevantKravData.filter((kd) => (kd.kravNummer === k.kravNummer && kd.kravVersjon >= k.kravVersjon && k.status === KravStatus.UTGAATT)).length > 0
        else
          return true
      })

      const utgaatBortfilterteKraver = allKrav.filter((k) => {
        if (irrelevantKravData)
          return irrelevantKravData.filter((rdk) => (rdk.kravNummer === k.kravNummer && rdk.kravVersjon >= k.kravVersjon && k.status === KravStatus.UTGAATT)).length > 0
        else
          return true
      })

      let utgaatKraver: KravQL[] = []
      if (utgaateKraverGraphQLResponse) {
        utgaatKraver = utgaateKraverGraphQLResponse.krav.content.filter((ud) => {
          return [...utgaatRelevanteKraver, ...utgaatBortfilterteKraver].filter((rdk) => (rdk.kravNummer === ud.kravNummer && rdk.kravVersjon === ud.kravVersjon)).length > 0
        })
      }

      ;(async () => {
        setUtgaatKravData(await filterKrav(allKravPriority, utgaatKraver, temaData))
      })()
    };
  }, [relevantKravData, irrelevantKravData, allKravPriority]);


  useEffect(() => {
    ;(async () => {
      filterKrav(allKravPriority, relevanteKraverGraphQLResponse?.krav.content, temaData, true).then((kravListe) => {
        setRelevantKravData(kravListe)
      })
    })()
  }, [relevanteKraverGraphQLResponse, allKravPriority])

  useEffect(() => {
    ;(async () => {
      filterKrav(allKravPriority, irrelevanteKraverGraphQLResponse?.krav.content).then((kravListe) => {
        const newKravList = kravListe.filter((k) => {
          if (k.etterlevelseStatus === undefined) {
            let notFound = true

            relevantKravData.forEach((krav) => {
              if (krav.kravNummer === k.kravNummer && krav.kravVersjon === k.kravVersjon) {
                notFound = false
              }
            })

            return notFound
          } else {
            return false
          }
        })
        setIrrelevantKravData([
          ...newKravList.map((k) => {
            return {
              ...k,
              isIrrelevant: true,
            }
          }),
        ])
      })
    })()
  }, [irrelevanteKraverGraphQLResponse, relevantKravData, allKravPriority])

  const breadcrumbPaths: breadcrumbPaths[] = [
    {
      pathName: 'Dokumenter etterlevelse',
      href: '/behandlinger',
    },
  ]

  const getKravData = (id: string | number | undefined) => {
    if (id === KRAV_FILTER_TYPE.RELEVANTE_KRAV) {
      return relevantKravData
    } else if (id === KRAV_FILTER_TYPE.BORTFILTTERTE_KRAV) {
      return irrelevantKravData
    } else {
      return utgaatKravData
    }
  }

  return (
    <>
      {behandling && (
        <Layout2
          headerBackgroundColor="#F8F8F8"
          headerOverlap="31px"
          mainHeader={getMainHeader(
            behandling,
            <Helmet>
              <meta charSet="utf-8"/>
              <title>
                {temaData?.shortName} B{behandling.nummer.toString()} {behandling.navn.toString()}
              </title>
            </Helmet>,
          )}
          secondaryHeaderBackgroundColor={ettlevColors.green100}
          secondaryHeader={<SecondaryHeader behandling={behandling} lovListe={lovListe} temaData={temaData}/>}
          childrenBackgroundColor={ettlevColors.grey25}
          currentPage={behandling?.navn}
          breadcrumbPaths={breadcrumbPaths}
        >
          <Block display="flex" width="100%" justifyContent="space-between" flexWrap marginBottom="64px">
            <Block width="100%">
              <Block
                $style={{
                  backgroundColor: ettlevColors.white,
                  borderRadius: '4px',
                }}
              >
                <Block display="flex" justifyContent="center" $style={{paddingTop: '26px', paddingBottom: '22px', paddingLeft: '16px'}}>
                  <KravPanelHeaderWithSorting
                    kravRelevans={kravRelevans}
                    setKravRelevans={setKravRelevans}
                    kravData={getKravData(kravRelevans[0].id)}
                    sorting={sorting}
                    setSorting={setSorting}
                  />
                </Block>
                <KravList
                  kravList={getKravData(kravRelevans[0].id)}
                  EmptyMessage={
                    <Block>
                      <H4
                        maxWidth={'600px'}
                        $style={{
                          fontStyle: 'italic',
                        }}
                      >
                        {kravRelevans[0].id === 'relevanteKrav' ? 'Dere har filtrert bort alle krav for ' : 'Dere har ingen bortfiltrerte krav for '}
                        {temaData?.shortName}
                      </H4>
                      <Paragraph2
                        maxWidth={'600px'}
                        $style={{
                          fontStyle: 'italic',
                        }}
                      >
                        Om bortfiltreringen av dette tema er feil, justeres det ved å velge de korrekte egenskapene for behandlingen under innstillinger.
                      </Paragraph2>
                    </Block>
                  }
                  sortingAvailable={true}
                  sorting={sorting}
                  sortingOptions={sortingOptions}
                  behandling={behandling}
                  kravFilter={getFilterType(kravRelevans[0].id)}
                />
              </Block>
            </Block>
          </Block>
        </Layout2>
      )}
    </>
  )
}
