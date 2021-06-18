import React, { useEffect, useRef, useState } from 'react'
import { Block } from 'baseui/block'
import { useParams } from 'react-router-dom'
import { LoadingSkeleton } from '../components/common/LoadingSkeleton'
import { behandlingName, useBehandling } from '../api/BehandlingApi'
import { HeadingLarge, Label3, Paragraph2, H1, Paragraph4, H2 } from 'baseui/typography'
import { FormikProps } from 'formik'
import { ettlevColors, maxPageWidth, theme } from '../util/theme'
import { Layout2, Page } from '../components/scaffold/Page'
import { Teams } from '../components/common/TeamName'
import { arkPennIcon, gavelIconBg } from '../components/Images'
import { Behandling, KravQL, KravStatus, PageResponse } from '../constants'
import { gql, useQuery } from '@apollo/client'
import { behandlingKravQuery, BehandlingStats, statsQuery } from '../components/behandling/ViewBehandling'
import { codelist, ListName, TemaCode } from '../services/Codelist'
import { PanelLinkCard, PanelLinkCardOverrides } from '../components/common/PanelLink'
import { cardHeight, cardMaxheight, cardWidth, useKravCounter } from './TemaPage'
import { urlForObject } from '../components/common/RouteLink'
import { SimpleTag } from '../components/common/SimpleTag'
import { KravFilters } from '../api/KravGraphQLApi'

export const BehandlingPage = () => {
  const params = useParams<{ id?: string }>()
  const [behandling, setBehandling] = useBehandling(params.id)
  const formRef = useRef<FormikProps<any>>()
  const { data } = useQuery<{ behandling: PageResponse<{ stats: BehandlingStats }> }>(statsQuery, {
    variables: { behandlingId: behandling?.id }
  })
  const stats = data?.behandling.content[0].stats
  console.log(data)
  const temaListe = codelist.getCodes(ListName.TEMA).sort((a, b) => a.shortName.localeCompare(b.shortName, 'nb'))
  const sjekk = [...stats?.fyltKrav || [], ...stats?.ikkeFyltKrav || []]

  console.log(sjekk,)

  console.log(behandling, 'behandling')
  console.log(stats, "STATS")

  const getTotalKrav = stats && stats.fyltKrav.length + stats.ikkeFyltKrav.length
  const getPercentageUtfylt = stats && getTotalKrav && stats.fyltKrav.length / getTotalKrav * 100

  const getMainHeader = (behandling: Behandling) => (
    <Block display="flex" justifyContent="space-between" marginBottom='70px'>
      <Block marginTop={theme.sizing.scale1200}>
        <Label3 color={ettlevColors.green600}>DOKUMENTERE ETTERLEVELSE</Label3>
        <H1 marginTop='0' color={ettlevColors.green800}>{behandling.navn}</H1>
        <Paragraph2>{behandling.overordnetFormaal.shortName}</Paragraph2>
        <Teams teams={behandling.teams} link list />
      </Block>

      <Block
        width="400px"
        height='260px'
        backgroundColor={ettlevColors.white}
        marginTop={theme.sizing.scale400}
      >
        <Block padding="5px">
          <HeadingLarge>Hva er egenskapene til behandlingen?</HeadingLarge>
          <Block $style={{ fontWeight: 400, fontSize: '18px', fontFamily: 'Source Sans Pro' }}>
            Hvis du tilpasser egenskapene skjuler vi kravene som ikke er relevante for din løsning.
          </Block>
        </Block>
      </Block>
    </Block>
  )

  const getSecondaryHeader = (behandling: Behandling) => (
    <Block
      width='100%'
      height='100px'
      maxHeight='100px'
      display="flex"
      alignItems="center"
      justifyContent="space-between"
    >
      <Block display="flex" alignItems="center">
        <Block marginRight="30px"><img src={arkPennIcon} alt='test' height='50px' width='40px' /></Block>
        <H2>Tema for dokumentasjon</H2>
      </Block>

      <Block display="flex" alignItems="center">
        <Block display="flex" alignItems="baseline" marginRight="30px">
          <H1 color={ettlevColors.navOransje} marginRight={theme.sizing.scale300}>{getTotalKrav}</H1>
          <Paragraph2>krav</Paragraph2>
        </Block>

        <Block $style={{ border: '1px solid ' + ettlevColors.green50, background: '#102723' }} height='40px' />

        <Block display="flex" alignItems="baseline" marginLeft="30px">
          <H1 color={ettlevColors.navOransje} marginRight={theme.sizing.scale300}>{getPercentageUtfylt?.toFixed(2)}</H1>
          <Paragraph2>% ferdig utfylt</Paragraph2>
        </Block>
      </Block>

    </Block>
  )

  if (!behandling) return <LoadingSkeleton header='Behandling' />

  return (
    <Layout2
      headerBackgroundColor={ettlevColors.grey50}
      mainHeader={getMainHeader(behandling)}
      secondaryHeaderBackgroundColor={ettlevColors.white}
      secondaryHeader={getSecondaryHeader(behandling)}
      childrenBackgroundColor={ettlevColors.grey50}
    >
      <Block display="flex" width="100%" justifyContent="space-between" flexWrap marginTop={theme.sizing.scale1200}>
        {temaListe.map(tema => <TemaCardBehandling tema={tema} relevans={behandling.relevansFor.map(r => r.code)} behandling={behandling} />)}
      </Block>
    </Layout2>
  )
}

const HeaderContent = () => (
  <Block display={'flex'} flexDirection={'column'}>
    Til utfylling: test
  </Block>
)

const filterForBehandling = (behandling: Behandling, lover: string[]): KravFilters => ({ behandlingId: behandling.id, lover: lover })

const TemaCardBehandling = ({ tema, relevans, behandling }: { tema: TemaCode, relevans: string[], behandling: Behandling }) => {
  const lover = codelist.getCodesForTema(tema.code).map(c => c.code)

  const variables = filterForBehandling(behandling, lover)
  const { data: rawData, loading } = useQuery<{ krav: PageResponse<KravQL> }>(behandlingKravQuery, {
    variables,
    skip: !lover.length
  })
  const krav = rawData?.krav.content.filter(k => !relevans.length || k.relevansFor.map(r => r.code).some(r => relevans.includes(r))) || []

  if (krav.length) {
    console.log(krav, tema.shortName)
  }
  



  const overrides: PanelLinkCardOverrides = {
    Root: {
      Block: {
        style: {
          maskImage: loading ? `linear-gradient(${ettlevColors.black} 0%, transparent 70% 100%)` : undefined,
        }
      }
    },
    Header: {
      Block: {
        style: {
          backgroundColor: ettlevColors.green100,
          height: '180px',
          paddingBottom: theme.sizing.scale600
        }
      }
    },
    Content: {
      Block: {
        style: {
          maskImage: `linear-gradient(${ettlevColors.black} 90%, transparent)`,
          overflow: 'hidden',
        }
      }
    }
  }


  return <PanelLinkCard
            width={cardWidth}
            overrides={overrides}
            verticalMargin={theme.sizing.scale400}
            href={loading ? undefined : urlForObject(ListName.TEMA, tema.code)}
            tittel={tema.shortName + (loading ? ' - Laster...' : '')}
            headerContent={<HeaderContent />}
        />
}
