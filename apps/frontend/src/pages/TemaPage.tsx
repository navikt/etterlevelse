import {useParams} from 'react-router-dom'
import {Block, BlockProps} from 'baseui/block'
import React, {useEffect, useState} from 'react'
import {HeadingLarge, HeadingXLarge, HeadingXXLarge, LabelLarge, ParagraphMedium, ParagraphSmall} from 'baseui/typography'
import {codelist, ListName, TemaCode} from '../services/Codelist'
import {ObjectLink, urlForObject} from '../components/common/RouteLink'
import {theme} from '../util'
import {gavelIconBg} from '../components/Images'
import {Markdown} from '../components/common/Markdown'
import {ettlevColors} from '../util/theme'
import Button from '../components/common/Button'
import {KravFilters} from '../api/KravGraphQLApi'
import {SkeletonPanel} from '../components/common/LoadingSkeleton'
import {PanelLink, PanelLinkCard, PanelLinkCardOverrides} from '../components/common/PanelLink'
import {kravNumView} from './KravPage'
import * as _ from 'lodash'
import {faChevronDown, faChevronUp} from '@fortawesome/free-solid-svg-icons'
import {Page} from '../components/scaffold/Page'
import {SimpleTag} from '../components/common/SimpleTag'
import {KravQL, PageResponse} from '../constants'
import {useQuery} from '@apollo/client'
import {QueryHookOptions} from '@apollo/client/react/types/types'
import {gql} from '@apollo/client/core'
import {useForceUpdate} from '../util/hooks'
import {borderRadius} from '../components/common/Style'

export const TemaPage = () => {
  const {tema} = useParams<{tema: string}>()

  if (!tema) return <TemaListe/>

  const code = codelist.getCode(ListName.TEMA, tema)
  if (!code) return <>'invalid code'</>
  return <TemaSide tema={code}/>
}

const TemaSide = ({tema}: {tema: TemaCode}) => {
  const lover = codelist.getCodesForTema(tema.code)
  const {data, loading} = useKravCounter({lover: lover.map(c => c.code)}, {skip: !lover.length})
  const [expand, setExpand] = useState(false)

  return (
    <Page backUrl={'/tema'}
          headerBackgroundColor={ettlevColors.green100}
          backgroundColor={ettlevColors.grey50}
          headerOverlap={'125px'}
          header={
            <>
              <HeadingXXLarge>{tema.shortName}</HeadingXXLarge>

              <Block minHeight={'125px'} maxHeight={expand ? undefined : '125px'} overflow={'hidden'}
                     $style={{
                       maskImage: expand ? undefined : `linear-gradient(${ettlevColors.black} 40%, transparent)`,
                     }}>
                <Markdown source={tema.description}/>
              </Block>

              {expand &&
              <Block marginBottom={theme.sizing.scale900}>
                <HeadingLarge marginBottom={theme.sizing.scale200}>Ansvarlig for lovtolkning</HeadingLarge>
                {_.uniq(lover.map(l => l.data?.underavdeling)).map(code =>
                  <ParagraphMedium key={code} marginTop={0} marginBottom={theme.sizing.scale200}>
                    {codelist.getCode(ListName.UNDERAVDELING, code)?.shortName}
                  </ParagraphMedium>
                )}

                <HeadingLarge marginBottom={theme.sizing.scale200}>Lovdata</HeadingLarge>
                {lover.map(l =>
                  <Block key={l.code} marginBottom={theme.sizing.scale200}>
                    <ObjectLink type={ListName.LOV} id={l.code}>{l.shortName}</ObjectLink>
                  </Block>
                )}
              </Block>}

              <Block alignSelf={'flex-end'} marginTop={theme.sizing.scale600}>
                <Button onClick={() => setExpand(!expand)} icon={expand ? faChevronUp : faChevronDown} kind={'underline-hover'}>
                  {expand ? 'Mindre' : 'Mer'} om tema
                </Button>
              </Block>
            </>
          }>
      <Block>
        <HeadingLarge>{loading ? '?' : data?.krav.numberOfElements || 0} krav</HeadingLarge>
        {loading && <SkeletonPanel count={10}/>}
        {!loading && data?.krav.content.map(k =>
          <Block key={k.id} marginBottom={'8px'}>
            <PanelLink href={`/krav/${k.kravNummer}/${k.kravVersjon}`}
                       panelIcon={<img src={gavelIconBg} aria-hidden alt={'Hammer ikon'}/>}
                       beskrivelse={kravNumView(k)} title={k.navn} flip
            />
          </Block>
        )}
      </Block>
    </Page>
  )
}

const sectionProps: BlockProps = {
  display: 'flex',
  width: '100%',
  justifyContent: 'space-between',
  flexWrap: true
}

