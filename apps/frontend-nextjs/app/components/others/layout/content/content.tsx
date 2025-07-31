import { ReactNode } from 'react'

type TContentLayoutProps = {
  children: ReactNode
}

export const ContentLayout = ({ children }: TContentLayoutProps) => (
  <div className='flex w-full'>{children}</div>
)
