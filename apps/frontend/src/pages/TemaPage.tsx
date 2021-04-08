import {useParams} from 'react-router-dom'
import {Block, BlockProps} from 'baseui/block'
import React from 'react'
import {HeadingLarge, HeadingMedium, HeadingSmall, HeadingXSmall, LabelMedium, ParagraphMedium} from 'baseui/typography'
import {codelist, ListName, TemaCode} from '../services/Codelist'
import {ObjectLink, urlForObject} from '../components/common/RouteLink'
import {theme} from '../util'
import {KravFilterTable} from '../components/common/KravFilterTable'
import {TemaBilde} from '../components/Images'
import {FrontCard} from './MainPage'
import {Markdown} from '../components/common/Markdown'

const sectionProps: BlockProps = {
  display: 'flex',
  width: '100%',
  justifyContent: 'space-between',
  flexWrap: true
}


export const TemaPage = () => {
  const {tema} = useParams<{tema: string}>()

  if (!tema) {
    return (<Block paddingLeft='40px' paddingRight='40px' width='calc(100%-80px)' display='flex' justifyContent='center'>
    <Block >
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
    </Block>)
  }

  const code = codelist.getCode(ListName.TEMA, tema)
  if (!code) return <>'invalid code'</>

  const lover = codelist.getCodesForTema(tema)

  return (
    <Block width='100%'>
      <Block display='flex' justifyContent='space-between'>
        <Block>
          <HeadingMedium marginTop={0}>{code.shortName}</HeadingMedium>
          <Markdown source={code.description}/>
        </Block>
        <Block>
          <Block marginLeft={theme.sizing.scale400}>
            <TemaBilde code={code} ellipse height={'220px'}/>
          </Block>

          <Block>
            {lover.map(lov =>
              <Block key={lov.code}>
                <HeadingXSmall marginTop={theme.sizing.scale400} marginBottom={theme.sizing.scale200}>Lov: {lov.shortName}</HeadingXSmall>
                <ParagraphMedium>
                  <ObjectLink type={ListName.LOV} id={lov.code}>Lovside</ObjectLink>
                </ParagraphMedium>
              </Block>
            )}
          </Block>
        </Block>
      </Block>
      <Block marginTop={theme.sizing.scale1200}>
        <Block>
          <HeadingSmall marginBottom={theme.sizing.scale200}>Krav</HeadingSmall>
          <KravFilterTable filter={{lover: lover.map(c => c.code)}} exclude={['avdeling', 'underavdeling', 'regelverk']}/>
        </Block>
      </Block>
    </Block>
  )
}

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
