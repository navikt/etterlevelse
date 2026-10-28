import { FunctionComponent, ReactNode } from 'react'

type TProps = {
  children: ReactNode
}

const PvoSidePanelWrapper: FunctionComponent<TProps> = ({ children }) => (
  <div className='sticky top-4 '>
    <div className='px-4 py-9 rounded-lg bg-[#E3EFF7] mt-20'>
      <div className='pvo-sticky-toolbar overflow-auto h-[90vh] px-2'>{children}</div>
    </div>
  </div>
)

export default PvoSidePanelWrapper
