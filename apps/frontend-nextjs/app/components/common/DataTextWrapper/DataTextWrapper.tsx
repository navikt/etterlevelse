import { FunctionComponent, ReactNode } from 'react'
import BodyLongWithLineBreak from '../bodyLongWithLineBreak'

type TProps = {
  children?: ReactNode
  customEmptyMessage?: string
}

export const DataTextWrapper: FunctionComponent<TProps> = ({ children, customEmptyMessage }) => (
  <div className='p-3 rounded-lg bg-[#EEF6FC] mt-3'>
    {children && typeof children === 'string' && (
      <BodyLongWithLineBreak>{children}</BodyLongWithLineBreak>
    )}
    {children && typeof children !== 'string' && children}
    {!children && customEmptyMessage && customEmptyMessage}
    {!children && !customEmptyMessage && 'Ikke besvart'}
  </div>
)

export default DataTextWrapper