const TemaListe = () => {
  const [relevans, setRelevans] = useState<string[]>([])
  const [num] = useState<{[t: string]: number}>({})
  const update = useForceUpdate()
  const visFilter = false // feature toggled

  const onClickFilter = (nyVerdi: string) => {
    if (relevans.indexOf(nyVerdi) >= 0) {
      const nyList = [...relevans]
      _.remove(nyList, it => it === nyVerdi)
      setRelevans(nyList)
    } else setRelevans([...relevans, nyVerdi])
  }

  const updateNum = (tema: string, temaNum: number) => {
    num[tema] = temaNum
    update()
  }

  const kravAntall = Object.values(num).reduce((p, c) => p + c, 0)
  const temaListe = codelist.getCodes(ListName.TEMA).sort((a, b) => a.shortName.localeCompare(b.shortName, 'nb'))

  return (
    <Page
      backUrl={'/'}
      headerBackgroundColor={ettlevColors.grey50}
      backgroundColor={ettlevColors.grey50}
      wideMain
    >
      <HeadingXXLarge>Alle krav</HeadingXXLarge>

      {visFilter && <RelevansFilter relevans={relevans} onClickFilter={onClickFilter} kravAntall={kravAntall}/>}

      <Block {...sectionProps} marginTop={theme.sizing.scale600}>
        {!visFilter && <TemaInfo kravAntall={kravAntall} temaAntall={temaListe.length}/>}
        {temaListe.map(tema => <TemaCard key={tema.code} tema={tema} relevans={relevans} setNum={updateNum}/>)}
      </Block>

    </Page>
  )
}

const RelevansFilter = ({onClickFilter, relevans, kravAntall}: {onClickFilter: (rel: string) => void, relevans: string[], kravAntall: number}) => (
  <Block backgroundColor={ettlevColors.grey75}
         display={'flex'} justifyContent={'space-between'} alignItems={'center'}
         paddingLeft={theme.sizing.scale600} paddingRight={theme.sizing.scale600}
  >

    <Block display={'flex'} alignItems={'center'} marginTop={theme.sizing.scale700} marginBottom={theme.sizing.scale700}>
      <LabelLarge $style={{flexShrink: 0}}>Vis relevante krav for:</LabelLarge>
      <Block display={'flex'} flexWrap>
        {codelist.getCodes(ListName.RELEVANS).map(rel =>
          <SimpleTag key={rel.code} onClick={() => onClickFilter(rel.code)} active={relevans.indexOf(rel.code) >= 0} activeIcon>
            {rel.shortName}
          </SimpleTag>
        )}
      </Block>
    </Block>

    <Block>
      <ParagraphSmall marginTop={0} marginBottom={0} $style={{flexShrink: 0}}>
        Totalt: <span style={{fontWeight: 700}}> {kravAntall}</span> krav
      </ParagraphSmall>
    </Block>

  </Block>
)

export const cardWidth = ['98%', '98%', '98%', '98%','48%', '32%']
export const cardHeight = ['auto', 'auto', 'auto', 'auto', '250px', '250px']
export const cardMaxheight = '250px'

const headerBgOverlap = '29px'

const TemaInfo = (props: {kravAntall: number, temaAntall: number}) => (
  <Block $style={{
    marginTop: theme.sizing.scale400,
    marginBottom: theme.sizing.scale400,
    ...borderRadius('4px'),
    backgroundColor: ettlevColors.grey100
  }} width={cardWidth}>
    <Block padding={theme.sizing.scale600}>
      <HeadingXLarge>Vi har totalt {props.kravAntall} krav gruppert i {props.temaAntall} kategorier</HeadingXLarge>

      <ParagraphMedium>
        Alle vi som utvikler digitale produkter i NAV må forholde seg til en del forskjellige lover og regler. Disse skal bidra til å sikre at den generelle rettsikkerheten til
        brukerne våre ivaretas.
      </ParagraphMedium>
    </Block>
  </Block>
)

export const TemaCard = ({tema, relevans, setNum}: {tema: TemaCode, relevans: string[], setNum: (tema: string, num: number) => void}) => {
  const lover = codelist.getCodesForTema(tema.code).map(c => c.code)
  const {data, loading} = useKravCounter({lover: lover}, {skip: !lover.length})
  const krav = data?.krav.content.filter(k => !relevans.length || k.relevansFor.map(r => r.code).some(r => relevans.includes(r))) || []
  useEffect(() => setNum(tema.code, krav.length), [krav.length])

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
          minHeight: '110px',
          paddingBottom: theme.sizing.scale600
        }
      }
    },
    Content: {
      Block: {
        style: {
          marginTop: `-${headerBgOverlap}`,
          maskImage: `linear-gradient(${ettlevColors.black} 90%, transparent)`,
          overflow: 'hidden'
        }
      }
    }
  }

  return <PanelLinkCard width={cardWidth} height={cardHeight} maxHeight={cardMaxheight} overrides={overrides}
                        verticalMargin={theme.sizing.scale400}
                        href={loading ? undefined : urlForObject(ListName.TEMA, tema.code)}
                        tittel={tema.shortName + (loading ? ' - Laster...' : '')}>
    <Block display={'flex'} flexDirection={'column'}>
      <SimpleTag>
        <Block display={'flex'} alignItems={'center'}>
          <img src={gavelIconBg} width={'35px'} height={'35px'} aria-hidden alt={'Hammer ikon'}/>
          <Block marginLeft={theme.sizing.scale400}>
            {krav?.length || 0} krav
          </Block>
        </Block>
      </SimpleTag>

      <Markdown source={tema.description}/>
    </Block>
  </PanelLinkCard>
}

export const useKravCounter = (variables: {lover: string[]}, options?: QueryHookOptions<any, {lover: string[]}>) => {
  return useQuery<{krav: PageResponse<KravQL>}, KravFilters>(query, {
    ...(options || {}),
    variables
  })
}

const query = gql`
  query countKrav($lover: [String!]) {
    krav(filter: {lover: $lover, gjeldendeKrav: true}) {
      numberOfElements
      content {
        kravNummer
        kravVersjon
        navn
        relevansFor {
          code
        }
      }
    }
  }
`
