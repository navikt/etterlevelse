import { FunctionComponent, ReactNode } from 'react'

type TProps = {
  children: ReactNode
  // When PVO has left a comment we split the step 50/50 between etterlever content and the comment
  wide?: boolean
}

export const PvkSidePanelWrapper: FunctionComponent<TProps> = ({ children, wide }) => (
  <div className='sticky top-4 min-w-0'>
    <div className={`px-6 py-9 rounded-lg w-full bg-[#E3EFF7] mt-20 ${wide ? '' : 'max-w-md'}`}>
      <div className='overflow-auto h-[90vh] w-full break-words'>{children}</div>
    </div>
  </div>
)
