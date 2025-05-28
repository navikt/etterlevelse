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
  // Don't remove this div. Sticky will not work without it.
  <div>
    <div className='sticky top-4'>
      <div className='max-w-lg w-full border-l-2 border-gray-200 pl-3'>
        <div className='overflow-auto h-[90vh]'>{children}</div>
      </div>
    </div>
  </div>
)

export const ContentLayout = ({ children }: TContentLayoutProps) => (
  <div className='flex w-full'>{children}</div>
)
