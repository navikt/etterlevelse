import {useParams} from 'react-router-dom'
import {Block, BlockProps} from 'baseui/block'
import React, {useState} from 'react'
import {HeadingLarge, HeadingXXLarge, LabelMedium, ParagraphMedium} from 'baseui/typography'
import {codelist, ListName, TemaCode} from '../services/Codelist'
import RouteLink, {ObjectLink, urlForObject} from '../components/common/RouteLink'
import {theme} from '../util'
import {gavelIcon, navChevronRightIcon, TemaBilde} from '../components/Images'
import {FrontCard} from './MainPage'
import {Markdown} from '../components/common/Markdown'
import {ettlevColors, maxPageWidth, pageWidth} from '../util/theme'
import Button from '../components/common/Button'
import {useKravFilter} from '../api/KravGraphQLApi'
import {SkeletonPanel} from '../components/common/LoadingSkeleton'
import {PanelLink} from '../components/common/PanelLink'
import {kravNumView} from './KravPage'
import * as _ from 'lodash'
import {faChevronDown, faChevronUp} from '@fortawesome/free-solid-svg-icons'

const sectionProps: BlockProps = {
  display: 'flex',
  width: '100%',
  justifyContent: 'space-between',
  flexWrap: true
}


export const TemaPage = () => {
  const {tema} = useParams<{tema: string}>()

  if (!tema) return <TemaListe/>

  const code = codelist.getCode(ListName.TEMA, tema)
  if (!code) return <>'invalid code'</>

  return <TemaSideNew tema={code}/>
  // return <TemaSide tema={code}/>
}

const TemaSideNew = ({tema}: {tema: TemaCode}) => {
  const lover = codelist.getCodesForTema(tema.code)
  const {data, loading} = useKravFilter({lover: lover.map(c => c.code)})
  const [expand, setExpand] = useState(false)

  return (
    <Block width='100%' overrides={{Block: {props: {role: 'main'}}}} backgroundColor={ettlevColors.grey50} paddingBottom={'200px'}>
      <Block backgroundColor={ettlevColors.green100} display='flex' width='100%' justifyContent='center'
             paddingBottom={'120px'} marginBottom={'-120px'}
      >
        <Block maxWidth={maxPageWidth} width='100%'>

          <Block paddingLeft={'100px'} paddingRight={'100px'} paddingTop={theme.sizing.scale800}>
            <RouteLink href={'/'} hideUnderline>
              <Button startEnhancer={<img alt={'Chevron venstre ikon'} src={navChevronRightIcon} style={{transform: 'rotate(180deg)'}}/>} size='compact' kind='underline-hover'
              > Tilbake</Button>
            </RouteLink>

            <Block width={'100%'} display={'flex'} justifyContent='center'>
              <Block maxWidth={pageWidth} width={'100%'} display={'flex'} flexDirection={'column'}>

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

                <Block alignSelf={'flex-end'} marginBottom={theme.sizing.scale900}>
                  <Button onClick={() => setExpand(!expand)} icon={expand ? faChevronUp : faChevronDown} kind={'underline-hover'}>
                    {expand ? 'Mindre' : 'Mer'} om tema
                  </Button>
                </Block>

              </Block>
            </Block>

          </Block>

        </Block>
      </Block>

      <Block display='flex' width='100%' justifyContent='center'>
        <Block maxWidth={pageWidth} width={'100%'}>
          {loading && <SkeletonPanel count={10}/>}
          {!loading && <Block>
            <HeadingLarge>{data!.krav.numberOfElements} krav</HeadingLarge>
            {data!.krav.content.map(k =>
              <Block key={k.id} marginBottom={'8px'}>
                <PanelLink href={`/krav/${k.kravNummer}/${k.kravVersjon}`}
                           panelIcon={<img src={gavelIcon} aria-hidden alt={'Hammer ikon'}/>}
                           beskrivelse={kravNumView(k)} title={k.navn} flip
                />
              </Block>
            )}
          </Block>}
        </Block>
      </Block>

    </Block>
  )
}

const TemaListe = () => (
  <Block maxWidth={maxPageWidth} width='100%'>
    <Block paddingLeft='40px' paddingRight='40px' width='calc(100%-80px)' display='flex' justifyContent='center'>
      <Block>
        <HeadingLarge>Tema</HeadingLarge>

        <ParagraphMedium marginBottom={theme.sizing.scale2400}>
          Et tema omhandler en samling av krav innenfor et avgrenset område, gitt av en samling lover og forskrifter eller interne bestemmelser
        </ParagraphMedium>

        <Block {...sectionProps}>
          {codelist.getCodes(ListName.TEMA).map(tema =>
            <TemaCard key={tema.code} tema={tema}/>
          )}
        </Block>
      </Block>
    </Block>
  </Block>
)

const TemaCard = (props: {tema: TemaCode}) => {
  return (
    <FrontCard url={urlForObject(ListName.TEMA, props.tema.code)} width={'310px'}>
      <Block display='flex' width='100%'>
        <Block height='126px'>
          <TemaBilde code={props.tema} height={'126px'} width={'160px'}/>
        </Block>
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
