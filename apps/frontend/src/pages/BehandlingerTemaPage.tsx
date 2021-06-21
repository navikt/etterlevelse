import React, {useEffect, useState} from 'react'
import {Block} from 'baseui/block'
import {useParams} from 'react-router-dom'
import {H1, H2, Label3, Paragraph4} from 'baseui/typography'
import {ettlevColors, theme} from '../util/theme'
import {codelist, ListName, TemaCode} from "../services/Codelist";
import RouteLink, {urlForObject} from "../components/common/RouteLink";
import {useBehandling} from "../api/BehandlingApi";
import {ObjectType} from "../components/admin/audit/AuditTypes";
import {Layout2} from "../components/scaffold/Page";
import {Behandling, Etterlevelse, EtterlevelseStatus, KravQL, PageResponse, Suksesskriterie} from "../constants";
import {KravFilters} from "../api/KravGraphQLApi";
import {arkPennIcon} from "../components/Images";
import {behandlingKravQuery} from "../components/behandling/ViewBehandling";
import {useQuery} from "@apollo/client";

type KravEtterlevelseData = {
  kravNummer: number
  kravVersjon: number
  navn: string
  etterlevelseId?: string
  etterleves: boolean
  frist?: string
  etterlevelseStatus?: EtterlevelseStatus
  suksesskriterier: Suksesskriterie[]
}

const mapEtterlevelseData = (etterlevelse?: Etterlevelse) => ({
  etterlevelseId: etterlevelse?.id,
  etterleves: !!etterlevelse?.etterleves,
  frist: etterlevelse?.fristForFerdigstillelse,
  etterlevelseStatus: etterlevelse?.status
})

export const BehandlingerTemaPage = () => {
  const params = useParams<{ id?: string, tema?: string }>()
  const temaData: TemaCode | undefined = codelist.getCode(ListName.TEMA, params.tema)
  const [behandling, setBehandling] = useBehandling(params.id)
  const lover = codelist.getCodesForTema(temaData?.code).map((c) => c.code)
  const filterForBehandling = (behandling: Behandling, lover: string[]): KravFilters => ({behandlingId: behandling.id, lover: lover})
  const variables = {behandlingId: params.id, lover: lover}
  const {data: rawData, loading} = useQuery<{ krav: PageResponse<KravQL> }>(behandlingKravQuery, {
    variables,
    skip: !params.id || !lover.length,
  })
  const [kravData, setKravData] = useState<KravEtterlevelseData[]>([])

  useEffect(() => {
    const mapped = (rawData?.krav.content || []).map((krav) => {
      const etterlevelse = krav.etterlevelser.length ? krav.etterlevelser[0] : undefined
      return {
        kravNummer: krav.kravNummer,
        kravVersjon: krav.kravVersjon,
        navn: krav.navn,
        suksesskriterier: krav.suksesskriterier,
        ...mapEtterlevelseData(etterlevelse),
      }
    })
    setKravData(mapped)
  }, [rawData])

  console.log('kravData', kravData)
  console.log('rawData', rawData)

  const getMainHeader = () => (
    <Block display="flex" justifyContent="space-between" marginBottom="60px">
      {temaData && behandling && (
        <>
          <Block marginTop={theme.sizing.scale1200}>
            <Label3 color={ettlevColors.green600}>DOKUMENTERE ETTERLEVELSE</Label3>
            <H1 marginTop="0" color={ettlevColors.green800}>
              {temaData?.shortName}
            </H1>
            <RouteLink href={urlForObject(ListName.TEMA, temaData?.code)}>Les om tema</RouteLink>
          </Block>

          <Block marginTop={theme.sizing.scale1200}>
            <Block padding="5px">
              <RouteLink href={urlForObject(ObjectType.Behandling, behandling.id)}>{behandling.navn}</RouteLink>
              <Paragraph4 $style={{lineHeight: '24px'}}>
                {behandling.overordnetFormaal.shortName}
              </Paragraph4>
            </Block>
          </Block>
        </>
      )}
    </Block>
  )

  const getSecondaryHeader = () => (
    <Block width="100%" height="100px" maxHeight="100px" display="flex" alignItems="center" justifyContent="space-between">
      <Block display="flex" alignItems="center">
        <Block marginRight="30px">
          <img src={arkPennIcon} alt="test" height="50px" width="40px"/>
        </Block>
        <H2>Kravene behandlingen skal etterleve</H2>
      </Block>

      {/*<Block display="flex" alignItems="center">*/}
      {/*  <Block display="flex" alignItems="baseline" marginRight="30px">*/}
      {/*    <H1 color={ettlevColors.navOransje} marginRight={theme.sizing.scale300}>*/}
      {/*      {stats.length}*/}
      {/*    </H1>*/}
      {/*    <Paragraph2>krav</Paragraph2>*/}
      {/*  </Block>*/}

      {/*  <Block $style={{ border: '1px solid ' + ettlevColors.green50, background: '#102723' }} height="40px" />*/}

      {/*  <Block display="flex" alignItems="baseline" marginLeft="30px">*/}
      {/*    <H1 color={ettlevColors.navOransje} marginRight={theme.sizing.scale300}>*/}
      {/*      {getPercentageUtfylt?.toFixed(2)}*/}
      {/*    </H1>*/}
      {/*    <Paragraph2>% ferdig utfylt</Paragraph2>*/}
      {/*  </Block>*/}
      {/*</Block>*/}
    </Block>
  )

  return (
    <Layout2
      headerBackgroundColor={ettlevColors.green100}
      mainHeader={getMainHeader()}
      secondaryHeaderBackgroundColor={ettlevColors.white}
      secondaryHeader={getSecondaryHeader()}
      childrenBackgroundColor={ettlevColors.grey50}
      backBtnUrl={'/behandlinger'}
    >
      <Block display="flex" width="100%" justifyContent="space-between" flexWrap marginTop={theme.sizing.scale1200}>
        Test
      </Block>
    </Layout2>
  )
}

