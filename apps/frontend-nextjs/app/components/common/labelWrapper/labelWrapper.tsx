import { FunctionComponent, ReactNode } from 'react'

type TProps = {
  children: ReactNode
}

export const LabelWrapper: FunctionComponent<TProps> = ({ children }) => (
  <div className='mb-4'>{children}</div>
)
