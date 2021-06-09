import {useParams} from 'react-router-dom'
import {Block, BlockProps} from 'baseui/block'
import React, {useState} from 'react'
import {HeadingLarge, HeadingXXLarge, LabelLarge, ParagraphMedium, ParagraphSmall} from 'baseui/typography'
import {codelist, ListName, TemaCode} from '../services/Codelist'
import {ObjectLink, urlForObject} from '../components/common/RouteLink'
import {theme} from '../util'
import {gavelIconBg} from '../components/Images'
import {Markdown} from '../components/common/Markdown'
import {ettlevColors} from '../util/theme'
import Button from '../components/common/Button'
import {useKravFilter} from '../api/KravGraphQLApi'
import {SkeletonPanel} from '../components/common/LoadingSkeleton'
import {PanelLink, PanelLinkCard, PanelLinkCardOverrides} from '../components/common/PanelLink'
import {kravNumView} from './KravPage'
import * as _ from 'lodash'
import {faChevronDown, faChevronUp} from '@fortawesome/free-solid-svg-icons'
import {Page} from '../components/scaffold/Page'
import {SimpleTag} from '../components/common/SimpleTag'
import {KravQL} from '../constants'

export const TemaPage = () => {
  const {tema} = useParams<{tema: string}>()

  if (!tema) return <TemaListe/>

  const code = codelist.getCode(ListName.TEMA, tema)
  if (!code) return <>'invalid code'</>
  return <TemaSide tema={code}/>
}

const TemaSide = ({tema}: {tema: TemaCode}) => {
  const lover = codelist.getCodesForTema(tema.code)
  const {data, loading} = useKravFilter({lover: lover.map(c => c.code), gjeldendeKrav: true}, {skip: !lover.length})
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
  const {data, loading} = useKravFilter({gjeldendeKrav: true, relevans: relevans})

  const onClickFilter = (nyVerdi: string) => {
    if (relevans.indexOf(nyVerdi) >= 0) {
      const nyList = [...relevans]
      _.remove(nyList, it => it === nyVerdi)
      setRelevans(nyList)
    } else setRelevans([...relevans, nyVerdi])
  }

  return (
    <Page
      backUrl={'/'}
      headerBackgroundColor={ettlevColors.grey50}
      backgroundColor={ettlevColors.grey50}
      wideMain
    >
      <HeadingXXLarge>Alle krav</HeadingXXLarge>

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
            Totalt: <span style={{fontWeight: 700}}> {data?.krav.numberOfElements}</span> krav
          </ParagraphSmall>
        </Block>

      </Block>

      <Block {...sectionProps} marginTop={theme.sizing.scale600}>

        {loading && _.range(0, 3).map(i => <TemaCard key={i} krav={[]} tema={{
          list: ListName.TEMA,
          code: 'LOADING',
          shortName: 'Laster',
          description: '.......... ... .. ....... .... ... ......... ..... .... .. .......... ... .. ....... .... ... ......... .. ... .\n\n' +
            '... ..... ...... .. ... .... ....... ..... ...... .. ... .... ....'
        }}/>)}

        {!loading && codelist.getCodes(ListName.TEMA).map(tema => {
            const krav = data?.krav.content.filter(k => k.regelverk.find(r => codelist.gjelderForLov(tema, r.lov))) || []
            if (relevans.length && !krav.length) return null
            return <TemaCard key={tema.code} tema={tema} krav={krav}/>
          }
        )}
      </Block>

    </Page>
  )
}


const TemaCard = ({tema, krav}: {tema: TemaCode, krav: KravQL[]}) => {
  const loading = tema.code === 'LOADING'
  const headerBgOverlap = '29px'
  const overrides: PanelLinkCardOverrides = {
    Root: {
      Block: {
        style: {
          marginTop: theme.sizing.scale600,
          marginBottom: theme.sizing.scale600,
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
  return <PanelLinkCard width={'32%'} height={'250px'} overrides={overrides}
                        href={loading ? undefined : urlForObject(ListName.TEMA, tema.code)}
                        tittel={tema.shortName}>
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
