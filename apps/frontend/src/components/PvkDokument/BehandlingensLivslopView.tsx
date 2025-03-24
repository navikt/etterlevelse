interface IProps {
  test?: string
}

export const BehandlingensLivslopView = (props: IProps) => {
  const { test } = props

  return (
    <div>
      <div>{test}</div>
    </div>
  )
}
export default BehandlingensLivslopView
