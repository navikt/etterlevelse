import {useParams} from 'react-router-dom'
import {Block, BlockProps} from 'baseui/block'
import React, {useState} from 'react'
import {HeadingLarge, HeadingXXLarge, LabelMedium, ParagraphMedium} from 'baseui/typography'
import {codelist, ListName, TemaCode} from '../services/Codelist'
import {ObjectLink, urlForObject} from '../components/common/RouteLink'
import {theme} from '../util'
import {gavelIcon, TemaBilde} from '../components/Images'
import {FrontCard} from './MainPage'
import {Markdown} from '../components/common/Markdown'
import {ettlevColors} from '../util/theme'
import Button from '../components/common/Button'
import {useKravFilter} from '../api/KravGraphQLApi'
import {SkeletonPanel} from '../components/common/LoadingSkeleton'
import {PanelLink} from '../components/common/PanelLink'
import {kravNumView} from './KravPage'
import * as _ from 'lodash'
import {faChevronDown, faChevronUp} from '@fortawesome/free-solid-svg-icons'
import {Page} from '../components/scaffold/Page'

export const TemaPage = () => {
  const {tema} = useParams<{tema: string}>()

  if (!tema) return <TemaListe/>

  const code = codelist.getCode(ListName.TEMA, tema)
  if (!code) return <>'invalid code'</>
  return <TemaSide tema={code}/>
}

const TemaSide = ({tema}: {tema: TemaCode}) => {
  const lover = codelist.getCodesForTema(tema.code)
  const {data, loading} = useKravFilter({lover: lover.map(c => c.code)}, {skip: !lover.length})
  const [expand, setExpand] = useState(false)

  return (
    <Page backUrl={'/tema'}
          headerBackgroundColor={ettlevColors.green100}
          backgroundColor={ettlevColors.grey50}
          headerOverlap={'125px'}
          header={
            <>
              <HeadingXXLarge>{tema.shortName}</HeadingXXLarge>

              <Block maxHeight={expand ? undefined : '125px'} overflow={'hidden'}
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
                       panelIcon={<img src={gavelIcon} aria-hidden alt={'Hammer ikon'}/>}
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

const TemaListe = () => (
  <Page
    backUrl={'/'}
    headerBackgroundColor={ettlevColors.green100}
    backgroundColor={ettlevColors.grey50}
    wideMain
    header={
      <>
        <HeadingLarge>Tema</HeadingLarge>

        <ParagraphMedium>
          Et tema omhandler en samling av krav innenfor et avgrenset område, gitt av en samling lover og forskrifter eller interne bestemmelser
        </ParagraphMedium>
      </>
    }>
    <Block {...sectionProps}>
      {codelist.getCodes(ListName.TEMA).map(tema =>
        <TemaCard key={tema.code} tema={tema}/>
      )}
    </Block>
  </Page>
)

const TemaCard = (props: {tema: TemaCode}) => {
  return (
    <FrontCard url={urlForObject(ListName.TEMA, props.tema.code)} width={'255px'}>
      <Block display='flex' width='100%'>
        <TemaBilde code={props.tema} height={'95px'} width={'120px'}/>
        <Block marginLeft={theme.sizing.scale600}>
          <LabelMedium marginBottom={0} $style={{
            wordWrap: 'break-word',
            hyphens: 'auto'
          }}>
            {props.tema.shortName}
          </LabelMedium>
        </Block>
      </Block>
    </FrontCard>
  )
}
