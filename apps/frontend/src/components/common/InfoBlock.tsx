import {ettlevColors, theme} from '../../util/theme'
import {Block} from 'baseui/block'
import {IconInCircle} from './Icon'
import {HeadingSmall, ParagraphSmall} from 'baseui/typography'
import React from 'react'


export const InfoBlock = (props: {icon: string, alt: string, text: string, color: string}) => (
  <Block $style={{
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'solid',
    borderColor: ettlevColors.grey100,
    borderRadius: '4px'
  }}>
    <Block display={'flex'} flexDirection={'column'} alignItems={'center'} padding={theme.sizing.scale700}>
      <IconInCircle icon={props.icon} alt={props.alt} backgroundColor={props.color} size={'64px'}/>
      <ParagraphSmall marginBottom={0}>{props.text}</ParagraphSmall>
    </Block>
  </Block>
)

export const InfoBlock2 = (props: {icon: string, alt: string, title: string, beskrivelse?: string, children?: React.ReactNode}) => (
  <Block $style={{
    width: '100%',
    display: 'flex',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: ettlevColors.grey100,
    borderRadius: '4px',
    backgroundColor: ettlevColors.white
  }}>

    <Block alignSelf={'center'} marginLeft={theme.sizing.scale800} marginRight={theme.sizing.scale800}>
      <img src={props.icon} alt={props.alt} width={'80px'} height={'80px'}/>
    </Block>

    <Block display={'flex'} flexDirection={'column'} padding={theme.sizing.scale700}>
      <HeadingSmall marginTop={0} marginBottom={0}>{props.title}</HeadingSmall>
      <ParagraphSmall maxWidth={'400px'} marginTop={0}>{props.beskrivelse}</ParagraphSmall>
      {props.children}
    </Block>

  </Block>
)
