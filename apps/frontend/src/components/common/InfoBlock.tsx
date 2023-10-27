import { ettlevColors, theme } from '../../util/theme'
import { Block } from 'baseui/block'
import { IconInCircle } from './Icon'
import { HeadingXLarge, ParagraphSmall } from 'baseui/typography'
import React from 'react'
import { BodyShort } from '@navikt/ds-react'

export const InfoBlock = (props: { icon: string; alt: string; text: string; color: string }) => (
  <div>
    <div className="w-full flex justify-center items-center">
      <div className="flex flex-col items-center p-5">
        <IconInCircle icon={props.icon} alt={props.alt} backgroundColor={props.color} size={'64px'} />
        <BodyShort>{props.text}</BodyShort>
      </div>
    </div>
  </div>
)

export const InfoBlock2 = (props: { icon: string; alt: string; title: string; beskrivelse?: string; backgroundColor?: string; children?: React.ReactNode }) => (
  <Block
    $style={{
      width: '100%',
      display: 'flex',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: ettlevColors.grey100,
      borderRadius: '4px',
      backgroundColor: props.backgroundColor || ettlevColors.white,
    }}
  >
    <Block alignSelf={'center'} marginLeft={theme.sizing.scale800} marginRight={theme.sizing.scale800}>
      <img src={props.icon} alt={props.alt} width={'80px'} height={'80px'} />
    </Block>

    <Block display={'flex'} flexDirection={'column'} padding={theme.sizing.scale700}>
      <HeadingXLarge marginTop={0} marginBottom={0}>
        {props.title}
      </HeadingXLarge>
      <ParagraphSmall maxWidth={'400px'} marginTop={0}>
        {props.beskrivelse}
      </ParagraphSmall>
      {props.children}
    </Block>
  </Block>
)
