interface IPropsTopBottomWrapper {
  children: React.ReactNode
}

/* WIP, vankser rundt <FieldWrapper> */
export const TopBottomWrapper = ({ children }: IPropsTopBottomWrapper) => (
  <div className="py-7">{children}</div>
)

interface IPropsPVKFieldWrapper {
  children: React.ReactNode
}

/* WIP, vankser rundt <FieldWrapper> */
export const PVKFieldWrapper = ({ children }: IPropsPVKFieldWrapper) => (
  <div className="pb-5">{children}</div>
)
