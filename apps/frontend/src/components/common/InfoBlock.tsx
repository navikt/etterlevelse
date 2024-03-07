import { BodyShort, Heading } from '@navikt/ds-react'
import React from 'react'
import { ettlevColors } from '../../util/theme'
import { IconInCircle } from './Icon'

export const InfoBlock = (props: { icon: string; alt: string; text: string; color: string }) => (
  <div>
    <div className="w-full flex justify-center items-center">
      <div className="flex flex-col items-center p-5">
        <IconInCircle icon={props.icon} alt={props.alt} backgroundColor={props.color} size="4rem" />
        <BodyShort>{props.text}</BodyShort>
      </div>
    </div>
  </div>
)

export const InfoBlock2 = (props: {
  icon: string
  alt: string
  title: string
  beskrivelse?: string
  backgroundColor?: string
  children?: React.ReactNode
}) => (
  <div
    style={{
      width: '100%',
      display: 'flex',
      borderWidth: '0.125rem',
      borderStyle: 'solid',
      borderColor: ettlevColors.grey100,
      borderRadius: '0.25rem',
      backgroundColor: props.backgroundColor || ettlevColors.white,
    }}
  >
    <div className="self-center mx-6">
      <img src={props.icon} alt={props.alt} width="5rem" height="5rem" />
    </div>

    <div className="flex flex-col p-5">
      <Heading size="small" level="2">
        {props.title}
      </Heading>
      <BodyShort className="max-w-sm">{props.beskrivelse}</BodyShort>
      {props.children}
    </div>
  </div>
)
