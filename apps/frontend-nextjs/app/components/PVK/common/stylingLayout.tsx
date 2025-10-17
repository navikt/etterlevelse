import { FunctionComponent, ReactNode } from 'react'

type TPropsTopBottomWrapper = {
  children: ReactNode
}

/* WIP, vankser rundt <FieldWrapper> */
export const TopBottomWrapper: FunctionComponent<TPropsTopBottomWrapper> = ({ children }) => (
  <div className='py-7'>{children}</div>
)

type TPropsPVKFieldWrapper = {
  children: ReactNode
}

/* WIP, vansker rundt <FieldWrapper> */
export const PVKFieldWrapper: FunctionComponent<TPropsPVKFieldWrapper> = ({ children }) => (
  <div className='pb-5'>{children}</div>
)
