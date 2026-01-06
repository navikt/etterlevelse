import { Detail, Tag } from '@navikt/ds-react'
import { FunctionComponent } from 'react'

interface IInnsendingTagProps {
  antallInnsendingTilPvo: number
}

export const InnsendingTag: FunctionComponent<IInnsendingTagProps> = ({
  antallInnsendingTilPvo,
}) => {
  return (
    <Tag className='bg-[#F8EAEF] h-fit' variant='error'>
      <div className={'flex items-center'}>
        <Detail className='whitespace-nowrap'>{antallInnsendingTilPvo}. innsending</Detail>
      </div>
    </Tag>
  )
}
