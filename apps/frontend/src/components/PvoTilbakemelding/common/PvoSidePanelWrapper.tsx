interface IProps {
  children: React.ReactNode
}

export const PvoSidePanelWrapper = (props: IProps) => {
  return (
    <div className="px-6 py-9 rounded-lg w-full max-w-md bg-[#E3EFF7] mt-20">{props.children}</div>
  )
}

export default PvoSidePanelWrapper
