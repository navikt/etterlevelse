import {Block, BlockProps} from 'baseui/block'
import React, {useState} from 'react'
import {Card, CardOverrides} from 'baseui/card'
import RouteLink, {urlForObject} from '../components/common/RouteLink'
import {borderColor, marginAll} from '../components/common/Style'
import {theme} from '../util'
import {LabelMedium, ParagraphSmall} from 'baseui/typography'
import {primitives} from '../util/theme'
import {Code, codelist, ListName} from '../services/Codelist'
import {barChart, illustration, lawBook, LovBilde, pencilFill} from '../components/Images'


const sectionProps: BlockProps = {
  display: 'flex',
  width: '100%',
  justifyContent: 'space-between',
  flexWrap: true
}

export const MainPage = () => {
  return (
    <Block display='flex' flexDirection='column' width={'1000px'}>
      <Block {...sectionProps}>
        <SectionCard
          icon={pencilFill} url={'/behandling'} title={'Dokumenter etterlevelse'}
          text={'Fyll ut hvordan du etterlever lover og regler i behandlinger du har ansvar for'}/>
        <SectionCard
          icon={lawBook} url={'/krav'} title={'Opprett og vedlikehold krav'}
          text={'Kraveier kan jobbe med nye krav eller forbedre eksisterende krav'}/>
        <SectionCard
          icon={barChart} url={'/behandling'} title={'Se status på etterlevelse i staten'}
          text={'Se dashboard over status på etterlevelse i NAV, i våre produktområder og avdelinger'}/>
      </Block>

      <Block {...sectionProps}>
        <Block height='320px' overflow={'hidden'} marginBottom={theme.sizing.scale800}>
          <img style={{marginTop: '-215px', width: '100%'}} src={illustration} alt='illustrasjon'/>
        </Block>
      </Block>

      <Block {...sectionProps}>
        {codelist.getCodes(ListName.LOV).map(lov =>
          <LawCard key={lov.code} lov={lov}/>
        )}
      </Block>
    </Block>
  )
}

const LawCard = (props: {lov: Code}) => {
  return (
    <FrontCard url={urlForObject(ListName.LOV, props.lov.code)}>
      <Block display='flex' width='100%'>
        <Block height='126px'>
          <LovBilde code={props.lov} height={'126px'} width={'160px'}/>
        </Block>
        <Block marginLeft={theme.sizing.scale600}>
          <LabelMedium marginBottom={0} $style={{
            wordWrap: 'break-word',
            hyphens: 'auto'
          }}>
            {props.lov.shortName}
          </LabelMedium>
        </Block>
      </Block>
    </FrontCard>
  )
}

const SectionCard = (props: {icon: string, url: string, title: string, text: string}) => (
  <FrontCard url={props.url} title={
    <Block display='flex' flexDirection='column' alignItems='center'>
      <Block><img src={props.icon} alt='ikon for kort' height={'42px'}/></Block>
      <Block>{props.title}</Block>
    </Block>
  }>
    <Block  {...({
      display: 'flex',
      width: '100%',
      justifyContent: 'center',
      marginTop: theme.sizing.scale500,
    })}>
      <ParagraphSmall width={'90%'} $style={{textAlign: 'justify', ...marginAll('0')}}>{props.text}</ParagraphSmall>
    </Block>
  </FrontCard>
)

const FrontCard = (props: {url: string, title?: React.ReactNode, children: React.ReactElement}) => {
  const [hover, setHover] = useState(false)
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <RouteLink href={props.url} hideUnderline>
        <Card overrides={cardOverrides(hover)} title={props.title}>
          {props.children}
        </Card>
      </RouteLink>
    </div>
  )
}

const cardOverrides = (hover: boolean): CardOverrides => {
  return {
    Root: {
      style: () => {
        const base = {
          backgroundColor: 'white',
          width: '310px',
          marginBottom: theme.sizing.scale800
        }
        return hover ? {
          ...base,
          ...borderColor(primitives.primary350)
          ,
          boxShadow: '0px 4px 2px -1px rgba(0,0,0,0.7);'
        } : base
      }
    },
    Body: {
      style: () => ({
        marginBottom: 0
      })
    },
    Title: {
      style: () => ({
        fontSize: theme.typography.HeadingXSmall.fontSize
      })
    },
    Contents: {
      style: () => ({
        ...marginAll(theme.sizing.scale500)
      })
    },
  } as CardOverrides
}
