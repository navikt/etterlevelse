import React, {useEffect, useState} from 'react'
import {Block, Display} from 'baseui/block'
import {useParams} from 'react-router-dom'
import {H4, Paragraph2} from 'baseui/typography'
import {ettlevColors} from '../util/theme'
import {codelist, ListName, TemaCode} from '../services/Codelist'
import {useBehandling} from '../api/BehandlingApi'
import {Layout2} from '../components/scaffold/Page'
import {Etterlevelse, EtterlevelseStatus, KravEtterlevelseData, KravQL, KravStatus, PageResponse} from '../constants'
import {useQuery} from '@apollo/client'
import {behandlingKravQuery} from '../api/KravApi'
import {breadcrumbPaths} from '../components/common/CustomizedBreadcrumbs'
import {Responsive} from 'baseui/theme'
import {KravPanelHeaderWithSorting} from '../components/behandling/KravPanelHeader'
import {sortKraverByPriority} from '../util/sort'
import _ from 'lodash'
import {getAllKravPriority} from '../api/KravPriorityApi'
import {Helmet} from 'react-helmet'
import {Option} from 'baseui/select'
import {getMainHeader} from './BehandlingPage'
import {SecondaryHeader} from "../components/behandlingsTema/SecondaryHeader";
import {KravList} from "../components/behandlingsTema/KravList";
import {ampli} from '../services/Amplitude'

const responsiveBreakPoints: Responsive<Display> = ['block', 'block', 'block', 'flex', 'flex', 'flex']
const responsiveDisplay: Responsive<Display> = ['block', 'block', 'block', 'block', 'flex', 'flex']

export const sortingOptions = [
  {label: 'Anbefalt rekkefølge', id: 'priority'},
  {label: 'Sist endret av meg', id: 'lastModified'},
]

export const kravRelevansOptions = [
  {label: 'Relevante krav', id: 'relevanteKrav'},
  {label: 'Bortfiltrerte krav', id: 'irrelevanteKrav'}
]

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

export const BehandlingerTemaPageV2 = () => {
  const params = useParams<{ id?: string; tema?: string }>()
  const temaData: TemaCode | undefined = codelist.getCode(ListName.TEMA, params.tema?.replace('i', ''))
  const irrelevantKrav = params?.tema?.charAt(0) === 'i' ? true : false
  const [behandling, setBehandling] = useBehandling(params.id)
  const lovListe = codelist.getCodesForTema(temaData?.code)
  const lover = lovListe.map((c) => c.code)
  const variables = {behandlingId: params.id, lover: lover, gjeldendeKrav: true, behandlingIrrevantKrav: irrelevantKrav}

  const {data: rawData, loading} = useQuery<{ krav: PageResponse<KravQL> }>(behandlingKravQuery, {
    variables,
    skip: !params.id || !lover.length,
    fetchPolicy: 'no-cache'
  })

  const {data: irrelevantData, loading: irrelevantDataLoading} = useQuery<{ krav: PageResponse<KravQL> }>(behandlingKravQuery, {
    variables: {...variables, behandlingIrrevantKrav: !irrelevantKrav},
    skip: !params.id || !lover.length || params?.tema?.charAt(0) === 'i',
    fetchPolicy: 'no-cache'
  })

  const [kravData, setKravData] = useState<KravEtterlevelseData[]>([])
  const [irrelevantKravData, setIrrelevantKravData] = useState<KravEtterlevelseData[]>([])

  const [isExpanded, setIsExpanded] = useState<boolean>(false)


  const [sorting, setSorting] = useState<readonly Option[]>([sortingOptions[0]])


  const [kravRelevans, setKravRelevans] = useState<readonly Option[]>([kravRelevansOptions[0]])

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
        changeStamp: krav.changeStamp,
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

  // useEffect(() => {
  //   if(!user.isLoggedIn()) {
  //     navigate(loginUrl(location, location.pathname))
  //   }
  // },[])

  useEffect(() => {
    if (behandling && temaData) {
      ampli.logEvent('sidevisning', {
        side: 'Tema side for behandlingen',
        sidetittel: `B${behandling.nummer.toString()} ${behandling.navn.toString()}`,
        section: `${temaData.shortName}`
      })
    }
  }, [behandling])

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
              <meta charSet="utf-8"/>
              <title>
                {temaData?.shortName} B{behandling.nummer.toString()} {behandling.navn.toString()}
              </title>
            </Helmet>,
          )}
          secondaryHeaderBackgroundColor={ettlevColors.green100}
          secondaryHeader={<SecondaryHeader
            behandling={behandling}
            lovListe={lovListe}
            temaData={temaData}
          />}
          childrenBackgroundColor={ettlevColors.grey25}
          currentPage={behandling?.navn}
          breadcrumbPaths={breadcrumbPaths}
        >
          <Block display="flex" width="100%" justifyContent="space-between" flexWrap marginBottom="64px">
            <Block width="100%">
              <Block
                $style={{
                  backgroundColor: ettlevColors.white,
                  borderRadius: '4px'
                }}
              >

                <Block display="flex" justifyContent="center" $style={{paddingTop: '26px', paddingBottom: '22px', paddingLeft: '16px'}}>
                  <KravPanelHeaderWithSorting
                    kravRelevans={kravRelevans}
                    setKravRelevans={setKravRelevans}
                    kravData={kravData}
                    sorting={sorting}
                    setSorting={setSorting}/>
                </Block>
                <KravList
                  kravList={kravRelevans[0].id === 'relevanteKrav' ? kravData : irrelevantKravData}
                  EmptyMessage={
                    <Block>
                      <H4 maxWidth={'600px'} $style={{
                        fontStyle: 'italic'
                      }}>
                        {kravRelevans[0].id === 'relevanteKrav' ? "Dere har filtrert bort alle krav for " : "Dere har ingen bortfiltrerte krav for "}{temaData?.shortName}
                      </H4>
                      <Paragraph2 maxWidth={'600px'} $style={{
                        fontStyle: 'italic'
                      }}>
                        Om bortfiltreringen av dette tema er feil, justeres det ved å velge de korrekte egenskapene for behandlingen under innstillinger.
                      </Paragraph2>
                    </Block>
                  }
                  sortingAvailable={true}
                  sorting={sorting}
                  sortingOptions={sortingOptions}
                  behandling={behandling}
                />
              </Block>
            </Block>
          </Block>
        </Layout2>
      )}
    </>
  )
}
