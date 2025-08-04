import { FunctionComponent, ReactNode } from 'react'

type TContentLayoutProps = {
  children: ReactNode
}

type TMainSidePanelProps = {
  children: ReactNode
  hasSidePanel?: boolean
}

export const ContentLayout: FunctionComponent<TContentLayoutProps> = ({ children }) => (
  <div className='flex w-full'>{children}</div>
)

export const MainPanelLayout: FunctionComponent<TMainSidePanelProps> = ({
  children,
  hasSidePanel,
}) => <div className={`pr-14 w-full ${hasSidePanel ? 'max-w-[849px]' : ''}`}>{children}</div>
