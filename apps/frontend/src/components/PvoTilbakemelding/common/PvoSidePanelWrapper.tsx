import { FunctionComponent, ReactNode } from 'react'

type TProps = {
  children: ReactNode
}

export const PvoSidePanelWrapper: FunctionComponent<TProps> = ({ children }) => (
  <div className='px-6 py-9 rounded-lg w-full max-w-md bg-[#E3EFF7] mt-20'>{children}</div>
)

export default PvoSidePanelWrapper
