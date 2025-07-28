import { ReactNode } from 'react'

interface IMarginTop {
  marginTop?: boolean
}

interface IMarginBottom {
  marginBottom?: boolean
}

interface IID {
  id?: string
}

interface IPropsFieldWrapper extends IMarginTop, IMarginBottom, IID {
  children: ReactNode
  full?: boolean
}

export const FieldWrapper = ({
  children,
  marginTop,
  marginBottom,
  id,
  full,
}: IPropsFieldWrapper) => (
  <div
    className={`${marginBottom ? 'mb-5' : ''} ${marginTop ? 'mt-5' : ''} ${full ? 'flex-1' : ''}`}
    id={id}
  >
    {children}
  </div>
)
