import { FunctionComponent, ReactNode } from 'react'

type TContentLayoutProps = {
  children: ReactNode
}

type TMainSidePanelProps = {
  children: ReactNode
  hasSidePanel?: boolean
}

type TSidePanelLayoutProps = {
  children: ReactNode
}

type TStickyFooterButtonLayoutProps = {
  children: ReactNode
}

export const ContentLayout: FunctionComponent<TContentLayoutProps> = ({ children }) => (
  <div className='flex w-full'>{children}</div>
)

export const MainPanelLayout: FunctionComponent<TMainSidePanelProps> = ({
  children,
  hasSidePanel,
}) => <div className={`pr-14 w-full ${hasSidePanel ? 'max-w-[849px]' : ''}`}>{children}</div>

export const StickyFooterButtonLayout = ({ children }: TStickyFooterButtonLayoutProps) => (
  <div className='z-10 flex flex-col w-full items-center mt-5 button_container sticky bottom-0  bg-white'>
    <div className='w-full max-w-7xl py-4 px-4 border-t-2 z-2'>
      <div className='flex w-full gap-2 justify-evenly items-end'> {children}</div>
    </div>
  </div>
)

export const SidePanelLayout = ({ children }: TSidePanelLayoutProps) => (
  // Don't remove this div. Sticky will not work without it.
  <div>
    <div className='sticky top-4'>
      <div className='max-w-lg w-full border-l-2 border-gray-200 pl-3'>
        <div className='overflow-auto h-[90vh]'>{children}</div>
      </div>
    </div>
  </div>
)
