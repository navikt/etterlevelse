import {ettlevColors, theme} from '../../util/theme'
import {Block} from 'baseui/block'
import {IconInCircle} from './Icon'
import {ParagraphSmall} from 'baseui/typography'
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
