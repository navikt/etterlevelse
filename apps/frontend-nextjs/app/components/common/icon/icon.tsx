export const IconInCircle = (props: {
  icon: string
  alt: string
  size: string
  backgroundColor: string
}) => {
  const { icon, alt, size, backgroundColor } = props

  return (
    <div className={`bg-[${backgroundColor}] rounded-full p-[7.5%]`}>
      <img src={icon} alt={alt} width={size} />
    </div>
  )
}
