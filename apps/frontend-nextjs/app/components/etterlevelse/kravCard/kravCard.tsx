import { warningAlert } from '@/components/others/images/images'
import { Detail } from '@navikt/ds-react'
import Image from 'next/image'
import { FunctionComponent } from 'react'

type TProps = { warningMessage: string }

export const ShowWarningMessage: FunctionComponent<TProps> = ({ warningMessage }) => (
  <div className='flex items-center gap-2'>
    <Image src={warningAlert} width='18' height='18' alt='warning icon' />
    <Detail className='whitespace-nowrap'>{warningMessage}</Detail>
  </div>
)
