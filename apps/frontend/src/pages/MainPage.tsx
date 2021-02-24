import {Block, BlockProps} from 'baseui/block'
import React, {useState} from 'react'
import pencilFill from '../resources/icons/pencil-fill.svg'
import lawBook from '../resources/icons/law-book-shield.svg'
import barChart from '../resources/icons/bar-chart.svg'
import illustration from '../resources/giammarco-boscaro-zeH-ljawHtg-unsplash.jpg'
import {Card, CardOverrides} from 'baseui/card'
import RouteLink, {urlForObject} from '../components/common/RouteLink'
import {borderColor, marginAll} from '../components/common/Style'
import {theme} from '../util'
import {LabelMedium, LabelSmall} from 'baseui/typography'
import {primitives} from '../util/theme'
import {Code, codelist, ListName} from '../services/Codelist'


import archiveImage from '../resources/img/archive.png'
import archive2Image from '../resources/img/archive2.png'
import hammerImage from '../resources/img/hammer.png'
import keyboardImage from '../resources/img/keyboard.png'
import lampImage from '../resources/img/lamp.png'
import peopleImage from '../resources/img/people.png'
import scalesImage from '../resources/img/scales.png'
import cameraImage from '../resources/img/camera.png'
import guardianImage from '../resources/img/guardian.png'
import navImage from '../resources/img/nav-logo-red.svg'
import moneyImage from '../resources/img/money.png'
import defaultImage from '../resources/img/book.png'

export const MainPage = () => {
  return (
    <Block display='flex' flexDirection='column' width={'1100px'}>
      <Block display='flex' width='100%' justifyContent={'space-between'}>
        <ContentCard
          icon={pencilFill} url={'/behandling'} title={'Dokumenter etterlevelse'}
          text={'Fyll ut hvordan du etterlever lover og regler i behandlinger du har ansvar for'}/>
        <ContentCard
          icon={lawBook} url={'/krav'} title={'Opprett og vedlikehold krav'}
          text={'Fyll ut hvordan du etterlever lover og regler i behandlinger du har ansvar for'}/>
        <ContentCard
          icon={barChart} url={'/behandling'} title={'Se status på etterlevelse i staten'}
          text={'Fyll ut hvordan du etterlever lover og regler i behandlinger du har ansvar for'}/>
      </Block>

      <Block width={'100%'} marginTop={theme.sizing.scale600} marginBottom={theme.sizing.scale600}>
        <Block height='345px' overflow={'hidden'}>
          <img style={{marginTop: '-235px', width: '100%'}} src={illustration} alt='illustrasjon'/>
        </Block>
      </Block>

      <Block display='flex' justifyContent='space-between' flexWrap width='100%'>
        {codelist.getCodes(ListName.LOV).map(lov =>
          <Block key={lov.code} width='350px' marginBottom={theme.sizing.scale400}>
            <LawCard lov={lov}/>
          </Block>
        )}
      </Block>
    </Block>
  )
}

const bilder: {[id: string]: string} = {
  ARKIV: archiveImage,
  FORSKRIFT_EFORVALTNING: keyboardImage,
  FOLKETRYGDLOVEN: peopleImage,
  FORSKRIFT_UU: lampImage,
  FORVALTNINGSLOVEN: scalesImage,
  PERSONOPPLYSNINGSLOVEN: hammerImage,

  FORSKRIFT_OFFENTLEG_ARKIV: archive2Image,
  FORSKRIFT_OKONOMIREGLEMENTET: moneyImage,
  NAV_LOVEN: navImage,
  SIKKERHETSLOVEN: cameraImage,
  VERGEMAALSLOVEN: guardianImage,
}

const LawCard = (props: {lov: Code}) => {
  return (
    <FrontCard url={urlForObject(ListName.LOV, props.lov.code)}>
      <Block display='flex' width='100%'>
        <Block height='126px'>
          <img src={bilder[props.lov.code] || defaultImage} width='160px' height='126px' style={{objectFit: 'cover'}}/>
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

const cardOverrides = (hover: boolean): CardOverrides => {
  return {
    Root: {
      style: () => {
        const base = {
          backgroundColor: 'white',
          width: '352px',
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
    Contents: {
      style: () => ({
        ...marginAll(theme.sizing.scale500)
      })
    },
  } as CardOverrides
}

const contentBlockProps: BlockProps = {
  display: 'flex',
  width: '100%',
  justifyContent: 'center',
  marginTop: theme.sizing.scale500,
}


const ContentCard = (props: {icon: string, url: string, title: string, text: string}) => (
  <FrontCard url={props.url} title={
    <Block display='flex' flexDirection='column' alignItems='center'>
      <Block><img src={props.icon} alt='ikon for kort' height={'42px'}/></Block>
      <Block>{props.title}</Block>
    </Block>
  }>
    <Block  {...contentBlockProps}>
      <LabelSmall width={'90%'} $style={{textAlign: 'justify'}}>{props.text}</LabelSmall>
    </Block>
  </FrontCard>
)

const FrontCard = (props: {url: string, title?: React.ReactNode, children: React.ReactElement}) => {
  const [hover, setHover] = useState(false)
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <RouteLink href={props.url} hideUnderline>
        <Card overrides={cardOverrides(hover)}
              title={props.title}>
          {props.children}
        </Card>
      </RouteLink>
    </div>
  )
}
