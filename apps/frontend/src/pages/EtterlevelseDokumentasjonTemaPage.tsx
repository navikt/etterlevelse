import { useEffect, useState } from 'react'
import { Block } from 'baseui/block'
import { useLocation, useParams } from 'react-router-dom'
import { HeadingXLarge, ParagraphMedium } from 'baseui/typography'
import { ettlevColors } from '../util/theme'
import { codelist, ListName, TemaCode } from '../services/Codelist'
import { Layout2 } from '../components/scaffold/Page'
import { Etterlevelse, EtterlevelseStatus, KRAV_FILTER_TYPE, KravEtterlevelseData, KravPrioritering, KravQL, KravStatus, PageResponse } from '../constants'
import { useQuery } from '@apollo/client'
import { etterlevelseDokumentasjonKravQuery } from '../api/KravApi'
import { breadcrumbPaths } from '../components/common/CustomizedBreadcrumbs'

import { Helmet } from 'react-helmet'
import { Option } from 'baseui/select'
import { ampli } from '../services/Amplitude'
import { getFilterType } from './EtterlevelseDokumentasjonPage'

import { getAllKravPriority } from '../api/KravPriorityApi'
import { useEtterlevelseDokumentasjon } from '../api/EtterlevelseDokumentasjonApi'
import { getMainHeader } from '../components/etterlevelseDokumentasjon/common/utils'
import { SecondaryHeader } from '../components/etterlevelseDokumentasjonTema/SecondaryHeader'
import { KravList } from '../components/etterlevelseDokumentasjonTema/KravList'
import { filterKrav } from '../components/etterlevelseDokumentasjonTema/common/utils'
import { KravPanelHeaderWithSorting } from '../components/etterlevelseDokumentasjon/KravPanelHeader'
import { Loader } from '@navikt/ds-react'
import { useUser } from '../services/User'

export const sortingOptions = [
  { label: 'Anbefalt rekkefølge', id: 'priority' },
  { label: 'Sist endret av meg', id: 'lastModified' },
]

export const kravRelevansOptions = [
  { label: 'Krav som skal etterleves', id: KRAV_FILTER_TYPE.RELEVANTE_KRAV },
  { label: 'Bortfiltrerte krav', id: KRAV_FILTER_TYPE.BORTFILTTERTE_KRAV },
  { label: 'Utgåtte krav', id: KRAV_FILTER_TYPE.UTGAATE_KRAV },
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
  return status === EtterlevelseStatus.FERDIG_DOKUMENTERT || status === EtterlevelseStatus.IKKE_RELEVANT_FERDIG_DOKUMENTERT || status === EtterlevelseStatus.OPPFYLLES_SENERE
}

