import { Block, BlockProps } from 'baseui/block'
import React, { useState } from 'react'
import { Card, CardOverrides } from 'baseui/card'
import RouteLink from '../components/common/RouteLink'
import { borderColor, marginAll } from '../components/common/Style'
import { theme } from '../util'
import { ParagraphXSmall } from 'baseui/typography'
import { primitives } from '../util/theme'
import { barChart, illustration, lawBook, pencilFill, stepper } from '../components/Images'


const sectionProps: BlockProps = {
  display: 'flex',
  width: '100%',
  justifyContent: 'space-between',
  flexWrap: true
}

export const MainPage = () => {
  return (
    <Block paddingLeft='40px' paddingRight='40px' width='calc(100%-80px)' display='flex' justifyContent='center' marginTop='50px'>
      <Block display='flex' flexDirection='column' width={'1000px'} overrides={{ Block: { props: { role: 'main' } } }}>
        <Block {...sectionProps} overrides={{ Block: { props: { role: 'navigation', 'aria-label': 'Hoved meny' } } }}>
          <SectionCard
            icon={pencilFill} url={'/behandling'} title={'Dokumenter etterlevelse'}
            text={'Fyll ut hvordan du etterlever lover og regler i behandlinger du har ansvar for'} />
          <SectionCard
            icon={lawBook} url={'/krav'} title={'Opprett og vedlikehold krav'}
            text={'Kraveier kan jobbe med nye krav eller forbedre eksisterende krav'} />
          <SectionCard
            icon={barChart} url={'/status'} title={'Se status på etterlevelse i etaten'}
            text={'Se dashboard for status på etterlevelse i NAV, i våre produktområder og avdelinger'} />
          <SectionCard
            icon={stepper} url={'/tema'} title={'Lær mer om etterlevelse'}
            text={'Utforsk temaer for krav i etaten'} />
        </Block>

        <Block {...sectionProps}>
          <Block height='320px' overflow={'hidden'} marginBottom={theme.sizing.scale800}>
            <img style={{ marginTop: '-215px', width: '100%' }} src={illustration} alt='illustrasjon' />
          </Block>
        </Block>
      </Block>
    </Block>
  )
}

const SectionCard = (props: { icon: string, url: string, title: string, text: string }) => (
  <FrontCard url={props.url} width='240px' title={
    <Block display='flex' flexDirection='column' alignItems='center'>
      <Block><img src={props.icon} alt='ikon for kort' height={'40px'} /></Block>
      <Block>{props.title}</Block>
    </Block>
  }>
    <Block  {...({
      display: 'flex',
      width: '100%',
      height: '60px',
      justifyContent: 'center',
      marginTop: theme.sizing.scale500,
    })}>
      <ParagraphXSmall width={'90%'} $style={{ textAlign: 'justify', ...marginAll('0') }}>{props.text}</ParagraphXSmall>
    </Block>
  </FrontCard>
)

export const FrontCard = (props: { width: string, url: string, title?: React.ReactNode, children: React.ReactElement }) => {
  const [hover, setHover] = useState(false)
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <RouteLink href={props.url} hideUnderline>
        <Card overrides={cardOverrides(hover, props.width)} title={props.title}>
          {props.children}
        </Card>
      </RouteLink>
    </div>
  )
}

const cardOverrides = (hover: boolean, width: string): CardOverrides => {
  return {
    Root: {
      style: () => {
        const base = {
          backgroundColor: 'white',
          width,
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
        fontSize: theme.typography.ParagraphMedium.fontSize
      })
    },
    Contents: {
      style: () => ({
        ...marginAll(theme.sizing.scale500)
      })
    },
  } as CardOverrides
}
