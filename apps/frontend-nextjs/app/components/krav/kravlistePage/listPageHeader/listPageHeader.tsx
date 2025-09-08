import { Heading } from '@navikt/ds-react'
import { FunctionComponent, ReactNode } from 'react'

type TProps = {
  headingText: string
  children?: ReactNode
}

export const ListPageHeader: FunctionComponent<TProps> = ({ headingText, children }) => (
  <div className='w-full flex justify-center'>
    <div className='w-full'>
      <div>
        <div className='flex'>
          <div className='flex-1'>
            <Heading size='medium'>{headingText}</Heading>
          </div>

          <div className='flex justify-end'>{children}</div>
        </div>
      </div>
    </div>
  </div>
)