//UNUSED COMPONENT
// MAKE SURE TO MOVE EXPORTED FUNCTIONS ABOVE BEFORE DELETING THIS FILE
export const EtterlevelseDokumentasjonTemaPage = () => {
  const params = useParams<{ id?: string; tema?: string; filter?: string }>()
  const temaData: TemaCode | undefined = codelist.getCode(ListName.TEMA, params.tema)
  const [etterlevelseDokumentasjon] = useEtterlevelseDokumentasjon(params.id)
  const lovListe = codelist.getCodesForTema(temaData?.code)
  const lover = lovListe.map((c) => c.code)
  const variables = { etterlevelseDokumentasjonId: params.id, lover: lover, gjeldendeKrav: true, etterlevelseDokumentasjonIrelevantKrav: false, status: KravStatus.AKTIV }
  const [allKravPriority, setAllKravPriority] = useState<KravPrioritering[]>([])
  const location = useLocation()
  const [temaPageUrl] = useState<string>(location.pathname)
  const user = useUser

  const { data: relevanteKraverGraphQLResponse, loading: relevanteKraverGraphQLLoading } = useQuery<{ krav: PageResponse<KravQL> }>(etterlevelseDokumentasjonKravQuery, {
    variables,
    skip: !params.id || !lover.length,
    fetchPolicy: 'no-cache',
  })

  const { data: irrelevanteKraverGraphQLResponse, loading: irrelevanteKraverGraphQLLoading } = useQuery<{ krav: PageResponse<KravQL> }>(etterlevelseDokumentasjonKravQuery, {
    variables: { ...variables, etterlevelseDokumentasjonIrrevantKrav: true },
    skip: !params.id || !lover.length,
    fetchPolicy: 'no-cache',
  })

  const { data: utgaateKraverGraphQLResponse, loading: utgaateKraverGraphQLLoading } = useQuery<{ krav: PageResponse<KravQL> }>(etterlevelseDokumentasjonKravQuery, {
    variables: { ...variables, gjeldendeKrav: false, status: KravStatus.UTGAATT },
    fetchPolicy: 'no-cache',
  })

  const [relevantKravData, setRelevantKravData] = useState<KravEtterlevelseData[]>([])
  const [irrelevantKravData, setIrrelevantKravData] = useState<KravEtterlevelseData[]>([])
  const [utgaatKravData, setUtgaatKravData] = useState<KravEtterlevelseData[]>([])

  const [sorting, setSorting] = useState<readonly Option[]>([sortingOptions[0]])
  const [kravRelevans, setKravRelevans] = useState<readonly Option[]>(params.filter ? kravRelevansOptions.filter((kro) => kro.id === params.filter) : [kravRelevansOptions[0]])

  useEffect(() => {
    ;(async () => {
      setAllKravPriority(await getAllKravPriority())
    })()
  }, [])

  useEffect(() => {
    if (etterlevelseDokumentasjon && temaData) {
      ampli.logEvent('sidevisning', {
        side: 'Tema side for dokumentasjon',
        sidetittel: `E${etterlevelseDokumentasjon.etterlevelseNummer.toString()} ${etterlevelseDokumentasjon.title.toString()}`,
        section: `${temaData.shortName}`,
        role: user.isAdmin() ? 'ADMIN' : user.isKraveier() ? 'KRAVEIER' : 'ETTERLEVER'
      })
    }
  }, [etterlevelseDokumentasjon])

  useEffect(() => {
    let utgaatKravData: KravQL[] = []

    //Removing earlier versions of utgått krav
    if (utgaateKraverGraphQLResponse && utgaateKraverGraphQLResponse.krav.content.length > 0) {
      utgaatKravData = utgaateKraverGraphQLResponse.krav.content
      for (let x = utgaatKravData.length - 1; x > 0; x--) {
        if (utgaatKravData[x].kravNummer === utgaatKravData[x - 1].kravNummer && utgaatKravData[x].kravVersjon > utgaatKravData[x - 1].kravVersjon) {
          utgaatKravData.splice(x - 1, 1)
        }
      }
    }

    //Removing utgått krav with aktiv versjons
    utgaatKravData = utgaatKravData.filter((uk) => relevantKravData.every((rk) => uk.kravNummer !== rk.kravNummer))
    setUtgaatKravData(filterKrav(allKravPriority, utgaatKravData, temaData))
  }, [relevantKravData, allKravPriority])

  useEffect(() => {
    setRelevantKravData(filterKrav(allKravPriority, relevanteKraverGraphQLResponse?.krav.content, temaData, true))
  }, [allKravPriority, relevanteKraverGraphQLResponse])

  useEffect(() => {
    const newKravList = filterKrav(allKravPriority, irrelevanteKraverGraphQLResponse?.krav.content).filter((k) => {
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
  }, [relevantKravData, allKravPriority, irrelevanteKraverGraphQLResponse])

  const breadcrumbPaths: breadcrumbPaths[] = [
    {
      pathName: 'Dokumenter etterlevelse',
      href: '/dokumentasjoner',
    },
    {
      pathName: 'Temaoversikt',
      href: '/dokumentasjon/' + etterlevelseDokumentasjon?.id,
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
      {etterlevelseDokumentasjon && (
        <Layout2
          headerBackgroundColor="#F8F8F8"
          headerOverlap="31px"
          mainHeader={getMainHeader(
            etterlevelseDokumentasjon,
            undefined,
            <Helmet>
              <meta charSet="utf-8" />
              <title>
                {temaData ? temaData.shortName : ''} E{etterlevelseDokumentasjon.etterlevelseNummer.toString()} {etterlevelseDokumentasjon.title.toString()}
              </title>
            </Helmet>,
          )}
          secondaryHeaderBackgroundColor={ettlevColors.green100}
          secondaryHeader={<SecondaryHeader etterlevelseDokumentasjon={etterlevelseDokumentasjon} lovListe={lovListe} temaData={temaData} />}
          childrenBackgroundColor={ettlevColors.grey25}
          currentPage={temaData?.shortName}
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
                <Block display="flex" justifyContent="center" $style={{ paddingTop: '26px', paddingBottom: '22px', paddingLeft: '16px' }}>
                  <KravPanelHeaderWithSorting
                    kravRelevans={kravRelevans}
                    setKravRelevans={setKravRelevans}
                    kravData={getKravData(kravRelevans[0].id)}
                    sorting={sorting}
                    setSorting={setSorting}
                    temaPageUrl={temaPageUrl}
                  />
                </Block>
                {!relevanteKraverGraphQLLoading && !irrelevanteKraverGraphQLLoading && !utgaateKraverGraphQLLoading ? (
                  <KravList
                    kravList={getKravData(kravRelevans[0].id)}
                    EmptyMessage={
                      <Block>
                        <HeadingXLarge
                          maxWidth={'600px'}
                          $style={{
                            fontStyle: 'italic',
                          }}
                        >
                          {kravRelevans[0].id === 'relevanteKrav' ? 'Dere har filtrert bort alle krav for ' : 'Dere har ingen bortfiltrerte krav for '}
                          {temaData?.shortName}
                        </HeadingXLarge>
                        <ParagraphMedium
                          maxWidth={'600px'}
                          $style={{
                            fontStyle: 'italic',
                          }}
                        >
                          Om bortfiltreringen av dette tema er feil, justeres det ved å velge de korrekte egenskapene for dokumentasjonen under innstillinger.
                        </ParagraphMedium>
                      </Block>
                    }
                    sortingAvailable={true}
                    sorting={sorting}
                    sortingOptions={sortingOptions}
                    etterlevelseDokumentasjon={etterlevelseDokumentasjon}
                    kravFilter={getFilterType(kravRelevans[0].id)}
                  />
                ) : (
                  <Block display={'flex'} justifyContent={'center'}>
                    <Loader />
                  </Block>
                )}
              </Block>
            </Block>
          </Block>
        </Layout2>
      )}
    </>
  )
}
