import { ettlevColors } from '@/util/theme/theme'
import { BodyShort, Heading } from '@navikt/ds-react'
import Image from 'next/image'
import { FunctionComponent, ReactNode } from 'react'
import { IconInCircle } from '../icon/icon'

type TInfoBlockProps = { icon: string; alt: string; text: string; color: string }

export const InfoBlock: FunctionComponent<TInfoBlockProps> = (props) => {
  const { icon, alt, text, color } = props

  return (
    <div>
      <div className='w-full flex justify-center items-center'>
        <div className='flex flex-col items-center p-5'>
          <IconInCircle icon={icon} alt={alt} backgroundColor={color} size='4rem' />
          <BodyShort>{text}</BodyShort>
        </div>
      </div>
    </div>
  )
}

type TInfoBlock2Props = {
  icon: string
  alt: string
  title: string
  beskrivelse?: string
  backgroundColor?: string
  children?: ReactNode
}

export const InfoBlock2: FunctionComponent<TInfoBlock2Props> = (props) => {
  const { icon, alt, title, beskrivelse, backgroundColor, children } = props

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        borderWidth: '0.125rem',
        borderStyle: 'solid',
        borderColor: ettlevColors.grey100,
        borderRadius: '0.25rem',
        backgroundColor: backgroundColor || ettlevColors.white,
      }}
    >
      <div className='self-center mx-6'>
        <Image src={icon} alt={alt} width='80' height='80' />
      </div>

      <div className='flex flex-col p-5'>
        <Heading size='small' level='2'>
          {title}
        </Heading>
        <BodyShort className='max-w-sm'>{beskrivelse}</BodyShort>
        {children}
      </div>
    </div>
  )
}
