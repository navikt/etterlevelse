import { ReactNode } from 'react'

type TMainSidePanelProps = {
  children: ReactNode
}

type TSidePanelLayoutProps = {
  children: ReactNode
}

type TContentLayoutProps = {
  children: ReactNode
}

export const MainPanelLayout = ({ children }: TMainSidePanelProps) => (
  <div className='pr-14 w-full'>{children}</div>
)

export const SidePanelLayout = ({ children }: TSidePanelLayoutProps) => (
  <div className='max-w-sm w-full border-l-2 border-gray-200 pl-3'>{children}</div>
)

export const ContentLayout = ({ children }: TContentLayoutProps) => (
  <div className='flex w-full'>{children}</div>
)
