interface IProps {
  children?: React.ReactNode
}

export const DataTextWrapper = (props: IProps) => {
  return (
    <div className="p-3 rounded-lg bg-[#EEF6FC] mt-3">
      {props.children && props.children}
      {!props.children && 'Ikke besvart'}
    </div>
  )
}
export default DataTextWrapper
