import { FunctionComponent, ReactNode } from 'react'

type TProps = {
  children?: ReactNode
}

export const DataTextWrapper: FunctionComponent<TProps> = ({ children }) => (
  <div className='p-3 rounded-lg bg-[#EEF6FC] mt-3'>
    {children && children}
    {!children && 'Ikke besvart'}
  </div>
)

export default DataTextWrapper
