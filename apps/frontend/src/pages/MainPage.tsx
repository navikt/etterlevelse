import {Block, BlockProps} from 'baseui/block'
import React, {useState} from 'react'
import pencilFill from '../resources/icons/pencil-fill.svg'
import lawBook from '../resources/icons/law-book-shield.svg'
import barChart from '../resources/icons/bar-chart.svg'
import illustration from '../resources/giammarco-boscaro-zeH-ljawHtg-unsplash.jpg'
import {Card, CardOverrides, StyledBody} from 'baseui/card'
import RouteLink from '../components/common/RouteLink'
import {borderColor, marginAll} from '../components/common/Style'
import {theme} from '../util'
import {LabelSmall} from 'baseui/typography'
import {primitives} from '../util/theme'

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

      <Block width={'100%'}>
        <Block height='345px' overflow={'hidden'}
               marginLeft={theme.sizing.scale200}
               marginRight={theme.sizing.scale200}>
          <img style={{marginTop: '-235px', width: '100%'}} src={illustration} alt='illustrasjon'/>
        </Block>
      </Block>
    </Block>
  )
}

const cardOverrides = (hover: boolean) => {
  return {
    Root: {
      style: () => {
        const base = {
          backgroundColor: 'white',
          width: '345px',
          margin: theme.sizing.scale200,
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
    Title: {
      style: () => ({})
    }
  } as CardOverrides
}

const contentBlockProps: BlockProps = {
  display: 'flex',
  width: '100%',
  justifyContent: 'center',
  marginTop: theme.sizing.scale500,
}

const ContentCard = (props: {icon: string, url: string, title: string, text: string}) => {
  const [hover, setHover] = useState(false)
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <RouteLink href={props.url} hideUnderline>
        <Card overrides={cardOverrides(hover)}
              title={
                <Block display='flex' flexDirection='column' alignItems='center'>
                  <Block><img src={props.icon} alt='ikon for kort' height={'42px'}/></Block>
                  <Block>{props.title}</Block>
                </Block>
              }>
          <StyledBody>
            <Block  {...contentBlockProps}>
              <LabelSmall width={'90%'} $style={{textAlign: 'justify'}}>{props.text}</LabelSmall>
            </Block>
          </StyledBody>
        </Card>
      </RouteLink>
    </div>
  )
}
