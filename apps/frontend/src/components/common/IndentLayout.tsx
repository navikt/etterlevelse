import { ReactNode } from 'react'

type TProps = {
  children: ReactNode
}

export const IndentLayoutTextField = ({ children }: TProps) => (
  <div className='mt-1 pl-4'>{children}</div>
)

export const FieldRadioLayout = ({ children }: TProps) => (
  <div className='my-5 max-w-[75ch]'>{children}</div>
)
