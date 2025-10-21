import { FunctionComponent, ReactNode } from 'react'

type TProps = {
  children: ReactNode
}

export const PvoSidePanelWrapper: FunctionComponent<TProps> = ({ children }) => (
  <div className='sticky top-4 '>
    <div className='px-6 py-9 rounded-lg bg-[#E3EFF7] mt-20'>
      <div className='overflow-auto h-[90vh]'>{children}</div>
    </div>
  </div>
)

export default PvoSidePanelWrapper
