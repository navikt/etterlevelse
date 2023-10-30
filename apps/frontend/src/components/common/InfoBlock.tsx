import { ettlevColors } from '../../util/theme'
import { IconInCircle } from './Icon'
import React from 'react'
import { BodyShort, Heading } from '@navikt/ds-react'

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
  <div
    style={{
      width: '100%',
      display: 'flex',
      borderWidth: '2px',
      borderStyle: 'solid',
      borderColor: ettlevColors.grey100,
      borderRadius: '4px',
      backgroundColor: props.backgroundColor || ettlevColors.white,
    }}
  >
    <div className="self-center mx-6">
      <img src={props.icon} alt={props.alt} width={'80px'} height={'80px'} />
    </div>

    <div className="flex flex-col p-5">
      <Heading size="large">
        {props.title}
      </Heading>
      <BodyShort className="max-w-sm">
        {props.beskrivelse}
      </BodyShort>
      {props.children}
    </div>
  </div>
)
